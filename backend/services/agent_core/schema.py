import json
from pathlib import Path
from typing import Any, Dict, Union


def load_schema(path: Union[str, Path]) -> Dict[str, Any]:
    schema_path = Path(path)
    if not schema_path.exists():
        raise FileNotFoundError(f"Schema not found: {schema_path}")
    with schema_path.open() as f:
        return json.load(f)


def build_schema_system_prompt(schema: Dict[str, Any]) -> Dict[str, str]:
    schema_text = json.dumps(schema, indent=2, sort_keys=True)
    return {
        "role": "system",
        "content": (
            "You must output JSON that strictly matches this schema. "
            "Output JSON only, with no extra text.\n\n"
            f"Schema:\n{schema_text}"
        ),
    }
