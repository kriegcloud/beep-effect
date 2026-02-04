# Migration Checklist - Agent Infrastructure Rationalization

> Phase-by-phase migration plan with verification steps
> Created: 2026-02-03
> Status: Ready for execution

---

## Overview

This checklist guides the migration from current state (31 agents, 6 skill dirs, 3 CLAUDE.md files) to target state (27 agents, 2 skill sources, 2 CLAUDE.md files) while maintaining backward compatibility.

**Estimated Total Time:** 6-8 hours
**Risk Level:** Medium (includes rollback procedures)

---

## Pre-Migration Validation

Run these checks BEFORE starting any migration tasks.

### 1. Capture Current State

```bash
# Create backup branch
git checkout -b pre-migration-backup
git add -A
git commit -m "Pre-migration snapshot - agent infrastructure"
git checkout agent-optimizations

# Snapshot current metrics
bun repo-cli agents-validate > /tmp/pre-migration-agents.txt
ls -1 .claude/agents/*.md | wc -l > /tmp/pre-migration-count.txt
find . -maxdepth 2 -type d -name skills > /tmp/pre-migration-skills.txt

# Verify IDE configurations work
ls -la .cursor/rules/*.mdc
ls -la .windsurf/rules
```

**Expected Output:**
- Backup branch created
- 29 agent files (2 missing)
- Cursor rules: 3 .mdc files
- Windsurf rules: symlink to .claude/rules

### 2. Verify Tooling

```bash
# Ensure sync script works
bun run scripts/sync-cursor-rules.ts

# Verify agent validation exists
bun repo-cli agents-validate --help

# Check git working tree
git status
```

**Expected Output:**
- Sync script completes without errors
- Agent validation shows help text
- Working tree is clean (or only expected changes)

### 3. Document Current Behavior

```bash
# Test current agent loading (if applicable)
# Record which agents are currently invoked successfully
# Test IDE rule loading in Cursor and Windsurf
```

**Checklist:**
- [ ] Backup branch created
- [ ] Current metrics captured
- [ ] Sync script tested
- [ ] Git working tree verified
- [ ] Current behavior documented

---

## Phase 3: IDE Configuration Fixes (CRITICAL - Do First)

**Priority:** P0 - Blocking issues for developers
**Estimated Time:** 30 minutes
**Risk:** Low (isolated changes, easy rollback)

### Task 3.1: Re-sync Cursor Rules

**Issue:** 38-53% content loss in Cursor .mdc files

```bash
# Re-run sync script to fix content drift
bun run scripts/sync-cursor-rules.ts

# Verify output
git diff .cursor/rules/

# Expected changes: Large additions to general.mdc and effect-patterns.mdc
```

**Verification:**

```bash
# Check file sizes match source
wc -l .claude/rules/general.md .cursor/rules/general.mdc
# Expected: Similar line counts (±10 lines for frontmatter)

wc -l .claude/rules/effect-patterns.md .cursor/rules/effect-patterns.mdc
# Expected: Similar line counts (±10 lines for frontmatter)

wc -l .claude/rules/behavioral.md .cursor/rules/behavioral.mdc
# Expected: Similar line counts (±10 lines for frontmatter)
```

**Success Criteria:**
- [ ] general.mdc restored from 91 → ~148 lines
- [ ] effect-patterns.mdc restored from 316 → ~673 lines
- [ ] behavioral.mdc remains ~55 lines
- [ ] All critical sections present (EntityId, Testing, Test Framework)
- [ ] No sync script errors

**Rollback:** `git restore .cursor/rules/`

### Task 3.2: Verify Windsurf Symlink

**Issue:** Confirm symlink exists and points correctly

```bash
# Check symlink
ls -la .windsurf/rules

# Expected output: lrwxrwxrwx ... .windsurf/rules -> ../.claude/rules

# Verify symlink content accessible
ls -la .windsurf/rules/*.md
# Expected: 3 files (behavioral.md, effect-patterns.md, general.md)
```

**If symlink missing (should not be the case):**

```bash
# Create symlink
mkdir -p .windsurf
ln -s ../.claude/rules .windsurf/rules

# Verify
ls -la .windsurf/rules
```

**Success Criteria:**
- [ ] Symlink exists at `.windsurf/rules`
- [ ] Points to `../.claude/rules`
- [ ] All 3 rule files accessible through symlink

**Rollback:** `rm .windsurf/rules` (if created new)

### Task 3.3: Verify Content Parity

**Issue:** Ensure all IDEs receive identical rule content

```bash
# Compare source vs Cursor (after sync)
diff <(cat .claude/rules/general.md | grep -v '^---' | head -150) \
     <(cat .cursor/rules/general.mdc | grep -v '^---' | head -150)
# Expected: Minimal diff (frontmatter only)

# Verify Windsurf sees same content
diff .claude/rules/general.md .windsurf/rules/general.md
# Expected: Identical (symlink)
```

**Success Criteria:**
- [ ] Cursor .mdc files match .claude .md files (except frontmatter)
- [ ] Windsurf symlink provides direct access to .claude files
- [ ] No missing sections in any IDE

**Rollback:** `git restore .cursor/rules/`

### Task 3.4: Add CI Validation (Optional)

**Issue:** Prevent future drift

```bash
# Create validation script (if not exists)
cat > .github/workflows/validate-rules.yml << 'EOF'
name: Validate IDE Rules

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun run scripts/sync-cursor-rules.ts
      - run: git diff --exit-code .cursor/rules/
EOF
```

**Success Criteria:**
- [ ] CI workflow created (optional)
- [ ] Workflow validates rule parity

**Skip:** If CI setup is out of scope for this phase

---

## Phase 4: Agent Consolidation

**Priority:** P1 - Immediate cleanup
**Estimated Time:** 2-3 hours
**Risk:** Medium (changes agent availability)

### Task 4.1: Create doc-maintainer Agent (Merge)

**Action:** Merge `agents-md-updater` + `readme-updater` → `doc-maintainer`

```bash
# Read both source agents
cat .claude/agents/agents-md-updater.md
cat .claude/agents/readme-updater.md

# Create merged agent (manual step - requires design)
# This is a template - actual content needs careful merging

cat > .claude/agents/doc-maintainer.md << 'EOF'
---
name: doc-maintainer
tier: 4
capability: write-files
description: |
  Maintains package documentation (AGENTS.md and README.md files).
  Audits references, validates imports, enforces Effect patterns.

tools:
  - Glob
  - Grep
  - Read
  - Write
  - Edit

triggers:
  - "update documentation"
  - "audit packages"
  - "check references"
  - "update agents.md"
  - "update readme"
  - "fix stale references"

input:
  targetDocs: agents|readme|both (defaults to both)
  packages: string[] (optional, scans all if not provided)

output:
  agentsUpdated: string[]
  readmesUpdated: string[]
  issuesFound: object

model: sonnet
---

# doc-maintainer

[Merged content from both agents - to be written]

## Responsibilities

1. **AGENTS.md Maintenance** (from agents-md-updater):
   - Audit AGENTS.md files for accuracy
   - Validate import paths and package references
   - Remove deprecated MCP shortcuts
   - Enforce Effect pattern usage

2. **README.md Maintenance** (from readme-updater):
   - Audit README.md files for consistency
   - Validate package.json alignment
   - Update dependency tables
   - Verify usage examples

## Workflow

[Combined workflow from both agents]

EOF
```

**Verification:**

```bash
# Test agent loads (if tooling exists)
# Manual review of merged content

# Ensure all capabilities from both parents are present
grep -A5 "Responsibilities" .claude/agents/doc-maintainer.md
```

**Success Criteria:**
- [ ] `doc-maintainer.md` created with merged capabilities
- [ ] All triggers from both parents included
- [ ] Toolset matches both parents (Glob, Grep, Read, Write, Edit)
- [ ] Documentation explains dual responsibility
- [ ] Model set to `sonnet` (from both parents)

**Rollback:** `git restore .claude/agents/doc-maintainer.md && rm -f .claude/agents/doc-maintainer.md`

### Task 4.2: Deprecate Source Agents (Soft Delete)

**Action:** Rename merged agents to indicate deprecation

```bash
# Keep files for 1-2 spec cycles, mark as deprecated
mv .claude/agents/agents-md-updater.md .claude/agents/_deprecated_agents-md-updater.md
mv .claude/agents/readme-updater.md .claude/agents/_deprecated_readme-updater.md

# Add deprecation notice to both files
for file in .claude/agents/_deprecated_*.md; do
  echo -e "\n\n---\n**DEPRECATED:** This agent has been merged into \`doc-maintainer\`. Use that agent instead.\n" >> "$file"
done
```

**Success Criteria:**
- [ ] Both source agents renamed with `_deprecated_` prefix
- [ ] Deprecation notice added to both files
- [ ] Files still readable (for reference)

**Rollback:**
```bash
mv .claude/agents/_deprecated_agents-md-updater.md .claude/agents/agents-md-updater.md
mv .claude/agents/_deprecated_readme-updater.md .claude/agents/readme-updater.md
```

### Task 4.3: Remove Missing Agent Entries

**Action:** Document missing agents, decide to create or remove

**Missing Agents:**
1. `code-observability-writer` - Manifest entry, no file
2. `effect-schema-expert` - Manifest entry, no file

**Note:** Current analysis shows NO MANIFEST FILE EXISTS. Skip this task unless manifest is created.

```bash
# If manifest exists (currently does not):
# grep -v "code-observability-writer" manifest.yml > manifest.yml.tmp
# grep -v "effect-schema-expert" manifest.yml.tmp > manifest.yml
# rm manifest.yml.tmp

# Document decision
echo "Decided to skip - equivalent agents exist (observability-expert, schema-expert)" > /tmp/missing-agents-decision.txt
```

**Success Criteria:**
- [ ] Missing agents documented
- [ ] Decision recorded (skip creation, equivalents exist)
- [ ] No manifest changes needed (no manifest file)

**Rollback:** N/A (no manifest file)

### Task 4.4: Add Orphaned Agents to Manifest

**Note:** No manifest file currently exists. This task creates initial manifest structure.

**Orphaned Agents (11 total):**
- codebase-explorer
- documentation-expert
- domain-modeler
- effect-expert
- effect-platform
- lawyer
- mcp-enablement
- observability-expert
- react-expert
- schema-expert
- wealth-management-domain-expert

**Decision:** Create manifest.yml with ALL agents (existing + orphaned)

```bash
# Create initial manifest (structure to be defined)
# This is a placeholder - actual schema needs to be designed

cat > .claude/agents/manifest.yml << 'EOF'
# Agent Manifest
# Defines all available agents with metadata

version: 1.0

agents:
  # Tier 1: Foundation
  - name: codebase-researcher
    tier: 1
    capability: read-only
    file: codebase-researcher.md

  - name: codebase-explorer
    tier: 1
    capability: read-only
    file: codebase-explorer.md

  # [... continue for all agents ...]

  # Tier 4: Writers
  - name: doc-maintainer
    tier: 4
    capability: write-files
    file: doc-maintainer.md

  # Domain Experts (untiered)
  - name: domain-modeler
    capability: read-only
    file: domain-modeler.md

  # [... etc ...]

EOF
```

**Verification:**

```bash
# Validate manifest (if validator exists)
bun repo-cli agents-validate

# Count manifest entries vs files
grep "^  - name:" .claude/agents/manifest.yml | wc -l
ls -1 .claude/agents/*.md | grep -v "_deprecated" | wc -l
# Expected: Same count
```

**Success Criteria:**
- [ ] manifest.yml created
- [ ] All 28 active agents listed (29 files - 2 deprecated + 1 new)
- [ ] All orphaned agents included
- [ ] Validation passes

**Rollback:** `rm .claude/agents/manifest.yml`

### Task 4.5: Verify Manifest Validation

```bash
# Run agent validation
bun repo-cli agents-validate

# Expected output: All agents validated, no errors

# Check for missing files
bun repo-cli agents-validate --strict

# Expected: May show deprecated agents as warnings (OK)
```

**Success Criteria:**
- [ ] Validation passes for all active agents
- [ ] No missing file errors (except deprecated)
- [ ] Agent count: 28 active agents

**Rollback:** `git restore .claude/agents/manifest.yml`

---

## Phase 5: Skill & Config Cleanup

**Priority:** P2 - Reduce duplication
**Estimated Time:** 2-3 hours
**Risk:** Medium (changes file locations)

### Task 5.1: Audit Skill Directories

**Action:** Identify which directories are actually used

```bash
# List all skill directories and their contents
for dir in .claude/skills .agents/skills .cursor/skills .windsurf/skills .codex/skills .opencode/skills skills; do
  echo "=== $dir ==="
  ls -la "$dir" 2>/dev/null | head -10
  echo
done

# Check for symlinks
find . -maxdepth 2 -name skills -type l

# Check for broken symlinks
find . -maxdepth 2 -name skills -type l -xtype l
```

**Document findings:**
```bash
cat > /tmp/skill-directory-audit.txt << 'EOF'
Skill Directory Audit:

.claude/skills/     - Authoritative source (52 skills)
.agents/skills/     - Master copies for agents (9 skills)
.cursor/skills/     - [TO AUDIT]
.windsurf/skills/   - Symlink to ? [TO VERIFY]
.codex/skills/      - Unused (1 broken symlink) - DELETE
.opencode/skills/   - Unused - DELETE
skills/             - Root directory - [TO AUDIT]
EOF
```

**Success Criteria:**
- [ ] All skill directories listed
- [ ] Symlink targets identified
- [ ] Unused directories marked for deletion
- [ ] Audit documented

### Task 5.2: Delete Unused Skill Directories

**Action:** Remove .codex/skills and .opencode/skills

```bash
# Verify directories are unused (no references in codebase)
grep -r "\.codex/skills" . --exclude-dir=.git
grep -r "\.opencode/skills" . --exclude-dir=.git
# Expected: No matches

# Delete directories
rm -rf .codex/skills
rm -rf .opencode/skills

# Verify deletion
ls .codex/skills 2>&1 | grep "No such file"
ls .opencode/skills 2>&1 | grep "No such file"
```

**Success Criteria:**
- [ ] `.codex/skills` deleted
- [ ] `.opencode/skills` deleted
- [ ] No references in codebase
- [ ] 6 skill directories → 5 skill directories

**Rollback:**
```bash
git restore .codex/skills
git restore .opencode/skills
```

### Task 5.3: Verify Skill Symlinks

**Action:** Ensure .cursor and .windsurf use correct symlinks

```bash
# Check Cursor skills
ls -la .cursor/skills
# If not symlink, needs conversion

# Check Windsurf skills
ls -la .windsurf/skills
# Expected: symlink (already exists per earlier check)

# If Cursor is not symlink, create it
if [ ! -L .cursor/skills ]; then
  # Backup existing
  mv .cursor/skills .cursor/skills.backup

  # Create symlink to .claude/skills
  ln -s ../.claude/skills .cursor/skills

  # Verify
  ls -la .cursor/skills
fi
```

**Success Criteria:**
- [ ] `.cursor/skills` is symlink to `.claude/skills`
- [ ] `.windsurf/skills` is symlink to `.claude/skills` or `.agents/skills`
- [ ] All skills accessible through symlinks

**Rollback:**
```bash
rm .cursor/skills
mv .cursor/skills.backup .cursor/skills
```

### Task 5.4: Establish Skill Hierarchy

**Action:** Define authoritative sources

**Proposed Structure:**
```
.claude/skills/          # Authoritative source for Claude-specific skills
.agents/skills/          # Master copies for agent skills (shared across IDEs)
.cursor/skills/   -> symlink to .claude/skills
.windsurf/skills/ -> symlink to .agents/skills (or .claude/skills)
skills/                  # [TO DECIDE: Keep or move to .claude/]
```

**Implementation:**
```bash
# Document hierarchy
cat > .claude/skills/README.md << 'EOF'
# Skill Hierarchy

## Authoritative Sources

- `.claude/skills/` - Claude Code specific skills (52 skills)
- `.agents/skills/` - Agent-specific skills, shared across IDEs (9 skills)

## Derived/Symlinked

- `.cursor/skills/` → `.claude/skills/` (symlink)
- `.windsurf/skills/` → `.agents/skills/` (symlink)

## Deprecated

- `.codex/skills/` - DELETED
- `.opencode/skills/` - DELETED

EOF
```

**Success Criteria:**
- [ ] Hierarchy documented in README.md
- [ ] Two authoritative sources defined
- [ ] Symlinks established for IDE tools

### Task 5.5: Migrate .claude/CLAUDE.md Content

**Action:** Move unique content from `.claude/CLAUDE.md` to rules files

**Unique Content Sections:**
1. `<effect-thinking>` (24 lines) → New file: `.claude/rules/meta-thinking.md`
2. `<code-standards>` (43 lines) → New file: `.claude/rules/code-standards.md`
3. `<code-field>` (25 lines) → Append to `.claude/rules/code-standards.md`

```bash
# Create meta-thinking.md
cat > .claude/rules/meta-thinking.md << 'EOF'
# Meta-Thinking Patterns

## Effect Mental Models

Effect<Success, Error, Requirements>

a |> f |> g |> h  ≡  pipe(a, f, g, h)
f ∘ g ∘ h         ≡  flow(f, g, h)
f(g(x))           →  pipe(x, g, f)           -- avoid nested calls

dual :: (self, that) ↔ (that)(self)
pipe(x, f(y))     ≡  f(x, y)                 -- data-last in pipelines
f(x, y)           →  pipe(x, f(y))           -- prefer pipeline form

∥(a, b, c)        ≡  Effect.all([a, b, c], { concurrency: "unbounded" })

R ⊃ {Service₁, Service₂} → Layer.provide(Service₁Live, Service₂Live)

E = Error₁ | Error₂ | Error₃ → catchTag("Error₁", handler)

yield* effect    ≡  ← effect (bind)
Effect.gen(function*() { ... })

need(time)       → Clock
need(randomness) → Random
need(filesystem) → FileSystem
need(http)       → HttpClient

## Uncertainty Handling

unclear(requirements) → ask(user) → proceed
ambiguous(approach) → present({options, tradeoffs}) → await(decision)
blocked(task) → report(blocker) ∧ suggest(alternatives)
risk(action) ≤ low → prefer(action) over prefer(inaction)

EOF

# Create code-standards.md
cat > .claude/rules/code-standards.md << 'EOF'
# Code Standards

## Style

nested-loops        → pipe(∘)
conditionals        → Match.typeTags(ADT) ∨ $match
domain-types        := Schema.TaggedStruct
imports             := ∀ X → import * as X from "effect/X"
{Date.now, random}  → {Clock, Random}

## Effect Patterns

Effect.gen          over  Effect.flatMap chains
pipe(a, f, g)       over  g(f(a))
Schema.TaggedStruct over  plain interfaces
Layer.provide       over  manual dependency passing
catchTag            over  catchAll with conditionals
Data.TaggedError    over  new Error()

as any              →  Schema.decode ∨ type guard
Promise             →  Effect.tryPromise
try/catch           →  Effect.try ∨ Effect.catchTag
null/undefined      →  Option<A>
throw               →  Effect.fail(TaggedError)

## UI Standards

¬borders → lightness-variation
depth := f(background-color)
elevation := Δlightness ∧ ¬stroke

## Documentation Standards

principle := self-explanatory(code) → ¬comments

forbidden := {
  inline-comments,
  @example blocks,
  excessive-jsdoc
}

unclear(code) → rewrite(code) ∧ ¬comment(code)

## Code Field Principles

-- inhibition > instruction

pre(code)           := stated(assumptions)
claim(correct)      := verified(correct)
handle(path)        := ∀path ∈ {happy, edge, adversarial}

surface-before-handle := {
  assumptions(input, environment),
  break-conditions,
  adversarial(caller),
  confusion(maintainer)
}

forbidden := {
  code ← ¬assumptions,
  claim(correct) ← ¬verified,
  happy-path ∧ gesture(rest),
  import(¬needed),
  solve(¬asked),
  produce(¬debuggable(3am))
}

correctness ≠ "works"
correctness := conditions(works) ∧ behavior(¬conditions)

EOF
```

**Verification:**

```bash
# Check new files created
ls -la .claude/rules/meta-thinking.md
ls -la .claude/rules/code-standards.md

# Verify content migrated
wc -l .claude/rules/meta-thinking.md
wc -l .claude/rules/code-standards.md
```

**Success Criteria:**
- [ ] `meta-thinking.md` created (~35 lines)
- [ ] `code-standards.md` created (~70 lines)
- [ ] All unique content from `.claude/CLAUDE.md` migrated

**Rollback:**
```bash
rm .claude/rules/meta-thinking.md
rm .claude/rules/code-standards.md
```

### Task 5.6: Delete .claude/CLAUDE.md

**Action:** Remove redundant file after content migration

```bash
# Verify all unique content has been migrated (manual check)
cat .claude/CLAUDE.md
# Confirm nothing unique remains

# Delete file
rm .claude/CLAUDE.md

# Verify deletion
ls .claude/CLAUDE.md 2>&1 | grep "No such file"
```

**Success Criteria:**
- [ ] All unique content migrated to rules
- [ ] `.claude/CLAUDE.md` deleted
- [ ] 3 CLAUDE.md files → 2 CLAUDE.md files (root + rules)

**Rollback:**
```bash
git restore .claude/CLAUDE.md
```

### Task 5.7: Update Root CLAUDE.md References

**Action:** Update root CLAUDE.md to reference new rule files

```bash
# Add references to new rule files
# (Manual edit to root CLAUDE.md)

# Example additions:
# | Document | Purpose |
# | .claude/rules/meta-thinking.md | Effect mental models |
# | .claude/rules/code-standards.md | Code style and standards |
```

**Success Criteria:**
- [ ] Root CLAUDE.md updated with new references
- [ ] Links to all rule files present
- [ ] No broken links

**Rollback:**
```bash
git restore CLAUDE.md
```

---

## Post-Migration Validation

Run these checks AFTER completing all migration tasks.

### 1. Agent Validation

```bash
# Run agent validation
bun repo-cli agents-validate

# Expected: All agents pass, no errors (except deprecated warnings)

# Count active agents
ls -1 .claude/agents/*.md | grep -v "_deprecated" | wc -l
# Expected: 28 agents (29 files - 2 deprecated + 1 new doc-maintainer)
```

**Success Criteria:**
- [ ] Agent validation passes
- [ ] 28 active agents
- [ ] 2 deprecated agents
- [ ] No missing file errors

### 2. IDE Rule Loading

```bash
# Verify Cursor rules
ls -la .cursor/rules/*.mdc
wc -l .cursor/rules/*.mdc
# Expected: 5 files (3 synced + 2 new), full content

# Verify Windsurf rules
ls -la .windsurf/rules/*.md
# Expected: 5 files (through symlink), full content

# Test loading in IDEs (manual)
# - Open project in Cursor, verify rules load
# - Open project in Windsurf, verify rules load
```

**Success Criteria:**
- [ ] Cursor .mdc files have full content
- [ ] Windsurf symlink works
- [ ] Both IDEs load rules successfully
- [ ] 5 rule files accessible in each IDE

### 3. Skill Availability

```bash
# Verify skill directories
ls -1 .claude/skills/*.md | wc -l
# Expected: 52 skills

ls -1 .agents/skills/*.md | wc -l
# Expected: 9 skills

# Verify symlinks work
ls -1 .cursor/skills/*.md | wc -l
# Expected: 52 skills (through symlink)

ls -1 .windsurf/skills/*.md | wc -l
# Expected: Should work (verify target)

# Verify deleted directories gone
ls .codex/skills 2>&1 | grep "No such file"
ls .opencode/skills 2>&1 | grep "No such file"
```

**Success Criteria:**
- [ ] .claude/skills: 52 skills
- [ ] .agents/skills: 9 skills
- [ ] Symlinks work correctly
- [ ] Unused directories deleted
- [ ] 6 directories → 5 directories

### 4. Configuration Consistency

```bash
# Verify CLAUDE.md consistency
ls -la CLAUDE.md .claude/CLAUDE.md 2>&1
# Expected: Root exists, .claude/CLAUDE.md does not exist

# Verify rule files
ls -1 .claude/rules/*.md
# Expected: 5 files (behavioral, effect-patterns, general, meta-thinking, code-standards)

# Check for duplicated content
grep -r "effect-thinking" .
# Expected: Only in .claude/rules/meta-thinking.md and root references
```

**Success Criteria:**
- [ ] Root CLAUDE.md exists
- [ ] .claude/CLAUDE.md deleted
- [ ] 5 rule files present
- [ ] No content duplication

### 5. Metrics Comparison

```bash
# Compare to pre-migration
diff /tmp/pre-migration-agents.txt <(bun repo-cli agents-validate)

# Agent count
echo "Before: $(cat /tmp/pre-migration-count.txt)"
echo "After: $(ls -1 .claude/agents/*.md | grep -v "_deprecated" | wc -l)"

# Skill directories
echo "Before:"
cat /tmp/pre-migration-skills.txt
echo "After:"
find . -maxdepth 2 -type d -name skills
```

**Success Criteria:**
- [ ] Agent count: 29 → 28 (active)
- [ ] Skill directories: 7 → 5
- [ ] CLAUDE.md files: 3 → 2 (counting root + rules as hierarchy)

---

## Rollback Plan

If critical issues arise during migration, use this rollback procedure.

### Complete Rollback (Nuclear Option)

```bash
# Abort all changes, restore from backup branch
git stash
git checkout pre-migration-backup
git checkout -b migration-retry

# Verify state restored
git log --oneline -5
```

### Partial Rollback (Phase-by-Phase)

#### Rollback Phase 5 (Skill & Config Cleanup)

```bash
git restore .claude/CLAUDE.md
git restore .claude/rules/meta-thinking.md
git restore .claude/rules/code-standards.md
git restore .codex/skills
git restore .opencode/skills
rm .cursor/skills && mv .cursor/skills.backup .cursor/skills  # If applicable
```

#### Rollback Phase 4 (Agent Consolidation)

```bash
git restore .claude/agents/manifest.yml
mv .claude/agents/_deprecated_agents-md-updater.md .claude/agents/agents-md-updater.md
mv .claude/agents/_deprecated_readme-updater.md .claude/agents/readme-updater.md
rm .claude/agents/doc-maintainer.md
```

#### Rollback Phase 3 (IDE Fixes)

```bash
git restore .cursor/rules/
# Windsurf symlink is safe to leave as-is
```

### Verification After Rollback

```bash
# Ensure everything works
bun repo-cli agents-validate
bun run check
git status
```

---

## Success Metrics

### Target Metrics (After Full Migration)

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Active Agents | 29 | 28 | -1 (merge) |
| Total Agent Files | 29 | 30 | +1 (deprecated markers) |
| Synced Agents | 18 | 28 | +10 (all active) |
| Orphaned Agents | 11 | 0 | -11 (added to manifest) |
| Missing Agents | 2 | 0 | -2 (resolved) |
| Skill Directories | 7 | 5 | -2 (deleted unused) |
| CLAUDE.md Files | 3 | 2 | -1 (consolidated) |
| Cursor Rule Accuracy | 47-62% | 100% | Full parity |
| IDE Config Symlinks | 1 | 3 | +2 (Cursor skills + verified Windsurf) |

### Token Savings Estimate

| Category | Savings |
|----------|---------|
| Agent merge (doc-maintainer) | ~250 tokens |
| CLAUDE.md consolidation | ~860 tokens |
| Removed skill duplication | ~500 tokens |
| **Total Estimated Savings** | ~1,610 tokens |

### Quality Improvements

- [ ] All IDEs receive identical rule content
- [ ] No orphaned agents
- [ ] Clear skill hierarchy
- [ ] Single source of truth for each rule
- [ ] Backward compatibility maintained (deprecated agents kept for reference)

---

## Notes and Recommendations

### Backward Compatibility

**Deprecated Agents:**
- Keep `_deprecated_*` files for 2-3 specification cycles
- Add clear deprecation notices
- Monitor usage (if logging available)
- Remove after confirmed no usage

**Alias Support:**
- If agent invocation supports aliases, add:
  - `agents-md-updater` → `doc-maintainer --target=agents`
  - `readme-updater` → `doc-maintainer --target=readme`

### Future Improvements

**Phase 6 (Future Spec):**
1. Evaluate 7 medium-priority agent merges
2. Add automated sync validation to CI
3. Create agent usage analytics
4. Consider additional consolidations based on usage data

**Monitoring:**
- Track agent invocation frequency
- Monitor deprecated agent usage
- Collect feedback on doc-maintainer merge

### Risk Mitigation

**High-Risk Tasks:**
- Agent consolidation (Task 4.1) - requires careful design
- Skill directory changes (Task 5.2) - affects multiple IDEs

**Low-Risk Tasks:**
- Cursor sync (Task 3.1) - isolated, easy rollback
- Symlink creation (Task 3.2) - non-destructive

**Recommended Execution Order:**
1. Phase 3 (IDE fixes) - low risk, high value
2. Phase 5 (cleanup) - medium risk, clear rollback
3. Phase 4 (agent consolidation) - highest risk, requires design

---

## Appendices

### A. File Manifest

**Created:**
- `.claude/agents/manifest.yml` (new)
- `.claude/agents/doc-maintainer.md` (new)
- `.claude/rules/meta-thinking.md` (new)
- `.claude/rules/code-standards.md` (new)

**Modified:**
- `.cursor/rules/*.mdc` (re-synced)
- `CLAUDE.md` (updated references)
- `.claude/agents/_deprecated_*.md` (renamed)

**Deleted:**
- `.claude/CLAUDE.md`
- `.codex/skills/`
- `.opencode/skills/`

### B. Command Reference

```bash
# Quick validation suite
alias validate-all='bun repo-cli agents-validate && bun run check && git status'

# Count agents
alias count-agents='ls -1 .claude/agents/*.md | grep -v "_deprecated" | wc -l'

# Verify rules
alias verify-rules='diff <(ls -1 .claude/rules/*.md) <(ls -1 .windsurf/rules/*.md)'

# Check symlinks
alias check-symlinks='find . -maxdepth 2 -name skills -type l -ls'
```

### C. Decision Log

| Decision | Rationale |
|----------|-----------|
| Keep deprecated agents as `_deprecated_*` | Allows reference during transition period |
| Create manifest.yml | No existing manifest, needed for validation |
| Delete .codex and .opencode skills | No references in codebase, unused |
| Merge agents-md-updater + readme-updater | 82% similarity, complementary targets |
| Create 2 new rule files | Consolidate .claude/CLAUDE.md unique content |
| Symlink Cursor/Windsurf skills | Single source of truth, prevent drift |

---

**Migration Checklist Version:** 1.0
**Last Updated:** 2026-02-03
**Next Review:** After Phase 4 completion
