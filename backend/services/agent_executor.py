import argparse
import os
import shutil
import subprocess
import uuid
from pathlib import Path

import yaml
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
TEMPLATE_DIR = BASE_DIR / "agent_core"
AGENTS_DIR = BASE_DIR / "agents"
TOOL_CATALOG_DIR = BASE_DIR / "tools"
RUNTIME_TOOLS_DIR = BASE_DIR / "agent_core" / "tools"


def _copy_selected_tools(agent_dir: Path, tools_cfg: list) -> None:
    """
    Copies only the selected tools into the agent container
    and generates the runtime tool registry.
    """
    if not tools_cfg:
        return

    tools_dst = agent_dir / "tools"
    tools_dst.mkdir(parents=True, exist_ok=True)

    registry_lines = [
        "from pathlib import Path\n",
        "from .adapters import load_tool\n",
        "TOOL_REGISTRY = {}\n\n",
    ]

    for tool in tools_cfg:
        tool_name = tool["type"]
        src = TOOL_CATALOG_DIR / f"{tool_name}.py"

        if not src.exists():
            raise ValueError(f"Tool '{tool_name}' not found in tool catalog")

        # Copy only this tool
        shutil.copy(src, tools_dst / f"{tool_name}.py")

        # Register tool dynamically
        registry_lines.append(
            f"TOOL_REGISTRY['{tool_name}'] = "
            f"load_tool(Path(__file__).parent / '{tool_name}.py')\n"
        )

    # Write registry and init
    (tools_dst / "registry.py").write_text("".join(registry_lines))
    (tools_dst / "__init__.py").write_text("")


def _copy_schemas(agent_dir: Path, schemas_cfg: dict) -> dict:
    if not schemas_cfg:
        return schemas_cfg

    input_path = Path(schemas_cfg.get("input", ""))
    output_path = Path(schemas_cfg.get("output", ""))

    if not input_path.exists() or not output_path.exists():
        raise FileNotFoundError("Schema files not found for input/output.")

    schemas_dst = agent_dir / "schemas"
    schemas_dst.mkdir(parents=True, exist_ok=True)

    input_dst = schemas_dst / "input.schema.json"
    output_dst = schemas_dst / "output.schema.json"

    shutil.copy(input_path, input_dst)
    shutil.copy(output_path, output_dst)

    return {
        **schemas_cfg,
        "input": input_dst.relative_to(agent_dir).as_posix(),
        "output": output_dst.relative_to(agent_dir).as_posix(),
    }


def build_agent_container(config: dict, *, build_image: bool = False, run_container: bool = False) -> dict:
    agent_id = f"{config['name'].lower()}-{uuid.uuid4().hex[:8]}"
    agent_dir = AGENTS_DIR / agent_id
    agent_dir.mkdir(parents=True)

    # Copy runtime template
    shutil.copytree(TEMPLATE_DIR, agent_dir, dirs_exist_ok=True)
    _copy_selected_tools(agent_dir, config.get("tools", []))
    if config.get("schemas"):
        config["schemas"] = _copy_schemas(agent_dir, config["schemas"])

    # Write config
    config_text = yaml.safe_dump(config, sort_keys=False)
    (agent_dir / "agent_config.yaml").write_text(config_text)
    # Backwards compatibility
    (agent_dir / "config.yaml").write_text(config_text)

    image_name = None
    if build_image:
        # Build Docker image
        image_name = f"agent-{agent_id}"
        subprocess.run(
            ["docker", "build", "-t", image_name, "."],
            cwd=agent_dir,
            check=True,
        )

    if run_container:
        if not image_name:
            raise ValueError("run_container=True requires build_image=True")
        mlflow_uri = os.getenv("MLFLOW_TRACKING_URI")
        subprocess.run(
            [
                "docker",
                "run",
                "-d",
                "--name",
                agent_id,
                "-e",
                f"OPENAI_API_KEY={os.getenv('OPENAI_API_KEY')}",
                "-e",
                "MLFLOW_TRACKING_URI=" + mlflow_uri,
                "-p",
                "0:8000",
                "--network",
                "agent-net",
                image_name,
            ],
            check=True,
        )

    # Write per-agent docker-compose file (uses the generated agent dir)
    compose_path = BASE_DIR / f"docker-compose.{agent_id}.yml"
    compose_text = f"""version: "3.9"

services:
  mlflow:
    build:
      context: .
      dockerfile: Dockerfile.mlflow
    environment:
      MLFLOW_SERVER_DISABLE_SECURITY_MIDDLEWARE: "true"
    volumes:
      - ./:/mlflow
    ports:
      - "5000:5000"
    healthcheck:
      test:
        - CMD-SHELL
        - >-
          python -c "import urllib.request,sys; urllib.request.urlopen('http://127.0.0.1:5000/', timeout=5); sys.exit(0)"
      interval: 10s
      timeout: 5s
      retries: 30
      start_period: 120s

  agent:
    build:
      context: ./agents/{agent_id}
    environment:
      OPENAI_API_KEY: ${{OPENAI_API_KEY}}
      MLFLOW_TRACKING_URI: http://mlflow:5000
    ports:
      - "8000:8000"
    depends_on:
      mlflow:
        condition: service_healthy
    restart: unless-stopped
"""
    compose_path.write_text(compose_text)

    return {
        "agent_id": agent_id,
        "image": image_name,
        "path": str(agent_dir),
        "compose": str(compose_path),
    }


def _load_config(config_path: Path) -> dict:
    if not config_path.exists():
        raise FileNotFoundError(f"Config not found: {config_path}")
    with config_path.open() as f:
        return yaml.safe_load(f)


def main() -> None:
    parser = argparse.ArgumentParser(description="Build an agent container from config.")
    parser.add_argument(
        "--config",
        default=str(BASE_DIR / "agent_config.yaml"),
        help="Path to agent YAML config",
    )
    parser.add_argument(
        "--no-docker",
        action="store_true",
        help="Only create the agent directory; skip docker build/run.",
    )
    parser.add_argument(
        "--docker",
        action="store_true",
        help="Build and run the agent container directly (bypass compose).",
    )
    parser.add_argument(
        "--name",
        help="Override agent name from config",
    )
    args = parser.parse_args()

    config_path = Path(args.config)
    if not config_path.is_absolute():
        config_path = (BASE_DIR / config_path).resolve()

    config = _load_config(config_path)
    if args.name:
        config["name"] = args.name
    use_docker = args.docker and not args.no_docker
    result = build_agent_container(
        config, build_image=use_docker, run_container=use_docker
    )

    print("Agent created!")
    print(result)


if __name__ == "__main__":
    main()
