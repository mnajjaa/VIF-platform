from abc import ABC, abstractmethod
from typing import Dict, Any

class Tool(ABC):
    name: str
    description: str
    parameters: Dict[str, Any] = {}  # JSON Schema for tool parameters

    @abstractmethod
    def run(self, **kwargs) -> str:
        pass

    def to_openai_tool(self) -> Dict[str, Any]:
        """
        Convert tool to OpenAI tool-calling format.
        `parameters` can be a JSON Schema properties dict or a full schema object.
        """
        params = self.parameters or {}
        if "type" in params and "properties" in params:
            parameters_schema = params
        else:
            parameters_schema = {
                "type": "object",
                "properties": params,
                "required": list(params.keys()),
            }
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": parameters_schema,
            }
        }
