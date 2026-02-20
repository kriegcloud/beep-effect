#!/usr/bin/env bash
set -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

cd "${SCRIPT_DIR}/../"

if [[ $(git rev-parse --abbrev-ref HEAD | sed -E 's/^changeset-release\/.*$/ABORT/') == "ABORT" ]]; then
    echo "===== ABORTING ====="
    echo ""
    echo "Given you are already on a changeset branch, you almost certainly dont"
    echo "want to run a release from here".
    exit 1
fi

pnpm exec turbo transpile --filter "./packages/monorepo/release"
node ./packages/monorepo/release/build/esm/index.js --repo palantir/pack

# Run build and test to regenerate files with new versions (snapshots, demo files, etc.)
pnpm build
pnpm test -- --update

# Add empty changeset to pass CI checks
pnpm exec changeset add --empty

# Amend the release commit with the regenerated files and empty changeset
git add -A
git commit --amend --no-edit
git push --force-with-lease

echo "WARNING: You are probably on the pr branch"
