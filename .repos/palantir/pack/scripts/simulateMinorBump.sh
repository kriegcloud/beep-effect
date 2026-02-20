#!/usr/bin/env bash
set -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

cd "${SCRIPT_DIR}/../"

pnpm exec turbo transpile --filter "./packages/monorepo/release"
node ./packages/monorepo/release/build/esm/index.js --mode simulateMinorBump --repo palantir/pack
echo "WARNING: You are probably on the pr branch"
