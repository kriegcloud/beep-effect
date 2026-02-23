# P4 Handoff: Infrastructure Implementation

> Session handoff document for P4 execution
> Created: 2026-02-03

---

## Context Summary

### What Was Accomplished (P0-P3)

**P0-P2 (Analysis & Design)**:
- Inventoried 31 agents: 18 synced, 11 orphaned, 2 missing files
- Designed target architecture: 31 → 28 agents
- Identified IDE sync issues (Cursor 38-53% content loss)
- Created migration checklist

**P3 (Discoverability)**:
- Created `specs/_guide/AGENT_CAPABILITIES.md` - agent selection matrix
- Created `.claude/skills/discovery-kit/SKILL.md` - search patterns
- Created `specs/_guide/scripts/validate-handoff.sh` - token budget validator

### P3 Deliverables Location

| Deliverable | Path |
|-------------|------|
| Capability matrix | `specs/_guide/AGENT_CAPABILITIES.md` |
| Discovery kit | `.claude/skills/discovery-kit/SKILL.md` |
| Token validator | `specs/_guide/scripts/validate-handoff.sh` |
| P3 summary | `outputs/P3_DISCOVERABILITY.md` |

---

## P4 Objective

Implement the infrastructure changes designed in P2:
1. Agent registry consolidation
2. CLAUDE.md hierarchy simplification
3. IDE configuration fixes

---

## Entry Criteria (All Met)

- [x] Agent capability matrix exists
- [x] Discovery kit skill exists
- [x] Token validator script works
- [x] P2 architecture design in `outputs/P2_ARCHITECTURE.md`
- [x] Migration checklist in `outputs/migration-checklist.md`

---

## Exit Criteria

- [ ] `doc-maintainer.md` created (merge of agents-md-updater + readme-updater)
- [ ] `agents-md-updater.md` and `readme-updater.md` deleted
- [ ] `agents-manifest.yaml` updated (28 entries, no missing, no orphaned)
- [ ] `.claude/rules/meta-thinking.md` created
- [ ] `.claude/rules/code-standards.md` created
- [ ] Root `CLAUDE.md` simplified with navigation links
- [ ] `.claude/CLAUDE.md` deleted
- [ ] Cursor rules re-synced (100% content parity)
- [ ] Windsurf symlinks created (rules and skills)
- [ ] `.codex/` and `.opencode/` deleted
- [ ] **P5 handoff documents created** (if further work needed)

---

## Implementation Tasks

### Task 1: Merge Documentation Agents

**Action**: Create `doc-maintainer.md` from merged content

**Source files**:
- `.claude/agents/agents-md-updater.md` (164 lines)
- `.claude/agents/readme-updater.md` (219 lines)

**Target**: `.claude/agents/doc-maintainer.md` (~250 lines)

**Key decisions**:
- Combine workflows for AGENTS.md and README.md
- Add `target` parameter: `enum[agents|readme|both]`
- Deduplicate verification logic
- Keep all tools: Glob, Grep, Read, Write, Edit

### Task 2: Update Agent Manifest

**Actions**:
1. Remove `code-observability-writer` (no file exists)
2. Remove `effect-schema-expert` (no file exists)
3. Remove `agents-md-updater` and `readme-updater` (merged)
4. Add `doc-maintainer` entry
5. Add 11 orphaned agents with tier assignments

**Orphaned agents to add**:
- `codebase-explorer` (tier 1)
- `documentation-expert` (tier 4)
- `domain-modeler` (tier 2)
- `effect-expert` (tier 2)
- `effect-platform` (tier 2)
- `lawyer` (tier 3)
- `mcp-enablement` (tier 2)
- `observability-expert` (tier 4)
- `react-expert` (tier 4)
- `schema-expert` (tier 2)
- `wealth-management-domain-expert` (tier 4)

### Task 3: CLAUDE.md Migration

**Step 1**: Create new rule files from `.claude/CLAUDE.md`

| Content | Target |
|---------|--------|
| `<effect-thinking>` | `.claude/rules/meta-thinking.md` |
| `<code-standards>` + `<code-field>` | `.claude/rules/code-standards.md` |

**Step 2**: Simplify root `CLAUDE.md`

- Remove behavioral preamble (duplicated in rules)
- Keep: Overview, Stack, Commands, Architecture, Specs, IDE
- Add: Navigation links to all rule files

**Step 3**: Delete `.claude/CLAUDE.md`

### Task 4: IDE Configuration

**Cursor** (requires script):
```bash
bun run scripts/sync-cursor-rules.ts
```

**Windsurf** (symlinks):
```bash
ln -sfn ../.claude/rules .windsurf/rules
ln -sfn ../.claude/skills .windsurf/skills
```

**Cleanup**:
```bash
rm -rf .codex/ .opencode/
```

---

## Recommended Agent Usage

| Agent | Task |
|-------|------|
| doc-writer | Create `doc-maintainer.md` (new agent definition) |
| doc-writer | Create rule files (`meta-thinking.md`, `code-standards.md`) |
| doc-writer | Simplify root `CLAUDE.md` |
| Bash (orchestrator) | Run sync script, create symlinks, cleanup |

---

## Validation Commands

```bash
# Verify agent count
ls -1 .claude/agents/*.md | wc -l
# Expected: 28

# Verify manifest entries
grep -c "^  [a-z]" .claude/agents-manifest.yaml
# Expected: 28 agent entries

# Verify new rule files
ls .claude/rules/
# Expected: behavioral.md, effect-patterns.md, general.md, meta-thinking.md, code-standards.md

# Verify Cursor parity
wc -l .claude/rules/*.md .cursor/rules/*.mdc
# MDC files should be ~4-5 lines longer than MD files

# Verify Windsurf symlinks
ls -la .windsurf/
# rules -> ../.claude/rules
# skills -> ../.claude/skills

# Verify cleanup
ls .codex/ .opencode/ 2>/dev/null
# Should error (directories deleted)
```

---

## File References

| File | Purpose |
|------|---------|
| `outputs/P2_ARCHITECTURE.md` | Target state design |
| `outputs/migration-checklist.md` | Step-by-step tasks |
| `outputs/agent-consolidation-plan.md` | Agent decisions |
| `.claude/agents-manifest.yaml` | Current manifest |
| `.claude/CLAUDE.md` | Content to migrate |
| `scripts/sync-cursor-rules.ts` | Cursor sync script |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Merged agent too complex | Split back if users report confusion |
| Symlinks break on Windows | Document junction alternative |
| Sync script loses content | Validate line counts before/after |
| Missing navigation links | Verify all 5 rule files linked |

---

## Constraints

- Token budget: Handoffs ≤4K tokens
- Backward compatibility: Existing workflows must work
- No functional changes: Infrastructure only

---

## Phase Completion Requirement

**A phase is NOT complete until:**
1. All exit criteria deliverables exist
2. Next phase handoff created (if further work needed)
3. REFLECTION_LOG.md updated

---

## Quick Start

```bash
# Read P2 design
cat outputs/P2_ARCHITECTURE.md

# Read migration checklist
cat outputs/migration-checklist.md

# Start P4 implementation
# 1. Merge documentation agents
# 2. Update manifest
# 3. Migrate CLAUDE.md content
# 4. Fix IDE configuration
```
