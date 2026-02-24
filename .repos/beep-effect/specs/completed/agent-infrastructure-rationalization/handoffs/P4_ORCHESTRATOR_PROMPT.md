# P4 Orchestrator Prompt: Infrastructure Implementation

You are executing Phase 4 of the `agent-infrastructure-rationalization` spec.

---

## Context

P0-P3 established baseline, analyzed redundancies, designed architecture, and created discoverability tools:
- **31 agents** → **28 agents** (1 merge, 2 removals, 10 additions to manifest)
- **Cursor rules** have 38-53% content loss (needs re-sync)
- **~10% token savings** projected from consolidation
- Navigation tools created (capability matrix, discovery kit, token validator)

P4 implements the actual infrastructure changes.

---

## Your Mission

Implement infrastructure changes with these deliverables:

1. **doc-maintainer.md**: Merged agent (agents-md-updater + readme-updater)
2. **meta-thinking.md**: New rule file (from .claude/CLAUDE.md)
3. **code-standards.md**: New rule file (from .claude/CLAUDE.md)
4. **Updated agents-manifest.yaml**: 28 entries, no missing, no orphaned
5. **Simplified root CLAUDE.md**: With navigation links
6. **IDE fixes**: Cursor re-sync, Windsurf symlinks
7. **Cleanup**: Delete .codex/, .opencode/, .claude/CLAUDE.md
8. **P5 handoff** (if needed): HANDOFF_P5.md + P5_ORCHESTRATOR_PROMPT.md

---

## Agent Usage

| Agent | Task |
|-------|------|
| doc-writer | Create doc-maintainer.md (new merged agent) |
| doc-writer | Create rule files (meta-thinking.md, code-standards.md) |
| doc-writer | Simplify root CLAUDE.md |
| Bash (direct) | Sync scripts, symlinks, cleanup |

---

## Task Details

### 1. Merge Documentation Agents

Create `.claude/agents/doc-maintainer.md`:

```yaml
name: doc-maintainer
description: Maintains AGENTS.md and README.md files for packages
model: claude-sonnet-4-5
tools: [Glob, Grep, Read, Write, Edit]
parameters:
  target: enum[agents|readme|both]  # Default: both
  packages: string[]?               # Optional filter
```

**Source content**:
- `.claude/agents/agents-md-updater.md` → AGENTS.md workflow
- `.claude/agents/readme-updater.md` → README.md workflow

**After creation, delete source files**.

### 2. Create New Rule Files

**meta-thinking.md** (from `.claude/CLAUDE.md` `<effect-thinking>` section):

```markdown
# Meta-Thinking Patterns

> Effect type algebra and composition notation

Effect<Success, Error, Requirements>

a |> f |> g |> h  ≡  pipe(a, f, g, h)
f ∘ g ∘ h         ≡  flow(f, g, h)
[... rest of effect-thinking content ...]
```

**code-standards.md** (from `.claude/CLAUDE.md` `<code-standards>` + `<code-field>`):

```markdown
# Code Standards

> Style guidelines and code field constraints

## Style
nested-loops        → pipe(∘)
conditionals        → Match.typeTags(ADT) ∨ $match
[... rest of code-standards and code-field content ...]
```

### 3. Update Agent Manifest

Edit `.claude/agents-manifest.yaml`:

**Remove entries** (no files exist):
- `code-observability-writer`
- `effect-schema-expert`

**Remove entries** (merged):
- `agents-md-updater`
- `readme-updater`

**Add entry**:
- `doc-maintainer` (tier 4, write-files)

**Add orphaned agents** (files exist, no manifest entry):

| Agent | Tier | Capability |
|-------|------|------------|
| codebase-explorer | 1 | read-only |
| documentation-expert | 4 | write-files |
| domain-modeler | 2 | write-files |
| effect-expert | 2 | write-files |
| effect-platform | 2 | write-files |
| lawyer | 3 | write-files |
| mcp-enablement | 2 | read-only |
| observability-expert | 4 | write-files |
| react-expert | 4 | write-files |
| schema-expert | 2 | write-files |
| wealth-management-domain-expert | 4 | read-only |

### 4. Simplify Root CLAUDE.md

**Keep sections**:
- Quick Reference (commands table)
- Project Overview
- Technology Stack
- Architecture & Boundaries
- Specifications
- IDE Compatibility

**Remove/simplify** (duplicated in rules):
- Behavioral preamble
- Detailed testing patterns (link to rules instead)
- Effect Collections Quick Reference (link instead)

**Add navigation**:
```markdown
## Detailed Rules

For comprehensive guidelines, see:
- [Behavioral Rules](.claude/rules/behavioral.md)
- [General Project Rules](.claude/rules/general.md)
- [Effect Patterns](.claude/rules/effect-patterns.md)
- [Meta-Thinking Patterns](.claude/rules/meta-thinking.md)
- [Code Standards](.claude/rules/code-standards.md)
```

### 5. IDE Configuration

**Cursor** (re-sync):
```bash
bun run scripts/sync-cursor-rules.ts
```

**Windsurf** (symlinks):
```bash
# Verify/create symlinks
ln -sfn ../.claude/rules .windsurf/rules
ln -sfn ../.claude/skills .windsurf/skills
```

### 6. Cleanup

```bash
# Delete merged agent files
rm .claude/agents/agents-md-updater.md
rm .claude/agents/readme-updater.md

# Delete migrated CLAUDE.md
rm .claude/CLAUDE.md

# Delete unused IDE directories
rm -rf .codex/
rm -rf .opencode/
```

---

## Verification

```bash
# Agent count
ls -1 .claude/agents/*.md | wc -l
# Expected: 28 (was 28 files, but 2 deleted + 1 created = 27... wait)
# Correction: 28 files - 2 deleted + 1 created = 27 files

# Actually verify the math:
# Current: 28 agent files
# Remove: agents-md-updater.md, readme-updater.md = -2
# Add: doc-maintainer.md = +1
# Final: 28 - 2 + 1 = 27 files

# Manifest entries (should match files)
grep -E "^  [a-z].*:$" .claude/agents-manifest.yaml | wc -l

# Rule files
ls .claude/rules/
# Expected: behavioral.md, code-standards.md, effect-patterns.md, general.md, meta-thinking.md

# Cursor parity (MDC ~4-5 lines longer)
wc -l .claude/rules/*.md .cursor/rules/*.mdc

# Windsurf symlinks
readlink .windsurf/rules
# Expected: ../.claude/rules

# Cleanup complete
ls .codex/ .opencode/ .claude/CLAUDE.md 2>&1 | grep -c "No such file"
# Expected: 3 (all deleted)
```

---

## Success Criteria

- [ ] `doc-maintainer.md` created with combined workflow
- [ ] Source agent files deleted (agents-md-updater, readme-updater)
- [ ] `agents-manifest.yaml` has 27 entries (27 files)
- [ ] No manifest entries for missing files
- [ ] No orphaned agent files (all in manifest)
- [ ] `meta-thinking.md` and `code-standards.md` created
- [ ] Root `CLAUDE.md` simplified with navigation
- [ ] `.claude/CLAUDE.md` deleted
- [ ] Cursor rules re-synced (verify line counts)
- [ ] Windsurf symlinks created
- [ ] `.codex/` and `.opencode/` deleted
- [ ] REFLECTION_LOG.md updated with P4 entry

---

## Handoff Reference

Full context: `specs/agent-infrastructure-rationalization/handoffs/HANDOFF_P4.md`
Architecture design: `specs/agent-infrastructure-rationalization/outputs/P2_ARCHITECTURE.md`
Migration checklist: `specs/agent-infrastructure-rationalization/outputs/migration-checklist.md`
