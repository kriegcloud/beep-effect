#!/bin/bash
set -e

# Local development server
# Usage: ./ops/dev.sh

cd "$(dirname "$0")/.."

# Load local env
if [ -f packages/@core-v2/.env ]; then
  set -a
  source packages/@core-v2/.env
  set +a
elif [ -f packages/@core-v2/.env.local ]; then
  echo "No .env found. Copy .env.local to .env and configure:"
  echo "  cp packages/@core-v2/.env.local packages/@core-v2/.env"
  echo ""
  echo "Then set ANTHROPIC_API_KEY, or fetch from gcloud:"
  echo "  export ANTHROPIC_API_KEY=\$(gcloud secrets versions access latest --secret=ANTHROPIC_API_KEY)"
  exit 1
fi

# Fetch API key from gcloud if not set
if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "Fetching ANTHROPIC_API_KEY from gcloud..."
  export ANTHROPIC_API_KEY=$(gcloud secrets versions access latest --secret=ANTHROPIC_API_KEY)
fi

# Build if needed
echo "Building..."
cd packages/@core-v2
bun run build

# Run server
echo ""
echo "Starting local server on port ${PORT:-8080}..."
echo "  Health: http://localhost:${PORT:-8080}/health/live"
echo "  API:    http://localhost:${PORT:-8080}/api/v1/extract"
echo ""
bun run dist/src/server.js
