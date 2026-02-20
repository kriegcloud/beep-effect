#!/usr/bin/env bash

set -euo pipefail

CONJURE_TYPESCRIPT=bin/conjure-typescript
TEST_DIR=src/__integTest__/__generated__

# Clear directory before regenerating
if [ -e "$TEST_DIR/index.ts" ]; then
    rm -rf "$TEST_DIR/conjure-verification" "$TEST_DIR/index.ts"
fi

"$CONJURE_TYPESCRIPT" generate build/resources/verification-server-api.conjure.json "$TEST_DIR" --rawSource
