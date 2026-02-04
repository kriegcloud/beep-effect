#!/usr/bin/env bash
# Check if Effect subtree version matches package.json dependency

set -euo pipefail

echo "Checking Effect version consistency..."

# Extract subtree version
subtree_version=$(grep '"version"' .repos/effect/packages/effect/package.json | head -1 | grep -oE "[0-9]+\.[0-9]+\.[0-9]+" || echo "unknown")

# Extract package.json version (strip ^ or ~ prefix)
package_version=$(grep '"effect"' package.json | grep -oE "[0-9]+\.[0-9]+\.[0-9]+" | head -1 || echo "unknown")

echo "Subtree version: $subtree_version"
echo "Package version: ^$package_version (from package.json)"

if [[ "$subtree_version" == "unknown" ]]; then
  echo "⚠️  Could not determine subtree version"
  exit 1
fi

if [[ "$package_version" == "unknown" ]]; then
  echo "⚠️  Could not determine package.json version"
  exit 1
fi

# Compare major.minor versions (ignore patch)
subtree_major_minor=$(echo "$subtree_version" | cut -d. -f1,2)
package_major_minor=$(echo "$package_version" | cut -d. -f1,2)

if [[ "$subtree_major_minor" != "$package_major_minor" ]]; then
  echo "⚠️  Version mismatch detected!"
  echo "   Subtree: $subtree_major_minor.x"
  echo "   Package: ^$package_major_minor.x"
  echo ""
  echo "Consider updating subtree:"
  echo "  git fetch effect-upstream main"
  echo "  git subtree pull --prefix=.repos/effect effect-upstream main --squash"
  exit 1
else
  echo "✓ Versions compatible (both $subtree_major_minor.x)"
fi

# Check if subtree is significantly behind
subtree_patch=$(echo "$subtree_version" | cut -d. -f3)
package_patch=$(echo "$package_version" | cut -d. -f3)

patch_diff=$((package_patch - subtree_patch))

if [[ $patch_diff -gt 5 ]]; then
  echo "⚠️  Subtree patch version is $patch_diff versions behind package.json"
  echo "   Consider updating subtree for latest bug fixes"
fi

exit 0
