#!/usr/bin/env bash

set -euo pipefail

if [ ! -d "e2e" ]; then
  echo "skipped: no e2e directory"
  exit 0
fi

if ! find e2e -type f \( \
  -name '*.spec.ts' -o \
  -name '*.spec.tsx' -o \
  -name '*.spec.js' -o \
  -name '*.spec.jsx' -o \
  -name '*.spec.mjs' -o \
  -name '*.test.ts' -o \
  -name '*.test.tsx' -o \
  -name '*.test.js' -o \
  -name '*.test.jsx' -o \
  -name '*.test.mjs' \
\) -print -quit | grep -q .; then
  echo "skipped: no Playwright tests found under e2e/"
  exit 0
fi

exec bunx playwright test "$@"
