import json
import time
import uuid
from typing import Optional, Dict, Any

from jsonschema import validate
from jsonschema.exceptions import ValidationError

from schema import build_schema_system_prompt


def _strip_code_fences(text: str) -> str:
    stripped = text.strip()
    if not stripped.startswith("```"):
        return text

    lines = stripped.splitlines()
    if len(lines) < 2:
        return text

    if not lines[0].startswith("```"):
        return text

    if not lines[-1].strip().startswith("```"):
        return text

    return "\n".join(lines[1:-1]).strip()


def _parse_json_output(text: str) -> Any:
    if text is None:
        raise ValueError("Invalid output: empty response")

    cleaned = _strip_code_fences(text).strip()
    if not cleaned:
        raise ValueError("Invalid output: empty response")

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    decoder = json.JSONDecoder()
    for idx, ch in enumerate(cleaned):
        if ch not in "{[":
            continue
        try:
            value, _ = decoder.raw_decode(cleaned[idx:])
            return value
        except json.JSONDecodeError:
            continue

    snippet = cleaned[:200].replace("\n", "\\n")
    raise ValueError(
        "Invalid output: could not parse JSON. "
        f"Response starts with: {snippet}"
    )


class Agent:
    def __init__(self, name, llm, prompt, memory, tools, input_schema=None, output_schema=None):
        self.name = name
        self.llm = llm
        self.prompt = prompt
        self.memory = memory
        self.tools = {tool.name: tool for tool in tools}
        self.input_schema = input_schema
        self.output_schema = output_schema

    def _validate(self, schema: Optional[Dict[str, Any]], data: Any, label: str) -> None:
        if not schema:
            return
        try:
            validate(instance=data, schema=schema)
        except ValidationError as e:
            raise ValueError(f"Invalid {label}: {e.message}") from e

    def run(
        self,
        input_data: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        trace_id: Optional[str] = None,
        max_iterations: int = 5,
        **kwargs,
    ) -> Dict[str, Any]:
        if input_data is None:
            input_data = {}
        if hasattr(self.memory, "clear"):
            self.memory.clear()

        self._validate(self.input_schema, input_data, "input")

        render_vars = dict(kwargs)
        render_vars.setdefault("payload", input_data)
        if metadata is not None:
            render_vars.setdefault("metadata", metadata)

        prompt_messages = self.prompt.render(**render_vars)

        messages = []
        if self.output_schema:
            messages.append(build_schema_system_prompt(self.output_schema))
        messages.extend(prompt_messages)
        messages.extend(self.memory.get())

        tool_schemas = (
            [tool.to_openai_tool() for tool in self.tools.values()]
            if self.tools
            else None
        )

        iteration = 0
        start = time.time()
        last_usage = None

        while iteration < max_iterations:
            response = self.llm.generate(messages, tools=tool_schemas)
            last_usage = getattr(response, "usage", None)
            assistant_message = response.choices[0].message

            # ---------------------------
            # Tool calling
            # ---------------------------
            if assistant_message.tool_calls:
                messages.append({
                    "role": "assistant",
                    "content": assistant_message.content or "",
                    "tool_calls": [
                        {
                            "id": tc.id,
                            "type": "function",
                            "function": {
                                "name": tc.function.name,
                                "arguments": tc.function.arguments,
                            },
                        }
                        for tc in assistant_message.tool_calls
                    ],
                })

                for tool_call in assistant_message.tool_calls:
                    result = self._execute_tool(tool_call)

                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "name": tool_call.function.name,
                        "content": result,
                    })

                # Keep tool-call exchange request-local. Persisting tool-role entries
                # in memory can break subsequent requests (orphaned tool messages).

                iteration += 1
                continue

            # ---------------------------
            # Final answer
            # ---------------------------
            final_text = assistant_message.content or ""

            self.memory.add({
                "role": "assistant",
                "content": final_text,
            })

            structured_output = _parse_json_output(final_text)

            self._validate(self.output_schema, structured_output, "output")

            latency_ms = int((time.time() - start) * 1000)
            tokens = 0
            if last_usage is not None:
                tokens = getattr(last_usage, "total_tokens", None)
                if tokens is None and isinstance(last_usage, dict):
                    tokens = last_usage.get("total_tokens", 0)
                if tokens is None:
                    tokens = 0

            return {
                "trace_id": trace_id or str(uuid.uuid4()),
                "status": "success",
                "result": structured_output,
                "metrics": {
                    "tokens": tokens,
                    "latency_ms": latency_ms,
                },
            }

        raise RuntimeError("Max iterations reached")

    def _execute_tool(self, tool_call) -> str:
        """
        Execute a single tool call.
        """
        tool_name = tool_call.function.name

        try:
            arguments = json.loads(tool_call.function.arguments)
        except json.JSONDecodeError as e:
            return f"Error: Invalid JSON arguments - {str(e)}"

        if tool_name not in self.tools:
            available = ", ".join(self.tools.keys())
            return f"Error: Tool '{tool_name}' not found. Available: {available}"

        try:
            tool_instance = self.tools[tool_name]
            result = tool_instance.run(**arguments)
            if isinstance(result, (dict, list)):
                return json.dumps(result)
            if result is None:
                return "null"
            return str(result)
        except Exception as e:
            return f"Error executing {tool_name}: {str(e)}"
