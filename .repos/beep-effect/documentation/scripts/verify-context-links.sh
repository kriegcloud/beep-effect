#!/usr/bin/env bash
# Verify all links in context files resolve

set -euo pipefail

echo "Verifying context file links..."

broken=0

# Check internal links in INDEX.md (links are relative to context/)
while IFS= read -r link; do
  link=$(echo "$link" | tr -d "()")
  full_path="context/$link"
  if [[ ! -f "$full_path" ]]; then
    echo "❌ BROKEN: $link (referenced in context/INDEX.md)"
    broken=$((broken + 1))
  fi
done < <(grep -o "([^)]*\.md)" context/INDEX.md 2>/dev/null | sort -u || true)

# Check internal links in AGENTS.md (links include context/ prefix)
while IFS= read -r link; do
  link=$(echo "$link" | tr -d "()")
  if [[ ! -f "$link" ]]; then
    echo "❌ BROKEN: $link (referenced in AGENTS.md)"
    broken=$((broken + 1))
  fi
done < <(grep -o "(context/[^)]*\.md)" AGENTS.md 2>/dev/null | sort -u || true)

# Check internal links within context files
while IFS= read -r file; do
  # Check for cross-references like [Layer.md](Layer.md) or [../platform/FileSystem.md](../platform/FileSystem.md)
  while IFS= read -r link; do
    link=$(echo "$link" | tr -d "()")

    # Skip HTTP(S) links
    if [[ "$link" =~ ^https?:// ]]; then
      continue
    fi

    # Resolve path relative to current file
    dir=$(dirname "$file")

    if [[ "$link" =~ ^\.\. ]]; then
      # Handle ../ paths
      full_path="$dir/$link"
    elif [[ "$link" =~ ^/ ]]; then
      # Absolute path (from repo root)
      full_path="${link:1}"
    else
      # Relative path in same directory
      full_path="$dir/$link"
    fi

    # Normalize path
    full_path=$(realpath -m "$full_path" 2>/dev/null || echo "$full_path")

    if [[ ! -f "$full_path" ]]; then
      echo "❌ BROKEN: $link (referenced in $file, resolved to $full_path)"
      broken=$((broken + 1))
    fi
  done < <(grep -o "([^)]*\.md)" "$file" 2>/dev/null | sort -u || true)
done < <(find context/ -name "*.md" -not -name "INDEX.md" 2>/dev/null || true)

if [[ $broken -eq 0 ]]; then
  echo "✓ All links valid"
  exit 0
else
  echo "❌ Found $broken broken links"
  exit 1
fi
