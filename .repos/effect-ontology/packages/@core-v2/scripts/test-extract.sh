#!/bin/bash
# Test extraction script - sends a batch request to the local server
# Usage: ./scripts/test-extract.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PKG_DIR="$(dirname "$SCRIPT_DIR")"

# Load test environment for paths
source "$PKG_DIR/.env.test"

# Server endpoint
SERVER_URL="${SERVER_URL:-http://localhost:$PORT}"

# Compute ontology hash for version
ONTOLOGY_HASH=$(shasum -a 256 "$ONTOLOGY_PATH" | cut -c1-16)
ONTOLOGY_VERSION="football/ontology@$ONTOLOGY_HASH"

echo "Testing extraction against $SERVER_URL"
echo "  Ontology: $ONTOLOGY_PATH"
echo "  Version: $ONTOLOGY_VERSION"
echo ""

# Check server is running
if ! curl -s "$SERVER_URL/health/live" > /dev/null 2>&1; then
  echo "Error: Server not running at $SERVER_URL"
  echo "Start it with: ./scripts/test-server.sh"
  exit 1
fi
echo "✓ Server is running"

# Create the batch request JSON
REQUEST_JSON=$(cat << EOF
{
  "ontologyUri": "gs://local-bucket/ontologies/football/ontology.ttl",
  "ontologyVersion": "$ONTOLOGY_VERSION",
  "targetNamespace": "football-test",
  "documents": [
    {
      "sourceUri": "gs://local-bucket/input/football-match.txt",
      "contentType": "text/plain"
    }
  ]
}
EOF
)

echo ""
echo "Sending batch extraction request..."
echo "$REQUEST_JSON" | jq .
echo ""

# Copy ontology to the expected storage path for local mode
mkdir -p "$STORAGE_LOCAL_PATH/ontologies/football"
cp "$ONTOLOGY_PATH" "$STORAGE_LOCAL_PATH/ontologies/football/ontology.ttl"

# Send the request with SSE streaming
curl -N -s -X POST "$SERVER_URL/v1/extract/batch" \
  -H "Content-Type: application/json" \
  -d "$REQUEST_JSON" | while IFS= read -r line; do
    # Parse SSE events
    if [[ "$line" == data:* ]]; then
      echo "$line" | sed 's/^data: //' | jq .
    elif [[ "$line" == event:* ]]; then
      echo "Event: ${line#event: }"
    elif [[ "$line" == id:* ]]; then
      echo "ID: ${line#id: }"
    fi
done

echo ""
echo "Extraction complete. Check output at: $STORAGE_LOCAL_PATH"
