# Context Artifact Maintenance

> Maintenance workflows for AI agent context resources added in Phase 4 of agent-context-optimization.

## Overview

Phase 4 introduced three types of artifacts that require periodic maintenance:

| Artifact | Location | Purpose | Update Frequency |
|----------|----------|---------|------------------|
| **Effect Subtree** | `.repos/effect/` | Reference implementation for Effect patterns | Quarterly or on major releases |
| **Context Files** | `context/` | Distilled best practices from Effect source | After subtree updates, new patterns |
| **Navigation Index** | `context/INDEX.md`, `AGENTS.md` | Quick access to context resources | When adding/removing context files |

---

## 1. Effect Subtree Updates

### When to Update

Update `.repos/effect/` when:

- **Major Effect release** (e.g., `effect@3.x.0` → `effect@4.0.0`)
- **Quarterly maintenance** (check for new patterns, API changes)
- **New module needed** (agent discovers missing reference implementation)
- **Bug fix in Effect source** affecting patterns used in beep-effect

### Update Workflow

#### Prerequisites

Verify the remote exists (one-time setup):

```bash
# Check if effect-upstream exists
git remote -v | grep effect-upstream

# If missing, add it
git remote add effect-upstream https://github.com/Effect-TS/effect.git
```

#### Update Process

```bash
# 1. Fetch latest Effect changes from upstream
git fetch effect-upstream main

# 2. Update subtree (ALWAYS use --squash to avoid history bloat)
git subtree pull --prefix=.repos/effect effect-upstream main --squash

# 3. Verify update succeeded
cat .repos/effect/packages/effect/package.json | grep '"version"'

# 4. Check directory structure integrity
ls .repos/effect/packages/ | head -10

# 5. Commit the update
git add .repos/effect
git commit -m "chore(subtree): update Effect to latest main"
```

#### Conflict Resolution

If `git subtree pull` reports conflicts:

```bash
# 1. Identify conflicting files (usually README.md or docs)
git status | grep "both modified"

# 2. Accept upstream version (Effect source is canonical)
git checkout --theirs .repos/effect/path/to/conflicted-file

# 3. Complete merge
git add .repos/effect
git commit -m "chore(subtree): resolve conflicts from Effect update"
```

#### Verification Commands

After updating, verify subtree health:

```bash
# Verify Effect package versions match
grep '"version"' .repos/effect/packages/effect/package.json
grep '"version"' .repos/effect/packages/platform/package.json
grep '"version"' .repos/effect/packages/schema/package.json

# Verify key modules exist
test -f .repos/effect/packages/effect/src/Effect.ts && echo "✓ Effect.ts"
test -f .repos/effect/packages/platform/src/FileSystem.ts && echo "✓ FileSystem.ts"
test -f .repos/effect/packages/schema/src/Schema.ts && echo "✓ Schema.ts"

# Verify subtree structure
ls .repos/effect/packages/ | wc -l  # Should be ~20-30 packages
```

### Troubleshooting

#### Subtree Corruption

If the subtree becomes corrupted or out-of-sync:

```bash
# Remove corrupted subtree
rm -rf .repos/effect

# Re-add fresh subtree
git subtree add --prefix=.repos/effect effect-upstream main --squash

# Commit fresh subtree
git add .repos/effect
git commit -m "chore(subtree): re-initialize Effect subtree"
```

#### Merge Conflicts in Future Updates

If frequent conflicts occur:

1. Check if local modifications were made to `.repos/effect/` (NEVER modify subtree files locally)
2. If modifications exist, remove them and re-pull
3. If conflicts persist, re-initialize subtree (see above)

---

## 2. Context File Refresh

### When to Regenerate

Regenerate `context/` files when:

- **After subtree update** (Effect API changes may affect patterns)
- **New Effect pattern adopted** (e.g., new service composition pattern)
- **Pattern drift detected** (context files contradict current Effect implementation)
- **Coverage gaps** (agent requests pattern not covered in existing context)

### Regeneration Workflow

#### Identify Stale Content

Detect stale context files by comparing against Effect source:

```bash
# 1. Check Effect module version referenced in context
grep "Effect TS" context/effect/Effect.md | head -1

# 2. Compare with actual Effect version in subtree
cat .repos/effect/packages/effect/package.json | grep '"version"'

# 3. Search for deprecated patterns in context files
grep -r "deprecated" context/

# 4. Find references to removed Effect APIs
grep -r "Effect.promise" context/  # Example: deprecated API
```

#### Manual Refresh Process

Context files are generated via AI agent workflows, NOT automated scripts. Follow this process:

**Phase 1: Audit**

```bash
# List all context files
find context/ -name "*.md" -not -name "INDEX.md"

# Compare against Effect module list in subtree
ls .repos/effect/packages/effect/src/ | grep "\.ts$"
ls .repos/effect/packages/platform/src/ | grep "\.ts$"
```

**Phase 2: Update Individual Files**

For each context file needing refresh:

1. Open the existing context file: `context/effect/ModuleName.md`
2. Read the corresponding Effect source: `.repos/effect/packages/effect/src/ModuleName.ts`
3. Review recent changes in Effect repository (check git log in subtree)
4. Update context file with:
   - New API functions
   - Changed signatures
   - Deprecated patterns
   - New best practices from Effect source

**Phase 3: Verify Changes**

```bash
# Check context file compiles with current Effect version
bun run check

# Verify links in context files resolve
grep -r "\[.*\](.*\.md)" context/ | cut -d: -f2 | sed 's/.*(\(.*\.md\)).*/\1/' | while read link; do
  test -f "context/$link" || echo "BROKEN: $link"
done
```

#### Batch Refresh Strategy

When multiple files need updates (e.g., after major Effect release):

```bash
# 1. Create refresh checklist
find context/ -name "*.md" -not -name "INDEX.md" > /tmp/context-refresh-checklist.txt

# 2. Sort by priority (Tier 1 modules first)
# Edit checklist to prioritize:
#   - Tier 1: Effect, Schema, Layer, Context
#   - Tier 2: Array, Option, Stream, Either, Match
#   - Tier 3: DateTime, String, Struct, Record, Predicate
#   - Platform: FileSystem, HttpClient, Command

# 3. Process files in priority order
# (Manual review and update for each file)

# 4. Verify all files updated
git status context/
```

### Content Quality Standards

When refreshing context files, ensure:

- **Accuracy**: All code examples compile with current Effect version
- **Completeness**: Cover all public API functions used in beep-effect
- **Clarity**: Each pattern has "Why" explanation and "FORBIDDEN" anti-pattern
- **Consistency**: Same format/structure across all context files
- **Currency**: Remove deprecated patterns, add new patterns

### Validation Commands

After refreshing context files:

```bash
# 1. Validate Markdown syntax
find context/ -name "*.md" -exec grep -l "^#" {} \; | wc -l

# 2. Check for broken internal links
grep -r "\[.*\](.*\.md)" context/ | grep -v "INDEX.md" | cut -d: -f2 | \
  sed 's/.*(\(.*\.md\)).*/\1/' | while read link; do
    test -f "context/$link" || echo "BROKEN: context/$link"
  done

# 3. Verify all context files listed in INDEX
diff <(find context/ -name "*.md" -not -name "INDEX.md" | sort) \
     <(grep -o "([^)]*\.md)" context/INDEX.md | tr -d "()" | sed 's|^|context/|' | sort)

# 4. Check TypeScript examples in context files
# (Manual: extract code blocks and verify with `bun tsc --noEmit`)
```

---

## 3. Navigation Index Updates

### When to Update

Update `context/INDEX.md` and `AGENTS.md` when:

- **Adding new context file** (new Effect module coverage)
- **Removing context file** (deprecated or merged)
- **Reorganizing tiers** (module usage patterns change)
- **Adding/removing skills** (new reusable agent capabilities)
- **Adding/removing specs** (new specification workflows)

### Update Workflow

#### Adding New Context File

When adding `context/effect/NewModule.md`:

**Step 1: Create Context File**

```bash
# Create new context file following template
touch context/effect/NewModule.md

# Use existing context file as template
head -50 context/effect/Effect.md > context/effect/NewModule.md
# (Edit file with module-specific content)
```

**Step 2: Add to INDEX.md**

```bash
# Open context/INDEX.md
# Add entry in appropriate tier table:

# For Tier 1 (Critical):
# | NewModule | [NewModule.md](effect/NewModule.md) | `import * as NewModule from "effect/NewModule"` | Primary use cases |

# For Platform modules:
# | NewModule | [platform/NewModule.md](platform/NewModule.md) | Service description |

# Add to "By Task" section if relevant:
# | Task | Start Here | Related |
# | Use NewModule | [NewModule.md](effect/NewModule.md) | Other relevant modules |
```

**Step 3: Update AGENTS.md**

```bash
# Open AGENTS.md
# Add to "Effect Modules by Tier" section:

# For Tier 1:
# | Tier 1 (Critical) | [Effect](context/effect/Effect.md), [NewModule](context/effect/NewModule.md), ... | Every file uses these |
```

**Step 4: Verify Links**

```bash
# Verify new context file is reachable
grep -r "NewModule.md" context/INDEX.md AGENTS.md

# Check for broken links
grep -o "([^)]*NewModule\.md)" context/INDEX.md AGENTS.md | tr -d "()" | while read link; do
  test -f "$link" || echo "BROKEN: $link"
done
```

#### Removing Context File

When removing `context/effect/OldModule.md`:

**Step 1: Remove References**

```bash
# Find all references to the module
grep -r "OldModule.md" context/ AGENTS.md

# Remove entries from:
# - context/INDEX.md (all tables)
# - AGENTS.md (tier tables)
```

**Step 2: Remove File**

```bash
# Remove context file
rm context/effect/OldModule.md

# Verify no dangling references
grep -r "OldModule" context/ AGENTS.md
```

**Step 3: Update File Count**

```bash
# Update count in context/INDEX.md
# Find "File Count Summary" table
# Decrement tier count and total count
```

#### Reorganizing Tiers

When moving a module between tiers (e.g., `Array` from Tier 2 → Tier 1):

**Step 1: Update INDEX.md**

```bash
# Move entry from old tier table to new tier table
# Update tier column in index
```

**Step 2: Update AGENTS.md**

```bash
# Move entry in "Effect Modules by Tier" table
# Update tier description if needed
```

**Step 3: Verify Consistency**

```bash
# Ensure module appears in correct tier in both files
grep "Array.md" context/INDEX.md AGENTS.md
```

### Skills Updates

#### Adding New Skill

When adding `.claude/skills/new-skill.md`:

**Step 1: Document Skill**

```bash
# Create skill file
touch .claude/skills/new-skill.md

# Follow existing skill structure:
# - Purpose
# - When to Use
# - Examples
# - Related Skills
```

**Step 2: Update AGENTS.md**

```bash
# Add to "Skills by Category" table:
# | Category | Skills | When to Use |
# | Existing Category | ..., new-skill | ... |

# Or create new category if needed
```

**Step 3: Cross-reference**

```bash
# Add references in related context files if applicable
# Example: If skill uses Effect.gen heavily, reference in context/effect/Effect.md
```

#### Removing Skill

```bash
# 1. Remove skill file
rm .claude/skills/deprecated-skill.md

# 2. Remove from AGENTS.md
grep -v "deprecated-skill" AGENTS.md > AGENTS.md.tmp
mv AGENTS.md.tmp AGENTS.md

# 3. Check for references in specs
grep -r "deprecated-skill" specs/
```

### Specs Updates

#### Adding New Spec

When creating `specs/new-spec/`:

**Step 1: Follow Spec Guide**

```bash
# Create spec directory following structure
mkdir -p specs/new-spec/handoffs

# Create core files
touch specs/new-spec/README.md
touch specs/new-spec/REFLECTION_LOG.md
```

**Step 2: Update specs/README.md**

```bash
# Add to spec listing in specs/README.md
```

**Step 3: Update AGENTS.md**

```bash
# Add to "Specs by Status" section:
# | Status | Specs |
# | 📋 Planning | ..., [new-spec](specs/new-spec/) |
```

#### Marking Spec Complete

```bash
# 1. Move from "Active" to "Complete" in AGENTS.md
# 2. Add completion date to spec README.md
# 3. Archive handoff prompts if no longer needed
```

### Verification Commands

After updating navigation files:

```bash
# 1. Check all context file links resolve
grep -r "\.md)" context/INDEX.md AGENTS.md | grep -o "([^)]*\.md)" | tr -d "()" | while read link; do
  test -f "$link" || echo "BROKEN: $link"
done

# 2. Verify tier counts match
echo "INDEX.md counts:"
grep -c "effect/.*\.md" context/INDEX.md
echo "AGENTS.md counts:"
grep -c "context/effect/.*\.md" AGENTS.md

# 3. Check for duplicate entries
grep -o "\[.*\](.*\.md)" context/INDEX.md | sort | uniq -d

# 4. Validate Markdown tables render correctly
# (Visual check in IDE or cat command)
cat context/INDEX.md | grep "^|" | head -20
```

---

## 4. Periodic Maintenance Schedule

### Quarterly Maintenance (Every 3 months)

**Week 1: Audit**

```bash
# Check Effect version drift
cat .repos/effect/packages/effect/package.json | grep version
cat package.json | grep '"effect"'

# List context files last modified
find context/ -name "*.md" -exec stat -c "%y %n" {} \; | sort

# Check for broken links
bash documentation/scripts/verify-context-links.sh  # (Create this script)
```

**Week 2: Update Subtree**

```bash
# Fetch and pull latest Effect
git fetch effect-upstream main
git subtree pull --prefix=.repos/effect effect-upstream main --squash

# Verify update
git log --oneline --graph --decorate --all -10 | grep "update Effect"
```

**Week 3: Refresh Context**

```bash
# Prioritize Tier 1 modules
for module in Effect Schema Layer Context; do
  echo "Reviewing context/effect/$module.md"
  diff <(grep "^## " context/effect/$module.md) <(grep "export " .repos/effect/packages/effect/src/$module.ts)
done

# Update stale files
# (Manual review and update)
```

**Week 4: Verify Navigation**

```bash
# Check INDEX.md and AGENTS.md sync
diff <(grep -o "effect/.*\.md" context/INDEX.md | sort) \
     <(grep -o "context/effect/.*\.md" AGENTS.md | sed 's|context/||' | sort)

# Verify all specs referenced
diff <(find specs/ -maxdepth 1 -type d | tail -n +2 | sort) \
     <(grep -o "specs/[^/)]*" AGENTS.md | sort | uniq)
```

### On-Demand Maintenance (As needed)

**After Major Effect Release**

1. Update subtree immediately
2. Review release notes for breaking changes
3. Update affected context files
4. Verify all code examples compile

**After Adding New Package to Monorepo**

1. Check if new Effect modules used
2. Create context files for new modules
3. Update INDEX.md and AGENTS.md

**After Agent Discovers Pattern Gap**

1. Review agent conversation for missing pattern
2. Update relevant context file
3. Add to INDEX.md "By Task" section

---

## 5. Automation Opportunities

### Current Manual Processes

| Task | Current Approach | Automation Potential |
|------|------------------|---------------------|
| Subtree update | Manual `git subtree pull` | Medium (quarterly cronjob) |
| Context file refresh | Manual review and edit | Low (requires AI judgment) |
| Link validation | Manual grep commands | High (CI check) |
| Version drift detection | Manual comparison | High (CI check) |
| Index synchronization | Manual edit | Medium (script to verify) |

### Recommended Automations

#### Link Validation Script

Create `documentation/scripts/verify-context-links.sh`:

```bash
#!/usr/bin/env bash
# Verify all links in context files resolve

set -euo pipefail

echo "Verifying context file links..."

broken=0

# Check internal links in INDEX.md
grep -o "([^)]*\.md)" context/INDEX.md | tr -d "()" | while read link; do
  if [[ ! -f "$link" ]]; then
    echo "❌ BROKEN: $link (referenced in context/INDEX.md)"
    broken=$((broken + 1))
  fi
done

# Check internal links in AGENTS.md
grep -o "(context/[^)]*\.md)" AGENTS.md | tr -d "()" | while read link; do
  if [[ ! -f "$link" ]]; then
    echo "❌ BROKEN: $link (referenced in AGENTS.md)"
    broken=$((broken + 1))
  fi
done

if [[ $broken -eq 0 ]]; then
  echo "✓ All links valid"
  exit 0
else
  echo "❌ Found $broken broken links"
  exit 1
fi
```

#### Version Drift Check

Create `documentation/scripts/check-effect-version.sh`:

```bash
#!/usr/bin/env bash
# Check if Effect subtree version matches package.json dependency

set -euo pipefail

subtree_version=$(grep '"version"' .repos/effect/packages/effect/package.json | head -1 | grep -o "[0-9.]*")
package_version=$(grep '"effect"' package.json | grep -o "[0-9.]*" | head -1)

echo "Subtree version: $subtree_version"
echo "Package version: ^$package_version"

if [[ "$subtree_version" < "$package_version" ]]; then
  echo "⚠️  Subtree outdated. Run: git subtree pull --prefix=.repos/effect effect-upstream main --squash"
  exit 1
else
  echo "✓ Subtree up-to-date"
fi
```

#### CI Integration

Add to `.github/workflows/context-checks.yml`:

```yaml
name: Context Checks

on:
  pull_request:
    paths:
      - 'context/**'
      - 'AGENTS.md'
      - '.repos/effect/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check context links
        run: bash documentation/scripts/verify-context-links.sh
      - name: Check Effect version
        run: bash documentation/scripts/check-effect-version.sh
```

---

## 6. Troubleshooting Common Issues

### "Context file contradicts Effect source"

**Symptoms**: Agent uses pattern from context file, but it doesn't match Effect implementation.

**Diagnosis**:

```bash
# Compare context file with source
diff <(grep "Effect.gen" context/effect/Effect.md) \
     <(grep -A 10 "export.*gen" .repos/effect/packages/effect/src/Effect.ts)
```

**Resolution**: Refresh context file with current Effect source patterns.

### "Broken link in INDEX.md"

**Symptoms**: Navigation link returns 404 or file not found.

**Diagnosis**:

```bash
# Find broken link
grep -n "broken-file.md" context/INDEX.md

# Check if file exists
test -f "context/effect/broken-file.md" || echo "Missing"
```

**Resolution**: Either create missing file or remove link from INDEX.md.

### "Subtree merge conflicts"

**Symptoms**: `git subtree pull` fails with merge conflicts.

**Diagnosis**:

```bash
# Check for local modifications in subtree
git log --oneline -- .repos/effect/ | head -10
```

**Resolution**: If conflicts persist, re-initialize subtree (see Section 1).

### "Module missing from INDEX.md"

**Symptoms**: Agent requests module not listed in navigation.

**Diagnosis**:

```bash
# Check if context file exists
test -f "context/effect/MissingModule.md" || echo "Not created yet"

# Check if referenced in AGENTS.md
grep "MissingModule" AGENTS.md
```

**Resolution**: Create context file and add to both INDEX.md and AGENTS.md.

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| [documentation/subtree-workflow.md](subtree-workflow.md) | Git subtree commands and usage |
| [context/INDEX.md](../context/INDEX.md) | Context navigation hub |
| [AGENTS.md](../AGENTS.md) | AI agent onboarding and reference |
| [specs/agent-context-optimization/README.md](../specs/agent-context-optimization/README.md) | Original spec for Phase 4 |
