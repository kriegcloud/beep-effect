#!/bin/bash
# Test server script for local E2E testing
# Usage: ./scripts/test-server.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PKG_DIR="$(dirname "$SCRIPT_DIR")"
MONOREPO_ROOT="$(dirname "$(dirname "$PKG_DIR")")"

# Source test environment for path variables (needed for setup)
source "$PKG_DIR/.env.test"

# Get API key from monorepo .env (VITE_LLM_ANTHROPIC_API_KEY)
if [ -f "$MONOREPO_ROOT/.env" ]; then
  API_KEY=$(grep "^VITE_LLM_ANTHROPIC_API_KEY=" "$MONOREPO_ROOT/.env" | cut -d'=' -f2)
  if [ -n "$API_KEY" ]; then
    export LLM_API_KEY="$API_KEY"
    echo "✓ Loaded API key from $MONOREPO_ROOT/.env"
  fi
fi

# Ensure API key is set
if [ -z "$LLM_API_KEY" ]; then
  echo "Error: LLM_API_KEY not set."
  echo "Options:"
  echo "  1. Add VITE_LLM_ANTHROPIC_API_KEY to $MONOREPO_ROOT/.env"
  echo "  2. Export LLM_API_KEY before running this script"
  exit 1
fi

# Create test directories
mkdir -p "$STORAGE_LOCAL_PATH/input" "$STORAGE_LOCAL_PATH/output"

# Check ontology exists
if [ ! -f "$ONTOLOGY_PATH" ]; then
  echo "Error: Ontology not found at $ONTOLOGY_PATH"
  exit 1
fi
echo "✓ Ontology found at $ONTOLOGY_PATH"

# Copy test document if not exists
TEST_DOC="$STORAGE_LOCAL_PATH/input/football-match.txt"
if [ ! -f "$TEST_DOC" ]; then
  cat > "$TEST_DOC" << 'EOF'
Manchester United defeated Liverpool 2-1 in a thrilling Premier League match at Old Trafford on Saturday.

Marcus Rashford opened the scoring in the 23rd minute with a brilliant solo effort, dribbling past two defenders before slotting the ball into the bottom corner. Liverpool equalized through Mohamed Salah in the 56th minute with a clinical finish from inside the box.

The winner came from Bruno Fernandes in the 78th minute, converting a penalty after Rashford was fouled by Virgil van Dijk in the area. Manager Erik ten Hag praised his team's resilience, while Liverpool's Jurgen Klopp admitted his side struggled to contain United's counter-attacks.

The result moves Manchester United to third place in the Premier League table, while Liverpool drop to fifth.
EOF
  echo "✓ Created test document at $TEST_DOC"
else
  echo "✓ Test document exists at $TEST_DOC"
fi

echo ""
echo "Starting server with test configuration..."
echo "  Using: --env-file=.env.test"
echo "  PORT=$PORT"
echo "  LLM_PROVIDER=$LLM_PROVIDER"
echo "  LLM_MODEL=$LLM_MODEL"
echo "  STORAGE_TYPE=$STORAGE_TYPE"
echo "  STORAGE_LOCAL_PATH=$STORAGE_LOCAL_PATH"
echo "  ONTOLOGY_PATH=$ONTOLOGY_PATH"
echo ""

cd "$PKG_DIR"

# Use bun's --env-file flag to load .env.test
# LLM_API_KEY is passed via environment (exported above)
exec bun --env-file=.env.test run dist/src/server.js
