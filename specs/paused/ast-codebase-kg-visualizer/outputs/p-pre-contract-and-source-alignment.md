# PRE: Contract and Source Alignment

## Goal

Freeze source contracts and immutable KG v1 -> visualizer mapping rules before architecture freeze.

## Required Inputs

1. `tooling/cli/src/commands/kg.ts`
2. `specs/pending/ast-codebase-kg-visualizer/outputs/kg-bundle/sample-graph-v2.json`
3. `specs/pending/ast-codebase-kg-visualizer/outputs/kg-bundle/visualize-v2.html`
4. existing `apps/web` graph API and graph component files

## Output Path

`specs/pending/ast-codebase-kg-visualizer/outputs/p-pre-contract-and-source-alignment.md`

## Immutable Mapping Tables (Normative)

### KG v1 Node Kind -> Visualizer Node Kind

| KG v1 Kind | Visualizer Kind | Rule |
|---|---|---|
| `module` | `file` | Module nodes render as file-level visualizer nodes. |
| `function` | `function` | Direct mapping. |
| `class` | `class` | Direct mapping. |
| `interface` | `interface` | Direct mapping. |
| `typeAlias` | `type_alias` | Naming normalization to bundle schema. |
| `variable` | `variable` | Direct mapping. |
| `enum` | `enum` | Direct mapping. |
| `literal` | `variable` | Literal semantic nodes collapse to variable nodes; set `meta.literal=true`. |

Reserved forward-compat mappings if surfaced by future extractor revisions:

| Future Source Kind | Visualizer Kind |
|---|---|
| `method` | `method` |
| `property` | `property` |
| `constructor` | `constructor` |
| `parameter` | `parameter` |
| `decorator` | `decorator` |
| `namespace` | `namespace` |

### KG Edge Type -> Visualizer Edge Kind

| KG Edge Type | Visualizer Edge Kind | Rule |
|---|---|---|
| `CONTAINS` | `contains` | Direct mapping. |
| `EXPORTS` | `exports` | Direct mapping. |
| `IMPORTS` | `imports` | Direct mapping. |
| `CALLS` | `calls` | Direct mapping. |
| `RETURNS_TYPE` | `return_type` | Direct mapping. |
| `ACCEPTS_TYPE` | `type_reference` | Parameter/type input semantics. |
| `EXTENDS` | `extends` | Direct mapping. |
| `IMPLEMENTS` | `implements` | Direct mapping. |
| `REFERENCES` | `uses_type` | Generic fallback for typed symbol references. |
| `DECLARES` | `contains` | Structural ownership semantic. |
| `IN_CATEGORY` | `uses_type` | Semantic relationship retained via metadata. |
| `IN_MODULE` | `uses_type` | Semantic relationship retained via metadata. |
| `IN_DOMAIN` | `uses_type` | Semantic relationship retained via metadata. |
| `PROVIDES` | `exports` | Semantic provision as export-like relation. |
| `DEPENDS_ON` | `imports` | Semantic dependency as import-like relation. |
| `THROWS_DOMAIN_ERROR` | `throws` | Direct semantic/error mapping. |

### Fallback Edge Mapping Policy

| Condition | Behavior |
|---|---|
| Edge type not in immutable table | map to `uses_type` |
| Fallback-mapped edge | set `meta.originalType=<rawType>` and `meta.fallbackMapped=true` |
| Semantic edge mapped to structural kind | preserve raw semantics in `meta.semanticType` |

### Deterministic ID and Provenance Carry-Through

| Surface | Rule |
|---|---|
| `GraphNode.id` | equals KG `nodeId` exactly |
| `GraphEdge.source` | equals KG `from` exactly |
| `GraphEdge.target` | equals KG `to` exactly |
| `GraphEdge.kind` | lower-case mapped value from immutable table |
| `GraphEdge.meta.provenance` | copy KG `provenance` exactly |
| Sorting | nodes sorted by `id`; edges sorted by `source,target,kind,meta.originalType?` |

### Required Meta Fields

| Field | Required | Description |
|---|---|---|
| `sourceSchemaVersion` | yes | KG source schema version (for now `kg-schema-v1`) |
| `workspace` | yes | workspace slug (`beep-effect3`) |
| `commitSha` | yes | commit associated with source snapshot/export |
| `exportMode` | yes | `full` or `delta` |
| `nodeCountRaw` | yes | pre-filter node count |
| `edgeCountRaw` | yes | pre-filter edge count |
| `provenanceCounts` | yes | counts by `ast|type|jsdoc` |
| `meta.originalType` | conditional | required on fallback edge mappings |

## Command and Evidence Matrix

| Command ID | Command | Evidence Artifact |
|---|---|---|
| PRE-C01 | `bun run beep docs laws` | `outputs/evidence/pre/discovery-laws.log` |
| PRE-C02 | `bun run beep docs skills` | `outputs/evidence/pre/discovery-skills.log` |
| PRE-C03 | `bun run beep docs policies` | `outputs/evidence/pre/discovery-policies.log` |
| PRE-C04 | `bun run agents:pathless:check` | `outputs/evidence/pre/agents-pathless-check.log` |
| PRE-C05 | sample schema contract extraction | `outputs/evidence/pre/sample-graph-contract.log` |

## Completion Checklist

- [ ] Immutable mapping tables are complete.
- [ ] Fallback mapping policy is complete.
- [ ] Deterministic ID/provenance carry-through is complete.
- [ ] Required meta fields are complete.
- [ ] Evidence paths for PRE commands are complete.

## Explicit Handoff

Next phase: [HANDOFF_P0.md](../handoffs/HANDOFF_P0.md)
