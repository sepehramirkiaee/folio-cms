#!/bin/sh
# Runs the production build the same way the Docker image does: the standalone
# server plus its static assets. Loads .env when present (Docker passes env vars).
set -eu
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/
exec node --env-file-if-exists=.env .next/standalone/server.js
