# Knowledge vs Effect-Ontology Full Audit

> Comprehensive architectural audit comparing beep-effect knowledge slice against the effect-ontology reference implementation to achieve complete feature parity.

---

## Status

**PLANNED** - Foundation spec for knowledge slice evolution

**Complexity**: High (Score: 57)

---

## Quick Links

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](QUICK_START.md) | 5-minute triage, phase overview |
| [MASTER_ORCHESTRATION.md](MASTER_ORCHESTRATION.md) | Full workflow, delegation matrix |
| [AGENT_PROMPTS.md](AGENT_PROMPTS.md) | Copy-paste prompts for sub-agents |
| [RUBRICS.md](RUBRICS.md) | Gap assessment scoring criteria |
| [REFLECTION_LOG.md](REFLECTION_LOG.md) | Session learnings |

---

## Domain Context

**Target**: todox - AI-native wealth management for UHNWI clients ($30M+ net worth)

**Requirements**: Unify data sources (CRM, custodian, email), model household relationships, maintain FINRA/SEC compliance, power GraphRAG for AI advisors.

**Strategy**: Adopt effect-ontology architecture, adapt schemas for financial domain.

---

## Purpose

This specification performs a **complete audit** to:

1. **Catalog every capability** in effect-ontology (services, patterns, modules)
2. **Map to beep-effect knowledge slice** equivalents (or document gaps)
3. **Identify required Effect ecosystem packages** and usage patterns
4. **Produce actionable spec definitions** for systematic feature parity

**Why This Spec**: Previous `knowledge-ontology-comparison` missed critical infrastructure (events, cluster patterns, resilience, runtime). This audit ensures nothing is missed by cataloging every file.

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

See [MASTER_ORCHESTRATION.md](MASTER_ORCHESTRATION.md) for detailed execution instructions.

---

## Deliverables

| ID | Deliverable | Purpose |
|----|-------------|---------|
| D1 | EFFECT_ONTOLOGY_INVENTORY.md | File-by-file inventory with imports/exports |
| D2 | CAPABILITY_CATEGORIES.md | Functional groupings (11 categories) |
| D3 | GAP_ANALYSIS.md | Comparison matrix with gap assessment |
| D4 | TECHNOLOGY_ALIGNMENT.md | Package-by-package comparison |
| D5 | PATTERN_CATALOG.md | Reusable Effect patterns |
| D6 | SPEC_ROADMAP.md | Ordered spec list with dependencies |
| D7 | SPEC_DEFINITIONS.md | Detailed scope per spec |
| D8 | SPEC_GENERATOR_PROMPT.md | Prompt for spec creation agent |
| D9 | DOMAIN_ADAPTATION_GUIDE.md | Wealth management adaptation guidance |

Templates available in [templates/](templates/).

---

## Success Criteria

### Inventory Completeness
- [ ] Every `.ts` file in effect-ontology cataloged
- [ ] All imports and exports documented
- [ ] All dependencies mapped

### Gap Coverage
- [ ] Every capability assessed
- [ ] No capabilities marked "unknown"
- [ ] All priorities assigned (P0-P3)

### Domain Adaptation
- [ ] DOMAIN_ADAPTATION_GUIDE documents entity type mappings
- [ ] Compliance requirements (FINRA/SEC) addressed
- [ ] Multi-source integration patterns documented

### Actionable Output
- [ ] SPEC_ROADMAP contains clear ordering
- [ ] SPEC_DEFINITIONS detailed enough to start work
- [ ] Domain requirements integrated into each spec

---

## Audit Scope

| Source | Path |
|--------|------|
| effect-ontology | `.repos/effect-ontology/packages/@core-v2/src/` (Cluster/, Contract/, Domain/, Runtime/, Service/, Workflow/) |
| beep-effect | `packages/knowledge/{domain,tables,server,client}/src/` |

---

## Anti-Patterns

1. **DO NOT skip files** - Every `.ts` file must be cataloged
2. **DO NOT assume equivalence** - Compare actual implementations
3. **DO NOT create specs during audit** - Produces documentation only

---

## Handoff Protocol

At end of EACH phase:
- [ ] Update REFLECTION_LOG.md with learnings
- [ ] Create handoffs/HANDOFF_P[N+1].md (full context)
- [ ] Create handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md (copy-paste prompt)

See [handoffs/HANDOFF_TEMPLATE.md](handoffs/HANDOFF_TEMPLATE.md) for structure.

---

## Reference Documentation

- **effect-ontology CLAUDE.md**: `.repos/effect-ontology/CLAUDE.md`
- **Previous comparison**: `specs/knowledge-ontology-comparison/`
- **Existing knowledge specs**: `specs/knowledge-*/`
- **Spec guide**: `specs/_guide/README.md`
