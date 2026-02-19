# Handoff — Phase 2: Module Context Generation

> Context document for Phase 2 implementation.

---

## Context Budget Status

| Memory Type | Est. Tokens | Budget | Status |
|-------------|-------------|--------|--------|
| Working | ~600 | ≤2,000 | ✅ OK |
| Episodic | ~500 | ≤1,000 | ✅ OK |
| Semantic | ~200 | ≤500 | ✅ OK |
| Procedural | Links | N/A | ✅ OK |
| **Total** | **~1,300** | **≤4,000** | **✅ OK** |

> Phase 1 complete. Ready for Phase 2 execution.

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

**Completed Successfully**:
- Effect repository added as git subtree at `.repos/effect/`
- Contains all Effect packages: `effect`, `platform`, `schema`, `ai`, `sql`, `rpc`, etc.
- Tooling exclusions configured (Knip, Biome)
- Workflow documentation created at `documentation/subtree-workflow.md`

**Key Artifacts**:
| Artifact | Path | Purpose |
|----------|------|---------|
| Effect subtree | `.repos/effect/` | Source reference for agents |
| Core Effect | `.repos/effect/packages/effect/src/` | Effect module implementations |
| Platform | `.repos/effect/packages/platform/src/` | FileSystem, HttpClient, etc. |
| Workflow doc | `documentation/subtree-workflow.md` | Update procedures |

**Tooling Changes**:
- `knip.config.ts`: Added `.repos/**` to ignore array
- `biome.jsonc`: Added `!.repos/**` to file excludes

**Issues Encountered**:
- Git subtree requires clean working tree (user committed changes manually)
- Remote added as `effect-upstream` for future updates

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
