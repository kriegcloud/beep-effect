#!/bin/bash
# Quick extraction test script for Seattle ontology
# Usage: ./scripts/test-extraction.sh [article_path]

set -e

API_URL="${API_URL:-http://localhost:8080}"
BUCKET="${BUCKET:-effect-ontology-dev}"
ONTOLOGY_PATH="canonical/seattle/ontology.ttl"
SHACL_PATH="canonical/seattle/shapes.ttl"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log() { echo -e "${GREEN}[+]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[x]${NC} $1"; }

# Check if server is running
check_server() {
    log "Checking server health..."
    if curl -s "${API_URL}/health/live" > /dev/null 2>&1; then
        log "Server is running at ${API_URL}"
        return 0
    else
        error "Server not running at ${API_URL}"
        echo "Start with: bun run serve"
        return 1
    fi
}

# Compute ontology hash
get_ontology_hash() {
    gsutil cat "gs://${BUCKET}/${ONTOLOGY_PATH}" 2>/dev/null | shasum -a 256 | cut -c1-16
}

# Upload article to GCS
upload_article() {
    local article_path="$1"
    local doc_id="doc-test-$(date +%s)"
    local gcs_path="gs://${BUCKET}/documents/${doc_id}/content.txt"

    log "Uploading article to ${gcs_path}..."
    gsutil cp "${article_path}" "${gcs_path}" > /dev/null 2>&1
    echo "${gcs_path}"
}

# Run extraction
run_extraction() {
    local doc_uri="$1"
    local ontology_hash="$2"

    log "Running extraction..."
    log "  Document: ${doc_uri}"
    log "  Ontology version: seattle/ontology@${ontology_hash}"

    curl -s -X POST "${API_URL}/v1/extract" \
        -H "Content-Type: application/json" \
        -d "{
            \"ontologyUri\": \"gs://${BUCKET}/${ONTOLOGY_PATH}\",
            \"ontologyVersion\": \"seattle/ontology@${ontology_hash}\",
            \"targetNamespace\": \"seattle\",
            \"shaclUri\": \"gs://${BUCKET}/${SHACL_PATH}\",
            \"documents\": [{
                \"sourceUri\": \"${doc_uri}\",
                \"contentType\": \"text/plain\"
            }]
        }"
}

# Main
main() {
    local article_path="$1"

    # Check server
    check_server || exit 1

    # Get ontology hash
    log "Computing ontology content hash..."
    local ontology_hash=$(get_ontology_hash)
    log "Ontology hash: ${ontology_hash}"

    # If article provided, upload it
    if [[ -n "${article_path}" ]]; then
        if [[ ! -f "${article_path}" ]]; then
            error "Article file not found: ${article_path}"
            exit 1
        fi
        local doc_uri=$(upload_article "${article_path}")
    else
        # Use default test document
        local doc_uri="gs://${BUCKET}/documents/doc-seattle-test-1766181368/content.txt"
        log "Using existing test document: ${doc_uri}"
    fi

    # Run extraction
    echo ""
    run_extraction "${doc_uri}" "${ontology_hash}"
    echo ""
}

main "$@"
