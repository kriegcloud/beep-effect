# Master Orchestration: Knowledge Server Test Shared Fixtures Dedup

## Mission

Consolidate duplicated test-layer and mock fixture patterns in `packages/knowledge/server/test` into dedicated shared modules under `packages/knowledge/server/test/_shared`, while keeping test behavior stable.

## Agent Architecture

- Discovery: `codebase-researcher`
- Evaluation: `code-reviewer`, `architecture-pattern-enforcer`
- Implementation: `effect-code-writer`, `test-writer`
- Synthesis/closeout: `doc-writer`, `reflector`

## Phase Plan

### Phase 1: Inventory Duplication

Tasks:
- Enumerate duplication families (layer assembly, fixture factories, service mocks)
- Classify each family by risk and expected extraction target
- Identify current `_shared` modules and gaps

Outputs:
- `outputs/codebase-context.md`

Quality gate:
- Each candidate includes source file refs and a proposed `_shared` destination

### Phase 2: Design and Migration Plan

Tasks:
- Define target shared module boundaries
- Define helper API contracts and naming
- Sequence migration by low-risk to high-risk tests

Outputs:
- `outputs/evaluation.md`
- `outputs/remediation-plan.md`

Quality gate:
- No module exceeds single responsibility (avoid large grab-bag helper files)

### Phase 3: Extract and Migrate

Tasks:
- Implement `_shared` modules
- Migrate tests in batches
- Remove dead local helper code

Outputs:
- Code changes in `packages/knowledge/server/test/**`
- Updated handoff files for next session if needed

Quality gate:
- Changed tests compile and pass
- No assertion semantics drift

### Phase 4: Stabilize and Guard

Tasks:
- Validate no major duplicate families remain
- Add brief usage notes in spec outputs
- Capture lessons and anti-regression rules

Outputs:
- `outputs/verification-report.md`
- `REFLECTION_LOG.md` phase entry

Quality gate:
- Verification report maps every extracted helper to migrated call sites

## Canonical Shared Module Targets (Initial)

- `packages/knowledge/server/test/_shared/TestLayers.ts` (existing, extend)
- `packages/knowledge/server/test/_shared/GraphFixtures.ts` (new)
- `packages/knowledge/server/test/_shared/ServiceMocks.ts` (new)
- `packages/knowledge/server/test/_shared/LayerBuilders.ts` (new, if warranted by Phase 2)

## Constraints

- Test-only code stays under `packages/knowledge/server/test/**`
- Respect Effect patterns and type safety constraints
- Prefer focused modules over broad utilities

## Verification Commands

```bash
bun run check
bun run test packages/knowledge/server/test
bun run lint
```

Use `bun run test` fallback if package-scoped run is unsupported; log this in `outputs/verification-report.md`.
