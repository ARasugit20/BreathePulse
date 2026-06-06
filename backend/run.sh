#!/bin/bash
set -euo pipefail

export PYTHONPATH="${PYTHONPATH:-}:$(pwd)"

if [ -f ../.env ]; then
    set -a
    source ../.env
    set +a
fi

uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
