# P2 Orchestrator Prompt: Consolidation Architecture Design

You are executing Phase 2 of the `agent-infrastructure-rationalization` spec.

---

## Context

P0-P1 established baseline and identified redundancies:
- **31 agents**: 1 high-priority merge, 11 orphaned, 2 missing
- **53 skills**: scattered across 6 directories
- **IDE drift**: 38-53% content loss in Cursor rules
- **30% CLAUDE.md redundancy** across 3 files

P2 designs the target architecture for consolidation.

---

## Your Mission

Design the target state with these deliverables:

1. **P2_ARCHITECTURE.md**: Target directory structure and design
2. **agent-consolidation-plan.md**: Which agents merge/delete/keep
3. **migration-checklist.md**: Step-by-step implementation order

---

## Agent Usage

| Agent | Task |
|-------|------|
| doc-writer | Create architecture documentation |
| Explore (if needed) | Verify directory proposals |

---

## Key Design Decisions

### 1. Agent Consolidation (30 → ~20)

**Merge**:
- `agents-md-updater` + `readme-updater` → `doc-maintainer`

**Remove** (missing files):
- `code-observability-writer`
- `effect-schema-expert`

**Add to manifest** (11 orphaned):
- codebase-explorer, documentation-expert, domain-modeler
- effect-expert, effect-platform, lawyer, mcp-enablement
- observability-expert, react-expert, schema-expert
- wealth-management-domain-expert

**Keep separate** (validated in P1):
- All 5 Effect specialists
- codebase-researcher vs codebase-explorer

### 2. Skill Strategy

```
.claude/skills/     → Authoritative (52 skills + 9 symlinks)
.agents/skills/     → Master copies (9 agent skills)
.cursor/skills/     → Symlinks only
.windsurf/skills/   → Symlinks only
.codex/skills/      → DELETE
.opencode/skills/   → DELETE
```

### 3. IDE Sync

- `.claude/rules/*.md` = authoritative source
- `.cursor/rules/*.mdc` = auto-generated (fix sync script)
- `.windsurf/rules/` = symlink to `.claude/rules/`

### 4. CLAUDE.md

- Root `CLAUDE.md` → overview + links
- `.claude/rules/*.md` → all detailed content
- `.claude/CLAUDE.md` → DELETE after migrating unique content

---

## Reference Files

```
outputs/P1_REDUNDANCY_REPORT.md   - Findings summary
outputs/agent-overlap-matrix.md   - Similarity scores
outputs/conflict-matrix.md        - IDE issues
outputs/agent-catalog.md          - All 31 agents
outputs/skill-duplication-matrix.md - Skill distribution
```

---

## Deliverables

Create in `specs/agent-infrastructure-rationalization/outputs/`:

1. **P2_ARCHITECTURE.md** - Complete target state design
2. **agent-consolidation-plan.md** - Agent-by-agent decisions
3. **migration-checklist.md** - Implementation steps in order

---

## Success Criteria

- [ ] Target directory structure clearly defined
- [ ] All 31 agents have explicit decision (keep/merge/delete)
- [ ] Skill single-source strategy documented
- [ ] IDE sync automation designed
- [ ] Migration plan maintains backward compatibility

---

## Handoff Reference

Full context: `specs/agent-infrastructure-rationalization/handoffs/HANDOFF_P2.md`
