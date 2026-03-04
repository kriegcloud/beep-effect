# P0: Architecture and Gates

## Goal

Freeze implementation boundaries, interfaces, and acceptance gates so downstream phases make no architecture decisions.

## Required Inputs

1. `specs/pending/ast-codebase-kg-visualizer/outputs/p-pre-contract-and-source-alignment.md`
2. `tooling/cli/src/commands/kg.ts`
3. `apps/web/src/app/api/graph/search/route.ts`
4. `apps/web/src/components/graph/ForceGraph.tsx`
5. `specs/pending/ast-codebase-kg-visualizer/RUBRICS.md`

## Output Path

`specs/pending/ast-codebase-kg-visualizer/outputs/p0-architecture-and-gates.md`

## Frozen File Ownership Map

| Surface | Planned Files | Owner |
|---|---|---|
| CLI export | `tooling/cli/src/commands/kg.ts` plus extracted helper modules under `tooling/cli/src/commands/kg/*` if needed | P1 KG Export Engineer |
| CLI tests | `tooling/cli/test/kg-export.test.ts` and updates in `tooling/cli/test/kg.test.ts` | P1 KG Export Engineer |
| API route | `apps/web/src/app/api/kg/graph/route.ts` | P2 API Engineer |
| Visualizer types/loader | `apps/web/src/lib/kg/types.ts`, `apps/web/src/lib/kg/loader.ts` | P2 API Engineer |
| `/kg` route | `apps/web/src/app/(app)/kg/page.tsx` | P3 UI Engineer |
| D3 visualizer components | `apps/web/src/components/kg/*` | P3 UI Engineer |
| UI tests | `e2e/kg-visualizer.spec.ts` and relevant web tests | P4 Perf/E2E Engineer |

## Public Interface Freeze

1. CLI command:
   - `bun run beep kg export --mode <full|delta> [--changed <csv>] --format visualizer-v2 [--out <path>]`
   - default output path: `tooling/ast-kg/.cache/codebase-graph-v2.json`
2. API:
   - `GET /api/kg/graph`
3. Web route:
   - `apps/web/src/app/(app)/kg/page.tsx`
4. Types:
   - `VisualizerGraph` and mapping contract from KG v1

## Immutable Mapping Tables (Normative)

### KG v1 Node Kind -> Visualizer Node Kind

| KG v1 Kind | Visualizer Kind | Notes |
|---|---|---|
| `module` | `file` | canonical |
| `function` | `function` | canonical |
| `class` | `class` | canonical |
| `interface` | `interface` | canonical |
| `typeAlias` | `type_alias` | canonical |
| `variable` | `variable` | canonical |
| `enum` | `enum` | canonical |
| `literal` | `variable` | with `meta.literal=true` |

### KG Edge Type -> Visualizer Edge Kind

| KG Edge Type | Visualizer Edge Kind | Notes |
|---|---|---|
| `CONTAINS` | `contains` | canonical |
| `EXPORTS` | `exports` | canonical |
| `IMPORTS` | `imports` | canonical |
| `CALLS` | `calls` | canonical |
| `RETURNS_TYPE` | `return_type` | canonical |
| `ACCEPTS_TYPE` | `type_reference` | canonical |
| `EXTENDS` | `extends` | canonical |
| `IMPLEMENTS` | `implements` | canonical |
| `REFERENCES` | `uses_type` | canonical |
| `DECLARES` | `contains` | canonical structural mapping |
| `IN_CATEGORY` | `uses_type` | semantic preserved in metadata |
| `IN_MODULE` | `uses_type` | semantic preserved in metadata |
| `IN_DOMAIN` | `uses_type` | semantic preserved in metadata |
| `PROVIDES` | `exports` | semantic preserved in metadata |
| `DEPENDS_ON` | `imports` | semantic preserved in metadata |
| `THROWS_DOMAIN_ERROR` | `throws` | canonical |

### Fallback Policy

- Unknown edge types map to `uses_type`.
- Fallback edges must include:
  - `meta.originalType`
  - `meta.fallbackMapped=true`

### Deterministic Carry-Through

- Node IDs and edge endpoints are copied from KG v1 without rewriting.
- Export artifact node and edge order is deterministic and stable across identical inputs.
- Provenance is preserved on each edge in metadata.

### Required Meta Fields

`sourceSchemaVersion`, `workspace`, `commitSha`, `exportMode`, `nodeCountRaw`, `edgeCountRaw`, `provenanceCounts`.

## Acceptance Gate Matrix

| Phase | Gate |
|---|---|
| P1 | CLI command and deterministic export algorithm are explicit and testable |
| P2 | API response and typed error contracts are explicit |
| P3 | `/kg` D3 component and interaction contract is explicit |
| P4 | unit + API + E2E + scale evidence matrix is explicit |
| P5 | gate-by-gate verdict + rollout/rollback policy is explicit |

## Known Risks Frozen for Tracking

1. KG index path currently does not persist full visualizer-ready artifact.
2. Schema mismatch risk between KG v1 and visualizer v2 node/edge contracts.
3. UI performance degradation risk at 5k+ nodes.

## Command and Evidence Matrix

| Command ID | Command | Evidence Artifact |
|---|---|---|
| P0-C01 | `bun run beep docs laws` | `outputs/evidence/p0/discovery-laws.log` |
| P0-C02 | `bun run beep docs skills` | `outputs/evidence/p0/discovery-skills.log` |
| P0-C03 | `bun run beep docs policies` | `outputs/evidence/p0/discovery-policies.log` |
| P0-C04 | `bun run agents:pathless:check` | `outputs/evidence/p0/agents-pathless-check.log` |
| P0-C05 | KG command surface audit | `outputs/evidence/p0/kg-surface-audit.log` |

## Completion Checklist

- [ ] File ownership and boundaries are frozen.
- [ ] Public interfaces are frozen.
- [ ] Immutable mapping tables are restated and frozen.
- [ ] Acceptance gates for P1..P5 are frozen.
- [ ] Evidence contract is complete.

## Explicit Handoff

Next phase: [HANDOFF_P1.md](../handoffs/HANDOFF_P1.md)
