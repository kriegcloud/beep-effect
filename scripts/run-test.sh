#!/usr/bin/env bash

set -euo pipefail

bunx turbo run test --concurrency=1 "$@"

if [ "$#" -eq 0 ]; then
  bun run test:types
fi
