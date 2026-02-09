from .base import Tool
import importlib.util
from pathlib import Path

def load_tool(tool_path: Path):
    spec = importlib.util.spec_from_file_location(tool_path.stem, tool_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    class RuntimeTool(Tool):
        name = module.TOOL_META["name"]
        description = module.TOOL_META["description"]
        parameters = module.TOOL_META.get("parameters", {})

        def run(self, **kwargs):
            return module.run(**kwargs)

    return RuntimeTool