# Repository Consistency Audit

> **Purpose**: Self-healing audit loop that identifies and fixes ALL documentation inconsistencies until the repository is clean.
> **Completion Signal**: `<promise>REPO CLEAN</promise>`
> **Usage**: Run periodically or after major refactors to ensure documentation accuracy.

## Quick Start

```
/ralph-wiggum:ralph-loop "Read and execute .claude/prompts/repo-consistency-audit.md exactly. Start with Step 1." --completion-promise "REPO CLEAN" --max-iterations 20
```

---

---

## Iteration Protocol

Each iteration follows this exact sequence:

1. **Run ALL audit commands** (Step 1)
2. **Evaluate results** (Step 2)
3. **Fix issues OR output completion promise** (Step 3)

---

## Step 1: Run Audit Commands

Execute ALL categories below. Capture output for each.

### Category A: Stale Path References

```bash
# A1. Old spec guide paths
grep -rn "specs/SPEC_CREATION_GUIDE\|specs/HANDOFF_STANDARDS[^/]\|specs/PATTERN_REGISTRY\.md\|specs/llms\.txt" --include="*.md" . 2>/dev/null | grep -v "outputs/\|REFLECTION_LOG\|RALPH_AUDIT\|specs/"

# A2. Deleted spec references (excludes: audit prompt migration tables, anti-pattern docs)
grep -rn "ai-friendliness-audit\|jetbrains-mcp-skill\|new-specialized-agents" --include="*.md" . 2>/dev/null | grep -v "outputs/\|RALPH_AUDIT\|specs/\|repo-consistency-audit"

# A3. META_SPEC_TEMPLATE references (excludes: audit prompt itself)
grep -rn "META_SPEC_TEMPLATE" --include="*.md" . 2>/dev/null | grep -v "outputs/\|RALPH_AUDIT\|specs/\|repo-consistency-audit"

# A4. Stale @beep/core-* package references (excludes: anti-pattern docs, migration tables)
grep -rn "@beep/core-" --include="*.md" . 2>/dev/null | grep -v "outputs/\|RALPH_AUDIT\|historical\|deleted\|consolidated\|specs/\|Stale Package\|FORBIDDEN\|Anti-Pattern"
```

### Category B: Agent Configuration Issues

```bash
# B1. MCP tool shortcuts in .claude/agents/ tools: sections
grep -rn "mcp__effect_docs__\|mcp__MCP_DOCKER__\|mcp__jetbrains__\|mcp__context7__" .claude/agents/ --include="*.md" 2>/dev/null

# B2. Forbidden bun:test imports in agent examples (should use @beep/testkit)
grep -rn "from \"bun:test\"\|from 'bun:test'" .claude/agents/ --include="*.md" 2>/dev/null | grep -v "NEVER\|forbidden\|re-exported"

# B3. Lowercase Schema constructors (should be PascalCase)
grep -rn "S\.struct\|S\.string\|S\.number\|S\.boolean\|S\.array" --include="*.md" .claude/ 2>/dev/null
```

### Category C: README.md Accuracy

```bash
# C1. Missing README.md in packages
find packages -maxdepth 3 -name "package.json" -exec dirname {} \; 2>/dev/null | while read pkg; do
  test -f "$pkg/README.md" || echo "MISSING README: $pkg"
done

# C2. Deprecated API references (BS.toOptionalWithDefault is deprecated)
grep -rn "toOptionalWithDefault" --include="*.md" . 2>/dev/null | grep -v "RALPH_AUDIT\|deprecated\|DEPRECATED"

# C3. Outdated version references
grep -rn "Next\.js 1[0-5]\|React 1[0-8]\|Effect 2\.[0-9]\|Bun 1\.[0-2]\." --include="*.md" . 2>/dev/null | grep -v "outputs/"
```

### Category D: AGENTS.md Accuracy

```bash
# D1. Missing AGENTS.md in packages
find packages -maxdepth 3 -name "package.json" -exec dirname {} \; 2>/dev/null | while read pkg; do
  test -f "$pkg/AGENTS.md" || echo "MISSING AGENTS.md: $pkg"
done

# D2. Hardcoded absolute paths in AGENTS.md
grep -rn "/home/\|/Users/" --include="AGENTS.md" packages/ 2>/dev/null
```

### Category E: Code Reference Accuracy

```bash
# E1. Incomplete slice documentation (should mention all 6 slices)
grep -rn "packages/iam.*packages/documents" --include="*.md" . 2>/dev/null | grep -v "calendar\|knowledge\|comms\|customization" | head -5

# E2. References to non-existent documentation files
for ref in "documentation/patterns/service-patterns.md"; do
  test -f "$ref" || echo "MISSING DOC: $ref"
done

# E3. Broken spec references in specs/README.md
grep -oE '\[[^\]]+\]\([^)]+README\.md\)' specs/README.md 2>/dev/null | while read -r link; do
  path=$(echo "$link" | sed 's/.*(\(.*\))/\1/')
  resolved="specs/$path"
  test -f "$resolved" || echo "BROKEN LINK in specs/README.md: $path"
done
```

### Category F: Structural Requirements

```bash
# F1. Specs missing REFLECTION_LOG.md
find specs -maxdepth 2 -type d -name "specs" -prune -o -type d -print 2>/dev/null | while read dir; do
  if [ -f "$dir/README.md" ] && [ "$dir" != "specs/_guide" ] && [ "$dir" != "specs" ]; then
    test -f "$dir/REFLECTION_LOG.md" || echo "MISSING REFLECTION_LOG: $dir"
  fi
done

# F2. Handoff files without matching orchestrator prompts
find specs -name "HANDOFF_P*.md" 2>/dev/null | while read handoff; do
  dir=$(dirname "$handoff")
  num=$(echo "$handoff" | grep -oE "P[0-9]+" | head -1)
  test -f "$dir/${num}_ORCHESTRATOR_PROMPT.md" || echo "MISSING ORCHESTRATOR: $dir/${num}_ORCHESTRATOR_PROMPT.md (has $handoff)"
done
```

### Category G: Cross-Reference Validation

```bash
# G1. References to files that don't exist (sample key paths)
grep -roh "packages/[^)\" ]*\.ts" --include="*.md" documentation/ .claude/ 2>/dev/null | sort -u | head -20 | while read path; do
  test -f "$path" || echo "BROKEN FILE REF: $path"
done

# G2. Invalid @beep/* package references
grep -roh "@beep/[a-z-]*" --include="*.md" . 2>/dev/null | sort -u | while read pkg; do
  # Check if package exists in any package.json
  if ! grep -rq "\"name\": \"$pkg\"" packages/ apps/ tooling/ 2>/dev/null; then
    echo "INVALID PACKAGE: $pkg"
  fi
done | grep -v "@beep/\(iam\|documents\|calendar\|knowledge\|comms\|customization\|shared\|schema\|constants\|identity\|utils\|invariant\|types\|errors\|wrap\|db-admin\|runtime\|testkit\|repo-\|tooling\|build\|ui\)" | head -10
```

---

## Step 2: Evaluate Results

**Count total issues** from all categories.

**IF total issues = 0:**
1. Run `bun run lint:fix` to ensure formatting is clean
2. Output exactly: `<promise>REPO CLEAN</promise>`
3. STOP - do not make any changes

**IF issues found:**
1. Proceed to Step 3
2. DO NOT output the promise

---

## Step 3: Fix Issues (Max 10 Per Iteration)

Fix UP TO 10 issues per iteration, prioritized by category order (A → G).

### Priority Order

1. **Category A** - Stale path references (highest impact)
2. **Category B** - Agent configuration issues
3. **Category C** - README.md accuracy
4. **Category D** - AGENTS.md accuracy
5. **Category E** - Code reference accuracy
6. **Category F** - Structural requirements
7. **Category G** - Cross-reference validation

### After Fixes

1. Run `bun run lint:fix`
2. Commit with message: `fix(docs): [brief description]`
3. DO NOT output promise - let loop continue

---

## Fix Reference Guide

### Path Migrations (Category A)

| Old Path | New Path |
|----------|----------|
| `specs/SPEC_CREATION_GUIDE.md` | `specs/_guide/README.md` |
| `specs/HANDOFF_STANDARDS.md` | `specs/_guide/HANDOFF_STANDARDS.md` |
| `specs/PATTERN_REGISTRY.md` | `specs/_guide/PATTERN_REGISTRY.md` |
| `specs/llms.txt` | `specs/_guide/llms.txt` |
| `META_SPEC_TEMPLATE` | `PATTERN_REGISTRY` (update context) |
| `ai-friendliness-audit` (as example) | `canonical-naming-conventions` |

### Deleted Specs - Remove References

- `specs/ai-friendliness-audit/` → Use `canonical-naming-conventions` as example
- `specs/jetbrains-mcp-skill/` → Content in `.claude/skills/jetbrains-mcp.md`
- `specs/new-specialized-agents/` → Split into `specs/agents/`

### MCP Tool Removal (Category B)

Remove from `tools:` sections in `.claude/agents/*.md`:
```yaml
# WRONG
tools: [Read, Write, Edit, mcp__effect_docs__effect_docs_search]

# CORRECT
tools: [Read, Write, Edit]
```

### Deprecated API Fixes (Category C)

```typescript
// DEPRECATED
BS.toOptionalWithDefault(S.Boolean, false)

// CORRECT
BS.BoolWithDefault(false)
BS.FieldOptionOmittable(S.String)
BS.FieldSensitiveOptionOmittable(S.String)
```

### Missing File Templates

**REFLECTION_LOG.md** (Category F):
```markdown
# Reflection Log

> Cumulative learnings from spec execution.

---

## Log Format

Each entry follows the reflection schema from `specs/_guide/README.md`.

---

<!-- Entries added after phase completion -->
```

**README.md** (Category C) - Follow template in `.claude/agents/templates/readme-template.md` or copy structure from sibling package.

**AGENTS.md** (Category D) - Follow template in `.claude/agents/templates/agents-md-template.md`.

### Incomplete Slice References (Category E)

When documentation only mentions some slices:
```markdown
# INCOMPLETE
vertical slices in `packages/iam/*` and `packages/documents/*`

# COMPLETE (all 6 slices)
vertical slices in `packages/{iam,documents,calendar,knowledge,comms,customization}/*`
```

---

## Safety Rules

1. **Max 10 fixes per iteration** - Keeps commits reviewable
2. **Always lint after edits** - Run `bun run lint:fix`
3. **Commit after fixes** - Create audit trail
4. **Skip outputs/ and specs/ directories** - Historical records documenting past migrations and what paths existed before changes; these contain old paths BY DESIGN
5. **Skip RALPH_AUDIT_PROMPT.md** - Don't modify self
6. **Prefer removal over update** for truly stale content

---

## Blocked Condition

If you encounter an unfixable issue:

1. Document in `specs/agents-md-audit/outputs/blockers.md`
2. Output: `<promise>BLOCKED: [reason]</promise>`
3. Loop terminates for human review

---

## Verification Before Completion

Before outputting `REPO CLEAN`:

1. ALL audit commands (A1-G2) return empty
2. `bun run lint:fix` completes without errors
3. No uncommitted changes remain

Only then: `<promise>REPO CLEAN</promise>`
