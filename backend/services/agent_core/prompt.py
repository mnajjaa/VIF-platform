from jinja2 import Template
import mlflow


def resolve_prompt(prompt_config: dict) -> list[dict]:
    prompt_type = prompt_config["type"]

    if prompt_type == "inline":
        return prompt_config["messages"]

    if prompt_type == "mlflow":
        template = _load_prompt_mlflow(prompt_config["uri"])
        return _normalize_prompt_template(template)

    raise ValueError(f"Unsupported prompt type: {prompt_type}")


def _load_prompt_mlflow(uri: str):
    """
    Uses MLflow GenAI Prompt Registry.
    """
    try:
        prompt = mlflow.genai.load_prompt(uri)
        print(prompt.template)

        # prompt.template is often a string, but may be structured
        return prompt.template

    except Exception as e:
        raise RuntimeError(f"Failed to load MLflow prompt {uri}: {e}")


def _normalize_prompt_template(template) -> list[dict]:
    if isinstance(template, list):
        return template
    if isinstance(template, dict) and "messages" in template:
        return template["messages"]
    if isinstance(template, str):
        return [{"role": "system", "content": template}]
    raise ValueError(f"Unsupported prompt template type: {type(template)}")

class Prompt:
    def __init__(self, messages: list[dict]):
        self.templates = [
            {
                "role": msg["role"],
                "template": Template(msg["content"])
            }
            for msg in messages
        ]

    def render(self, **kwargs) -> list[dict]:
        return [
            {
                "role": t["role"],
                "content": t["template"].render(**kwargs)
            }
            for t in self.templates
        ]
