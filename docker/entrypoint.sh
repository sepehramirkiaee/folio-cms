#!/bin/sh
# Container start: apply migrations, seed a fresh database, start the server.
set -eu

# docker compose waits for the db healthcheck, but other hosts may not, so
# retry migrations for a short while before giving up.
attempt=1
until node node_modules/prisma/build/index.js migrate deploy; do
  if [ "$attempt" -ge 10 ]; then
    echo "Database is still unreachable after $attempt attempts, giving up." >&2
    exit 1
  fi
  echo "Database not ready (attempt $attempt), retrying in 3s..."
  attempt=$((attempt + 1))
  sleep 3
done

node scripts/seed-if-empty.ts

if [ "${DEMO_MODE:-false}" = "true" ]; then
  echo "Demo mode is on."
fi

exec node server.js
