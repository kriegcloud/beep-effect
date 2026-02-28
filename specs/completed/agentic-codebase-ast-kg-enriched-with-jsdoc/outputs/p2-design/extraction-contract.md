# Extraction Contract (AST + Type + JSDoc)

## Purpose
Define the deterministic extraction pipeline and outputs for full and delta indexing modes, including semantic enrichment and optional SCIP overlay behavior.

## Lock Alignment (Normative)

| Decision Surface | Frozen Value |
|---|---|
| Read path policy | `hybrid` (`local deterministic cache` + `Graphiti semantic layer`) |
| Ingestion granularity | `per-file delta` |
| Index scope | Include `apps/`, `packages/`, `tooling/`, `.claude/hooks`, `.claude/scripts`; exclude `specs/`, `.repos/` |
| CLI command set | `bun run beep kg index --mode full` and `bun run beep kg index --mode delta --changed <paths>` |
| KG edge provenance | `provenance = ast | type | jsdoc` |
| Semantic tags to edges | `@category -> IN_CATEGORY`, `@module -> IN_MODULE`, `@domain -> IN_DOMAIN`, `@provides -> PROVIDES`, `@depends -> DEPENDS_ON`, `@errors -> THROWS_DOMAIN_ERROR` |

## Reuse and Build Boundary
- Reuse:
`eslint.config.mjs`, `tsdoc.json`, workspace `docgen.json`, `.claude/hooks/schemas/index.ts`
- Build:
TypeScript extractor module, JSDoc semantic edge mapper, deterministic artifact writer

This contract stays additive to existing lint/docgen/tag governance and does not redefine existing tag policy.

## Input Selection Contract

### Allowed Roots
`apps/`, `packages/`, `tooling/`, `.claude/hooks`, `.claude/scripts`

### Blocked Roots
`specs/`, `.repos/`, `node_modules/`, `dist/`, `coverage/`

### Allowed Extensions
`.ts`, `.tsx`, `.mts`, `.cts`

### Blocked Extensions
`.d.ts`, non-TypeScript files

## CLI Behavior Contract

### Full Mode
Command:
`bun run beep kg index --mode full`

Behavior:
1. Enumerate all in-scope files.
2. Build fresh deterministic snapshot.
3. Emit one per-file artifact record for every in-scope file.
4. Persist local cache and Graphiti episodes.

### Delta Mode
Command:
`bun run beep kg index --mode delta --changed <paths>`

Behavior:
1. Start from changed-file set from CLI `--changed`.
2. Normalize each path to repo-relative POSIX style.
3. Apply widening policy from incremental design.
4. Recompute only selected file records.
5. Upsert only recomputed file episodes.

## Extraction Pipeline
1. Create ts-morph project and TypeScript TypeChecker for current workspace.
2. Parse each selected file.
3. Collect declarations for schema-supported symbol kinds.
4. Extract AST edges (`CONTAINS`, `EXPORTS`, `DECLARES`, `IMPORTS`, `CALLS` where syntactically available).
5. Extract type edges (`RETURNS_TYPE`, `ACCEPTS_TYPE`, `EXTENDS`, `IMPLEMENTS`, `REFERENCES`).
6. Parse JSDoc blocks and map locked semantic tags to locked semantic edges.
7. Assign provenance:
`ast` for syntax-derived edges, `type` for checker-derived edges, `jsdoc` for semantic tag edges.
8. Emit deterministic records sorted by:
`file`, `symbol`, `kind`, `edgeType`, `to`.

## JSDoc Semantic Mapping Contract

| Tag | Output Edge | Required Handling |
|---|---|---|
| `@category` | `IN_CATEGORY` | Create target literal node when missing |
| `@module` | `IN_MODULE` | Normalize module string and create edge |
| `@domain` | `IN_DOMAIN` | Normalize domain string and create edge |
| `@provides` | `PROVIDES` | Resolve symbol reference when possible, else literal node |
| `@depends` | `DEPENDS_ON` | Resolve symbol reference when possible, else literal node |
| `@errors` | `THROWS_DOMAIN_ERROR` | Create normalized error-domain node |

Additional parsing guarantees:
1. Required parse success tags tracked for validation:
`@category`, `@module`, `@since`, `@param`, `@returns`
2. Semantic tags produce deterministic, deduplicated edges per symbol.

## Deterministic Output Artifacts

### Per-File Artifact Shape
```json
{
  "schemaVersion": "kg-schema-v1",
  "workspace": "beep-effect3",
  "file": "packages/example/src/foo.ts",
  "commitSha": "abcdef1234...",
  "nodes": [],
  "edges": [],
  "stats": {
    "nodeCount": 0,
    "edgeCount": 0,
    "semanticEdgeCount": 0
  }
}
```

### Sorting and Normalization
1. Stable key ordering in JSON objects.
2. Arrays sorted deterministically before write.
3. UTF-8 output with Unix newlines.

## Error and Degradation Contract
1. Per-file parse/type failures are captured as structured diagnostics in local cache.
2. Hook read path never throws because of extraction errors.
3. Extraction failures in one file do not drop successful files from the same run.
4. If scope resolution fails globally, command exits non-zero and does not write partial Graphiti episodes.

## Optional SCIP Overlay (Non-Blocking)
1. SCIP overlay is disabled by default.
2. When enabled, SCIP edges are stored in a separate overlay channel and never replace deterministic extractor outputs.
3. Hook/query path may include overlay relations only when confidence and latency budgets allow.

## Acceptance Checks
1. Two full-mode runs on identical commit produce identical node/edge hashes.
2. Delta mode on empty `--changed` set produces no write operations.
3. Tag-edge outputs match locked mapping table exactly.
4. Out-of-scope files never appear in artifacts.
5. Overlay enable/disable does not affect base deterministic outputs.

## P3 Ownership Handoff
- AST Engineer:
`ts-morph` traversal, TypeChecker integration, deterministic artifact generation.
- Semantic Engineer:
JSDoc parsing and locked semantic tag mapping.
- Graphiti Engineer:
consume per-file artifacts and persist without schema drift.
- Hook Engineer:
consume only persisted schema outputs and local cache query API.

## Freeze Statement
All extraction-path architecture decisions are fixed, including scope filters, mode behavior, provenance policy, and optional overlay boundaries.
