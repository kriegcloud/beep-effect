# P1 Public API Compatibility Contract

## Decision status

- Frozen on 2026-02-26.
- Scope: stable parity surface, alias compatibility, and unstable gating policy.

## Source anchors

1. Upstream stable exports: `/home/elpresidank/YeeBois/dev/references/osdk-ts/packages/api/src/index.ts`
2. Upstream unstable exports: `/home/elpresidank/YeeBois/dev/references/osdk-ts/packages/api/src/public/unstable.ts`
3. Local package exports: `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/ontology/package.json`
4. Local source index: `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/ontology/src/index.ts`
5. P0 baseline matrix: `outputs/p0-baseline/parity-matrix.md`

## Stable surface contract

1. Canonical stable parity target is full upstream `index.ts` coverage (52 stable module exports from the locked P0 baseline snapshot).
2. Canonical module names must follow upstream naming and folder conventions in exported surface.
3. Runtime/type export mode must match upstream intent (`type` exports remain type exports, value exports remain value exports).
4. Final stable export parity gate is enforced in P6 before P7 verification.

## Alias compatibility contract

1. Hybrid parity is mandatory: canonical `Osdk*` surfaces plus existing `Ontology*` compatibility aliases.
2. Required alias bridges:
   - `OntologyBase` -> `OsdkBase`
   - `OntologyObject` -> `OsdkObject`
   - `OntologyObjectFrom` -> `OsdkObjectFrom`
   - `OntologyObjectPrimaryKey` -> `OsdkObjectPrimaryKeyType`
   - `definitions/LinkDefinition` -> `definitions/LinkDefinitions`
3. Alias bridges must be pure re-export shims with no behavioral divergence.
4. Alias bridges must remain import-compatible for existing local consumers during migration.

## Entry-point and package export contract

1. `src/index.ts` becomes the stable canonical entrypoint.
2. `src/public/unstable.ts` becomes the isolated unstable entrypoint in P6.
3. `package.json` exports must include:
   - `.` -> stable surface
   - `./unstable` -> unstable surface
   - `./*` -> module passthrough
   - `./internal/*` -> null
4. `publishConfig.exports` must mirror source exports mapping semantics for dist output.

## Unstable gating contract

1. Unstable modules remain deferred until P6.
2. Root stable index must not export unstable symbols.
3. Unstable entrypoint must mirror upstream unstable export intent and naming.
4. P6 must produce explicit unstable parity evidence before P7.

## Parity accounting contract

1. P0 classification (`implemented`, `stubbed`, `missing`) remains planning telemetry only.
2. Release readiness is decided by export parity verification and compile/test results, not file-line heuristics.
3. Export parity reports must explicitly call out intentional differences and compatibility shims.

## Acceptance criteria

- Stable export surface is fully defined and implementation-ready.
- Alias compatibility policy is explicit and testable.
- Unstable isolation and package entrypoint rules are locked for P6 execution.
