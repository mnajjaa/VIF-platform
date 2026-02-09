from llm_providers import OpenAILLM
from memory import BufferMemory
from prompt import Prompt, resolve_prompt
from agent import Agent
from tools.registry import TOOL_REGISTRY
from schema import load_schema

class AgentFactory:
    """Factory for creating Agent instances from YAML configuration"""

    def create(self, config: dict) -> Agent:
  
        llm = self._build_llm(config["llm"])
        memory = self._build_memory(config.get("memory"))
        prompt = self._build_prompt(config["prompt"])
        tools = self._build_tools(config.get("tools", []))
        input_schema, output_schema = self._load_schemas(config.get("schemas", {}))

        return Agent(
            name=config["name"],
            llm=llm,
            prompt=prompt,
            memory=memory,
            tools=tools,
            input_schema=input_schema,
            output_schema=output_schema
        )

    def _build_llm(self, llm_cfg):
       
        provider = llm_cfg.get("provider")
        
        if provider == "openai":
            return OpenAILLM(
                model=llm_cfg["model"],
                temperature=llm_cfg["temperature"],
                max_tokens=llm_cfg["max_tokens"]
            )
        
        # Support other providers in future
        raise ValueError(
            f"Unsupported LLM provider: {provider}. "
            f"Currently supports: openai"
        )

    def _build_memory(self, mem_cfg):
        
        if not mem_cfg:
            return BufferMemory(max_messages=5)

        if mem_cfg.get("type") == "buffer":
            return BufferMemory(mem_cfg.get("max_messages", 5))

        raise ValueError(f"Unsupported memory type: {mem_cfg.get('type')}")

    def _build_prompt(self, prompt_cfg):
        
        prompt_text = resolve_prompt(prompt_cfg)
        return Prompt(prompt_text)

    def _load_schemas(self, schemas_cfg):
        if not schemas_cfg:
            return None, None

        input_path = schemas_cfg.get("input")
        output_path = schemas_cfg.get("output")

        if not input_path or not output_path:
            raise ValueError("Both input and output schemas must be provided in config.schemas")

        return load_schema(input_path), load_schema(output_path)

    def _build_tools(self, tools_cfg):
       
        tools = []
        for tool_cfg in tools_cfg:
            tool_type = tool_cfg.get("type")
            
            if tool_type not in TOOL_REGISTRY:
                raise ValueError(
                    f"Tool type '{tool_type}' not found in registry. "
                    f"Available: {list(TOOL_REGISTRY.keys())}"
                )
            
            tool_cls = TOOL_REGISTRY[tool_type]
            tool_instance = tool_cls(**tool_cfg.get("config", {}))
            tools.append(tool_instance)
        
        return tools
