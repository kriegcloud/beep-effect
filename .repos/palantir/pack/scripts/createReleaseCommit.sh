#!/usr/bin/env bash
set -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

cd "${SCRIPT_DIR}/../"

# Build the release tool
pnpm exec turbo transpile --filter "./packages/monorepo/release"

# Run version bump and create commit on current branch with version digest
node ./packages/monorepo/release/build/esm/index.js \
  --mode version-commit

# Run build and test to regenerate files with new versions (snapshots, demo files, etc.)
pnpm build
pnpm test -- --update

# Add empty changeset to pass CI checks
pnpm exec changeset add --empty

# Amend the release commit with the regenerated files and empty changeset
git add -A
git commit --amend --no-edit
