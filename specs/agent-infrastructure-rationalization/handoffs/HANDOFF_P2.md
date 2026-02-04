# P2 Handoff: Consolidation Architecture Design

> Session handoff document for P2 execution
> Created: 2026-02-03

---

## Context Summary

### What Was Accomplished (P0-P1)

**P0 (Inventory)**:
- 31 agents cataloged: 18 synced, 11 orphaned, 2 missing files
- 53 unique skills across 6 directories
- 82K tokens per session (51% above target)

**P1 (Redundancy Analysis)**:
- 1 high-priority merge: `agents-md-updater` + `readme-updater` (82% similarity)
- 7 medium-priority evaluations (50-80% similarity)
- **CRITICAL**: Cursor rules have 38-53% content loss (sync broken)
- **MISSING**: `.windsurf/rules/` symlink doesn't exist
- ~30% CLAUDE.md redundancy across 3 files

### Critical Findings for P2 Design

| Issue | Impact | Design Consideration |
|-------|--------|----------------------|
| Cursor content drift | Incomplete guidance | Single source + auto-sync |
| 11 orphaned agents | No manifest entry | Add to manifest or deprecate |
| 2 missing agents | Manifest-only entries | Create files or remove |
| 3× behavioral rules | Token waste | Single authoritative location |
| Effect specialists (5) | Low overlap | Keep separate |

---

## P2 Objective

Design the target architecture with:
1. Clear directory structure
2. Agent consolidation plan (30 → 15-18)
3. Single source of truth for skills
4. IDE auto-sync strategy
5. Migration plan with backward compatibility

---

## Entry Criteria (All Met)

- [x] P0 baseline metrics in `outputs/P0_BASELINE.md`
- [x] P1 redundancy report in `outputs/P1_REDUNDANCY_REPORT.md`
- [x] Agent overlap matrix in `outputs/agent-overlap-matrix.md`
- [x] Conflict matrix in `outputs/conflict-matrix.md`

---

## Exit Criteria

- [ ] Target directory structure defined
- [ ] Agent consolidation plan approved
- [ ] Skill single-source strategy defined
- [ ] IDE sync automation designed
- [ ] Migration plan with backward compatibility

---

## Recommended Agent Usage

| Agent | Task | Output |
|-------|------|--------|
| doc-writer | Create architecture document | `outputs/P2_ARCHITECTURE.md` |
| Explore | Verify directory structure proposals | Validation |

---

## Key Design Decisions Needed

### 1. Agent Consolidation (30 → 15-18)

**High-confidence merges (P1 validated)**:
- `agents-md-updater` + `readme-updater` → `doc-maintainer`
- Remove `code-observability-writer` (missing file)
- Remove `effect-schema-expert` (missing file)

**Evaluate**:
- Keep all 5 Effect specialists separate (distinct roles)
- Keep `codebase-researcher` vs `codebase-explorer` separate (different methodologies)

**Orphaned agents to add to manifest** (11 total):
- codebase-explorer, documentation-expert, domain-modeler
- effect-expert, effect-platform, lawyer, mcp-enablement
- observability-expert, react-expert, schema-expert
- wealth-management-domain-expert

### 2. Skill Source Strategy

**Proposed hierarchy**:
```
.claude/skills/          # Authoritative source (52 skills)
  ├── [direct skills]    # Claude-specific
  └── [symlinks] → .agents/skills/  # Agent skills

.agents/skills/          # 9 core agent skills (master copies)

.cursor/skills/          # Symlinks only → .claude/ or .agents/
.windsurf/skills/        # Symlinks only → .claude/ or .agents/
.codex/skills/           # DELETE (unused, has broken link)
.opencode/skills/        # DELETE (unused)
```

### 3. IDE Sync Strategy

**Rules**:
- `.claude/rules/*.md` = authoritative
- `.cursor/rules/*.mdc` = auto-generated via sync script
- `.windsurf/rules/` = symlink to `.claude/rules/`

**Enhancement**: Add CI check to detect drift

### 4. CLAUDE.md Consolidation

**Current** (3 files, 30% overlap):
- Root `CLAUDE.md` (overview)
- `.claude/CLAUDE.md` (meta-content)
- `.claude/rules/*.md` (detailed rules)

**Proposed** (single hierarchy):
- Root `CLAUDE.md` (overview + links)
- `.claude/rules/*.md` (all detailed content)
- DELETE `.claude/CLAUDE.md` after migrating unique content

---

## Deliverables Expected

1. `outputs/P2_ARCHITECTURE.md` - Target state design
2. `outputs/agent-consolidation-plan.md` - Which agents merge/delete
3. `outputs/migration-checklist.md` - Step-by-step migration

---

## File References

| File | Purpose |
|------|---------|
| `outputs/P1_REDUNDANCY_REPORT.md` | Redundancy findings |
| `outputs/agent-overlap-matrix.md` | Similarity scores |
| `outputs/conflict-matrix.md` | IDE config issues |
| `outputs/agent-catalog.md` | All 31 agents |
| `outputs/skill-duplication-matrix.md` | Skill distribution |

---

## Constraints

- **Backward compatibility required**: All existing workflows must work
- **IDE compatibility**: Cursor, Windsurf must function after changes
- **Reversibility**: All changes via git (can rollback)
- **Token budget**: Handoffs ≤4K tokens

---

## Risk Notes

| Risk | Mitigation |
|------|------------|
| Breaking workflows | Test each merge individually |
| IDE sync failures | Verify on each IDE after changes |
| Too aggressive consolidation | Keep deprecated agents 2-3 spec cycles |

---

## Quick Start for Next Session

```bash
# Read P1 outputs
cat specs/agent-infrastructure-rationalization/outputs/P1_REDUNDANCY_REPORT.md
cat specs/agent-infrastructure-rationalization/outputs/agent-overlap-matrix.md

# Start P2
# Use doc-writer agent to create architecture document
```
