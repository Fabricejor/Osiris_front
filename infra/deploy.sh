#!/usr/bin/env bash
# Déploiement production OSIRIS Front sur le VPS (build local + compose).
# Prérequis : Docker Compose, fichier .env à la racine (voir .env.example).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="${ENV_FILE:-.env}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://127.0.0.1:3000/}"
MAX_ATTEMPTS="${HEALTHCHECK_ATTEMPTS:-40}"
SLEEP_SECONDS="${HEALTHCHECK_INTERVAL:-5}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "==> $ENV_FILE manquant — copie depuis .env.example"
  cp .env.example "$ENV_FILE"
fi

# shellcheck disable=SC1090
set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

echo "==> NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-https://apiosiris.qsoul.africa/api}"
echo "==> Build image osiris-front:latest"
docker compose --env-file "$ENV_FILE" build --pull

echo "==> Start container"
docker compose --env-file "$ENV_FILE" up -d --remove-orphans

echo "==> Waiting for healthcheck: ${HEALTHCHECK_URL}"
attempt=1
until curl -sf "$HEALTHCHECK_URL" >/dev/null; do
  if (( attempt >= MAX_ATTEMPTS )); then
    echo "ERROR: Healthcheck failed after ${MAX_ATTEMPTS} attempts" >&2
    docker compose --env-file "$ENV_FILE" ps
    docker compose --env-file "$ENV_FILE" logs --tail=80 osiris-front || true
    exit 1
  fi
  echo "  attempt ${attempt}/${MAX_ATTEMPTS} — not ready yet"
  sleep "$SLEEP_SECONDS"
  ((attempt++)) || true
done

echo "==> Healthcheck OK"
curl -sfI "$HEALTHCHECK_URL" | head -5 || true
echo
echo "==> Deploy front completed"
