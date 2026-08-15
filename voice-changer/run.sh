#!/usr/bin/env bash
# Arranca a aplicação, criando o ambiente virtual na primeira execução.
set -euo pipefail

cd "$(dirname "$0")"

HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-8000}"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "AVISO: o ffmpeg não está instalado. Instala com 'sudo apt install ffmpeg' ou 'brew install ffmpeg'." >&2
fi

if [ ! -d .venv ]; then
  echo "A criar o ambiente virtual (.venv)…"
  python3 -m venv .venv
  ./.venv/bin/pip install --quiet --upgrade pip
  echo "A instalar dependências (a primeira vez demora alguns minutos)…"
  ./.venv/bin/pip install --quiet -r requirements.txt
fi

echo "Aplicação disponível em http://${HOST}:${PORT}"
exec ./.venv/bin/uvicorn app.main:app --host "$HOST" --port "$PORT" "$@"
