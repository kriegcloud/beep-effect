# P0 Conventions Checklist

## Required Discovery Checks (P0)

- [x] `bun run beep docs laws`
- [x] `bun run beep docs skills`
- [x] `bun run beep docs policies`

## Effect and Type-Safety Laws

| Convention | Status | Evidence |
|---|---|---|
| Use Effect-first aliases (`A/O/P/R/S`) | Partial (present in implemented modules, absent in stubs) | `packages/common/ontology/src/ontology/ObjectTypeDefinition.ts`, `packages/common/ontology/src/object/Result.ts`, `packages/common/ontology/src/ontology/VersionString.ts` |
| No `any` / no `@ts-ignore` / no unsafe escapes | Pass in current local ontology sources (comments mention "any", code does not) | `rg -n "\\bany\\b|@ts-ignore|@ts-expect-error" packages/common/ontology/src` |
| Prefer Predicate/schema-based checks | Partial | `packages/common/ontology/src/object/Result.ts` uses `effect/Predicate`; many modules still stubbed |
| Tagged unions via `S.toTaggedUnion(...)` | Pass where union schemas exist | `packages/common/ontology/src/object/Result.ts`, `.../object/PropertySecurity.ts`, `.../ontology/valueFormatting/*` |

## Parity-Specific Surface Conventions

| Convention | Status | Evidence |
|---|---|---|
| Stable parity must track upstream `index.ts` exports | Baseline captured; not implemented | `outputs/p0-baseline/parity-matrix.md` shows `14 implemented / 16 stubbed / 22 missing` |
| Unstable parity isolated behind `public/unstable.ts` | Gap | Upstream has `/public/unstable.ts`; local has no `packages/common/ontology/src/public/unstable.ts` |
| Alias compatibility (`Ontology*` -> `Osdk*`, link definition bridge) | Partial / currently stubbed | `packages/common/ontology/src/OntologyBase.ts`, `OntologyObject.ts`, `OntologyObjectFrom.ts`, `definitions/LinkDefinition.ts` are stubbed |
| Naming/casing convergence to upstream | Gap | Upstream `groupby/*`; local folder is `groupBy/` and empty |

## Documentation and Process Conventions

| Convention | Status | Evidence |
|---|---|---|
| No implementation edits in P0 | Pass | This phase produced docs only in `outputs/p0-baseline/*` plus handoff updates |
| Memory routing via Graphiti proxy (`127.0.0.1:8123`) | Pass | `curl -fsS http://127.0.0.1:8123/healthz` and `/metrics` executed successfully during this run |
| P0 exit requires P1 handoff and prompt | Pass | `handoffs/HANDOFF_P1.md` and `handoffs/P1_ORCHESTRATOR_PROMPT.md` exist |

## P1 Intake Checklist

1. Freeze explicit rule for counting `stubbed` modules (currently `<=15` non-empty lines in parity matrix method).
2. Freeze alias-to-upstream mapping policy (`Ontology*` compatibility vs strict path parity).
3. Freeze export parity acceptance criteria (source-file parity vs package export parity).
4. Freeze unstable inclusion gate and test strategy before P2 implementation starts.
