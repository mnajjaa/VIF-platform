import os
from abc import ABC, abstractmethod
from typing import Optional, List, Dict
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

class BaseLLM(ABC):
    @abstractmethod
    def generate(self, messages: list[str]) -> str:
        pass

class OpenAILLM(BaseLLM):
    def __init__(
        self,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ):
        """
        Initialize OpenAI LLM provider.
        
        Args:
            model: Model name (e.g., "gpt-4", "gpt-3.5-turbo")
            temperature: Sampling temperature (0-2)
            max_tokens: Maximum tokens in response
        """
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = model or os.getenv("OPENAI_MODEL", "gpt-4")
        self.temperature = temperature if temperature is not None else float(os.getenv("OPENAI_TEMPERATURE", 0.7))
        self.max_tokens = max_tokens or int(os.getenv("OPENAI_MAX_TOKENS", 2048))

    def generate(self, messages: list[dict], tools: Optional[List[Dict]] = None):
        """
        Generate response with native function calling support.
        
        Args:
            messages: Chat messages
            tools: List of tool schemas in OpenAI format
            
        Returns:
            Full response object (contains tool_calls if any)
        """
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens
        }

        if tools:
            payload["tools"] = tools
            payload["tool_choice"] = "auto"

        response = self.client.chat.completions.create(**payload)
        return response


# Backwards-compatible alias
OpenAIProvider = OpenAILLM
