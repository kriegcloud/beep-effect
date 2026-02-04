# Handoff: Phase 1 - Redundancy & Conflict Analysis

> Context document for P1 execution. Read alongside `P1_ORCHESTRATOR_PROMPT.md`.

---

## Phase Objective

Identify all redundancies and conflicts across agent infrastructure to inform consolidation decisions.

---

## P0 Completion Summary

### Deliverables Created

| File | Content | Key Finding |
|------|---------|-------------|
| `outputs/P0_BASELINE.md` | Summary metrics | 31 agents, 53 skills, 82K tokens/session |
| `outputs/agent-catalog.md` | Full agent inventory | 18 synced, 11 orphaned, 2 missing |
| `outputs/skill-duplication-matrix.md` | Cross-directory mapping | 9 synced via symlinks, 2 diverged copies |
| `outputs/hook-analysis.md` | Token cost breakdown | 5,500 tokens per prompt overhead |

### Critical Numbers

```
Agents:        31 total (58% managed, 35% orphaned, 6% missing)
Skills:        53 unique (17% synced, 4% duplicated, 79% claude-only)
Hook overhead: ~82,000 tokens per typical session
Target:        ~40,000 tokens per session (51% reduction)
```

---

## P1 Tasks

### Task 1: Agent Overlap Analysis

**Agent**: reflector

**Input**: `outputs/agent-catalog.md`

**Analyze**:
1. Which agents have overlapping capabilities?
2. Which orphaned agents should be added to manifest vs deprecated?
3. What are the consolidation candidates?

**Known Overlaps** (from P0):

| Current | Overlap With | Similarity |
|---------|--------------|------------|
| codebase-researcher | codebase-explorer | 90% (name confusion) |
| effect-researcher | effect-expert | 80% (same domain) |
| effect-schema-expert | schema-expert | 85% (missing file vs orphaned) |
| doc-writer | agents-md-updater + readme-updater | 70% (same capability) |
| observability-expert | code-observability-writer | 75% (missing file vs orphaned) |

**Output**: `outputs/agent-overlap-matrix.md`

### Task 2: Configuration Conflict Check

**Agent**: code-reviewer

**Scope**: Compare configurations across:
- `.claude/rules/`
- `.cursor/rules/`
- `.windsurf/rules/`

**Check for**:
1. Content conflicts (same rule, different content)
2. Format conflicts (MDC vs MD)
3. Missing rules (present in one, absent in another)
4. Symlink vs copy inconsistencies

**Output**: `outputs/conflict-matrix.md`

### Task 3: CLAUDE.md Redundancy Analysis

**Agent**: Explore

**Compare**:
- `CLAUDE.md` (root) - 8KB
- `.claude/CLAUDE.md` - 3KB

**Identify**:
1. Overlapping content
2. Contradictory instructions
3. Consolidation opportunities
4. Token savings potential

**Output**: Section in `outputs/P1_REDUNDANCY_REPORT.md`

---

## Known Consolidation Opportunities

From P0 analysis and reflection synthesis:

### High Confidence (Proceed in P1)

| Current | Proposed | Rationale |
|---------|----------|-----------|
| `codebase-researcher` + `codebase-explorer` | Single `codebase-explorer` | Name confusion; identical capability |
| `effect-schema-expert` + `schema-expert` | Single `schema-expert` | Missing file + orphaned = consolidate |
| `observability-expert` + `code-observability-writer` | Single `observability-expert` | Missing file + orphaned = consolidate |

### Medium Confidence (Evaluate in P1)

| Current | Proposed | Needs Evaluation |
|---------|----------|------------------|
| `effect-researcher` + `effect-expert` + `effect-predicate-master` | Tiered Effect expertise | Are distinct triggers valuable? |
| `doc-writer` + `readme-updater` + `agents-md-updater` | Single `doc-writer` | Check if separate triggers needed |

### Low Confidence (Defer to P2)

| Current | Question |
|---------|----------|
| 11 orphaned agents | Which provide unique value? |
| Domain experts | wealth-management, lawyer - keep or remove? |

---

## Verification Commands

```bash
# Count agents after analysis
ls -1 .claude/agents/*.md | wc -l
# Should still be 29 (no changes in P1)

# Check rule sync status
diff <(ls .claude/rules/) <(ls .cursor/rules/)

# Verify CLAUDE.md files exist
wc -l CLAUDE.md .claude/CLAUDE.md
```

---

## Success Criteria (P1)

- [ ] Agent overlap matrix complete (all 31 agents analyzed)
- [ ] Configuration conflict matrix complete (.claude vs .cursor vs .windsurf)
- [ ] CLAUDE.md redundancy analysis complete (root vs .claude)
- [ ] Consolidation plan with high/medium/low confidence tiers
- [ ] Redundancy report in `outputs/P1_REDUNDANCY_REPORT.md`

---

## Anti-Patterns to Avoid

1. **Don't modify files in P1** - Analysis only, changes in P5
2. **Don't assume orphaned = useless** - Some may be actively used
3. **Don't merge without triggers analysis** - Different triggers may justify separate agents
4. **Don't ignore domain experts** - May serve specific business needs

---

## Next Phase Preview

P2 will design the consolidated architecture:
1. Target directory structure
2. Agent consolidation plan (30 → 15-18)
3. Skill single-source strategy
4. IDE sync automation
5. Migration plan with backward compatibility

P2 uses: doc-writer (architecture documentation)
