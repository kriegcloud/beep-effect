#!/usr/bin/env bash

set -euo pipefail

CONJURE_TYPESCRIPT=bin/conjure-typescript
OUTPUT_DIR=build/ete

# Clear directory before regenerating
if [ -e "$OUTPUT_DIR" ]; then
    rm -rf "$OUTPUT_DIR"
fi

mkdir -p $OUTPUT_DIR

"$CONJURE_TYPESCRIPT" generate \
  build/resources/verification-server-api.conjure.json \
  "$OUTPUT_DIR" \
  --packageName "conjure-verification" \
  --packageVersion "0.0.0"

cd $OUTPUT_DIR
npm run-script build
