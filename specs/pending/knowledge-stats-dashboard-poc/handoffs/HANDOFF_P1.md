# Handoff P1: Discovery

## Context For Phase 1

### Working Context (<=2K tokens)

Current task: build a codebase map and implementation plan evidence for the Knowledge Stats Dashboard POC.

Success criteria:
- [ ] Produce `specs/pending/knowledge-stats-dashboard-poc/outputs/codebase-context.md` with:
  - candidate route location ( vs `apps/todox`) with evidence
  - existing knowledge RPC patterns + where to add v1 stats endpoint
  - existing UI patterns for dashboards + React Flow usage (if any)
  - list of likely files to touch in P2-P5
- [ ] Update `specs/pending/knowledge-stats-dashboard-poc/REFLECTION_LOG.md` (Phase 1 section)
- [ ] Update (not just create) the next phase handoff pair:
  - `specs/pending/knowledge-stats-dashboard-poc/handoffs/HANDOFF_P2.md`
  - `specs/pending/knowledge-stats-dashboard-poc/handoffs/P2_ORCHESTRATOR_PROMPT.md`

Blocking issues:
- Notion databases referenced as `collection://...` may not be queryable in all sessions. Prefer:
  - Notion page ID `30069573788d81c1a881d598349ddcf5`
  - local capture outputs in `specs/pending/open-ontology-reference-capture/outputs/`

Immediate dependencies (read):
- `specs/pending/open-ontology-reference-capture/outputs/SCOUT_Stats.md`
- `specs/pending/open-ontology-reference-capture/outputs/CAPTURE_Stats.md`
- `packages/knowledge/server/src/rpc/v1/`
- `packages/knowledge/server/src/Service/`
- `packages/knowledge/client/src/`
- `packages/knowledge/ui/src/`
-  and `apps/todox`

### Episodic Context (<=1K tokens)

- Phase 0 created the spec scaffold and recorded the Notion `collection://...` hazard.

### Semantic Context (<=500 tokens)

- Reference UI is Open Ontology Stats Dashboard. Screenshot CDN base:
  - https://static.vaultctx.com/notion/open-ontology/stats/
- Notion Stats Dashboard page ID:
  - 30069573788d81c1a881d598349ddcf5

### Procedural Context (links only)

- Spec guide: `specs/_guide/README.md`
- Handoff standards: `specs/_guide/HANDOFF_STANDARDS.md`
- Effect patterns: `.claude/rules/effect-patterns.md`

## Verification Checklist

- [ ] `outputs/codebase-context.md` exists and is actionable
- [ ] Route location decision is justified with codebase evidence
- [ ] File touch list is explicit (paths)
- [ ] Reflection updated
- [ ] P2 handoff + prompt updated
