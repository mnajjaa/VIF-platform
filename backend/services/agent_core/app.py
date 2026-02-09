import time
from pathlib import Path

import yaml
from fastapi import FastAPI
from pydantic import BaseModel, Field

from agent_factory import AgentFactory

app = FastAPI()

# Load config ONCE (support running from repo root or packaged agent dir)
_BASE = Path(__file__).resolve().parent
_CANDIDATES = [
    _BASE / "agent_config.yaml",
    _BASE / "config.yaml",
    _BASE.parent / "agent_config.yaml",
    _BASE.parent / "config.yaml",
]
_CONFIG_PATH = next((p for p in _CANDIDATES if p.exists()), None)
if not _CONFIG_PATH:
    raise FileNotFoundError(
        "No config file found. Looked for agent_config.yaml/config.yaml in app dir and parent."
    )
with _CONFIG_PATH.open() as f:
    config = yaml.safe_load(f)


def _resolve_schema_path(raw_path: str) -> str:
    path = Path(raw_path)
    if not path.is_absolute():
        return str((_CONFIG_PATH.parent / path).resolve())

    if path.exists():
        return str(path)

    # Backward-compatible fallback for host-specific absolute paths in generated configs.
    fallback = _CONFIG_PATH.parent / "schemas" / path.name
    if fallback.exists():
        return str(fallback.resolve())
    return str(path)


schemas_cfg = config.get("schemas")
if isinstance(schemas_cfg, dict):
    for key in ("input", "output"):
        if schemas_cfg.get(key):
            schemas_cfg[key] = _resolve_schema_path(schemas_cfg[key])

agent = AgentFactory().create(config)


class RunRequest(BaseModel):
    trace_id: str
    payload: dict
    metadata: dict = Field(default_factory=dict)


@app.get("/")
def health():
    return {"status": "ok", "agent": config.get("name")}

@app.post("/run")
def run_agent(req: RunRequest):
    start = time.time()
    try:
        return agent.run(
            input_data=req.payload,
            metadata=req.metadata,
            trace_id=req.trace_id,
        )
    except Exception as e:
        latency_ms = int((time.time() - start) * 1000)
        return {
            "trace_id": req.trace_id,
            "status": "error",
            "result": {"error": str(e)},
            "metrics": {
                "tokens": 0,
                "latency_ms": latency_ms,
            },
        }
