# Handoff — Phase 2: Module Context Generation

> Context document for Phase 2 implementation.

---

## Context Budget Status

| Memory Type | Est. Tokens | Budget | Status |
|-------------|-------------|--------|--------|
| Working | TBD | ≤2,000 | ⏳ Pending |
| Episodic | TBD | ≤1,000 | ⏳ Pending |
| Semantic | ~200 | ≤500 | ✅ OK |
| Procedural | Links | N/A | ✅ OK |
| **Total** | **TBD** | **≤4,000** | **⏳ Pending** |

> ⚠️ This handoff will be fully populated when Phase 1 completes.

---

## Working Context (≤2K tokens)

### Phase 2 Mission

Generate best practices documentation for heavily-used Effect modules.

### Tasks

| ID | Task | Agent | Output |
|----|------|-------|--------|
| 2.1 | Analyze module usage in codebase | codebase-researcher | Usage frequency data |
| 2.2 | Generate Tier 1 context files | doc-writer | `context/effect/Effect.md`, etc. |
| 2.3 | Generate Tier 2 context files | doc-writer | `context/effect/Stream.md`, etc. |
| 2.4 | Generate Tier 3 context files | doc-writer | `context/effect/DateTime.md`, etc. |
| 2.5 | Generate Platform context files | doc-writer | `context/platform/*.md` |
| 2.6 | Create master index | doc-writer | `context/INDEX.md` |

### Success Criteria

- [ ] 20+ context files created
- [ ] Master index links all files
- [ ] Files follow template structure
- [ ] `bun run check` passes
- [ ] REFLECTION_LOG.md updated

### Blocking Issues

*To be identified during Phase 1 completion.*

---

## Episodic Context (≤1K tokens)

### Phase 1 Summary

*To be filled by Phase 1 orchestrator with:*
- Subtree setup results
- Tooling configuration changes
- Any issues encountered

---

## Semantic Context (≤500 tokens)

### Module Priority Tiers

**Tier 1 (Critical)**: `effect/Effect`, `effect/Schema`, `effect/Layer`, `effect/Context`
**Tier 2 (Important)**: `effect/Stream`, `effect/Array`, `effect/Option`, `effect/Either`, `effect/Match`
**Tier 3 (Common)**: `effect/DateTime`, `effect/String`, `effect/Struct`, `effect/Record`, `effect/Predicate`
**Platform**: `platform/FileSystem`, `platform/HttpClient`, `platform/Command`

### Context File Template Location

See `MASTER_ORCHESTRATION.md` section "Context File Template" for required structure.

---

## Procedural Context (Links only)

| Resource | Path | Purpose |
|----------|------|---------|
| Master Orchestration | `MASTER_ORCHESTRATION.md` | Full Phase 2 workflow |
| Effect Subtree | `.repos/effect/packages/effect/src/` | Source reference |
| Spec Guide | `specs/_guide/README.md` | Handoff standards |

---

## Exit to Phase 3

After completing Phase 2:
1. Update REFLECTION_LOG.md with learnings
2. Populate `handoffs/HANDOFF_P3.md` with P2 results
3. Verify `handoffs/P3_ORCHESTRATOR_PROMPT.md` is ready
