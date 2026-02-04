# Quick Start: Knowledge vs Effect-Ontology Audit

> 5-minute triage for starting or resuming this spec.

---

## What This Spec Does

Performs a **complete architectural audit** of `.repos/effect-ontology/packages/@core-v2/` to:
1. Catalog every capability (services, patterns, modules)
2. Map to beep-effect knowledge slice equivalents (or document gaps)
3. Produce actionable spec definitions for feature parity

**Domain**: AI-native wealth management for UHNWI clients ($30M+ net worth)

---

## Success Criteria

| Criteria | Verification |
|----------|--------------|
| Every `.ts` file cataloged | `wc -l outputs/EFFECT_ONTOLOGY_INVENTORY.md` > 300 lines |
| All capabilities assessed | No "unknown" entries in GAP_ANALYSIS.md |
| Actionable roadmap | SPEC_ROADMAP.md has dependency graph |
| Domain adaptation | DOMAIN_ADAPTATION_GUIDE.md covers compliance |

---

## Phase Overview

| Phase | Focus | Delegate To | Output |
|-------|-------|-------------|--------|
| 1 | Source Inventory | codebase-researcher | EFFECT_ONTOLOGY_INVENTORY.md |
| 2 | Capability Categorization | doc-writer | CAPABILITY_CATEGORIES.md |
| 3 | Gap Analysis | codebase-researcher | GAP_ANALYSIS.md |
| 4 | Technology Alignment | mcp-researcher | TECHNOLOGY_ALIGNMENT.md |
| 5 | Pattern Documentation | doc-writer | PATTERN_CATALOG.md |
| 6 | Spec Roadmap | doc-writer | SPEC_ROADMAP.md, SPEC_DEFINITIONS.md |

---

## Critical Anti-Patterns

1. **DO NOT skip files** - Every `.ts` file must be cataloged
2. **DO NOT assume equivalence** - Compare actual implementations
3. **DO NOT create specs during audit** - Produces documentation only
4. **DO NOT orchestrator-research** - Delegate to sub-agents (100+ files)

---

## Starting Phase 1

1. Read full context: `MASTER_ORCHESTRATION.md`
2. Review agent prompts: `AGENT_PROMPTS.md`
3. Spawn `codebase-researcher` with Phase 1 prompt
4. Verify output in `outputs/EFFECT_ONTOLOGY_INVENTORY.md`
5. Update `REFLECTION_LOG.md` with learnings
6. Create handoff: `handoffs/HANDOFF_P2.md`

---

## Resuming Mid-Phase

1. Read latest `handoffs/HANDOFF_P[N].md`
2. Check `outputs/` for completed deliverables
3. Review `REFLECTION_LOG.md` for learnings
4. Continue from checkpoint in handoff

---

## Context Budget

| Memory Type | Budget | Content |
|-------------|--------|---------|
| Working | ≤2,000 tokens | Current phase tasks |
| Episodic | ≤1,000 tokens | Previous phase summaries |
| Semantic | ≤500 tokens | Tech stack constants |
| Procedural | Links only | Documentation references |

**Total per handoff**: ≤4,000 tokens

---

## Key References

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Domain context, success criteria |
| [MASTER_ORCHESTRATION.md](MASTER_ORCHESTRATION.md) | Full workflow, delegation matrix |
| [AGENT_PROMPTS.md](AGENT_PROMPTS.md) | Copy-paste prompts for sub-agents |
| [RUBRICS.md](RUBRICS.md) | Gap assessment scoring |
| [templates/](templates/) | Deliverable templates |

---

## Complexity Classification

**Score**: 57 (High Complexity)

```
Phase Count:       6 phases    × 2 = 12
Agent Diversity:   4 agents    × 3 = 12
Cross-Package:     2 packages  × 4 =  8
External Deps:     0           × 3 =  0
Uncertainty:       3 (medium)  × 5 = 15
Research Required: 5 (heavy)   × 2 = 10
────────────────────────────────────────
Total:                            57 → High
```

**Implication**: Requires full orchestration structure (QUICK_START, MASTER_ORCHESTRATION, AGENT_PROMPTS, handoffs/).
