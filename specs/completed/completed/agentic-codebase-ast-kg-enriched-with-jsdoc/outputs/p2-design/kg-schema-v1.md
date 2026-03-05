# KG Schema v1 (Deterministic Contract Freeze)

## Purpose
Freeze the deterministic node/edge schema for AST, type, and JSDoc-enriched graph generation so P3 can implement without architecture decisions.

## Lock Alignment (Normative)

| Interface Surface | Frozen Contract |
|---|---|
| CLI command set | `bun run beep kg index --mode full` and `bun run beep kg index --mode delta --changed <paths>` |
| KG node ID | `<workspace>::<file>::<symbol>::<kind>::<signature-hash>` |
| KG edge provenance | `provenance = ast | type | jsdoc` |
| Semantic tags to edges | `@category -> IN_CATEGORY`, `@module -> IN_MODULE`, `@domain -> IN_DOMAIN`, `@provides -> PROVIDES`, `@depends -> DEPENDS_ON`, `@errors -> THROWS_DOMAIN_ERROR` |
| Graphiti persistence envelope | `AstKgEpisodeV1` serialized in `episode_body` with `source="json"` when possible; strict text fallback template otherwise |
| Hook context format | XML-style compact block containing `<kg-context>`, `<symbols>`, `<relationships>`, `<confidence>`, `<provenance>` |
| Hook fail behavior | Hard timeout + no-throw: on failure emit no KG block and preserve existing hook output |

## Version and Scope
- Schema version: `kg-schema-v1`
- Coverage: TypeScript source under include roots only.
- Include roots: `apps/`, `packages/`, `tooling/`, `.claude/hooks`, `.claude/scripts`
- Exclude roots: `specs/`, `.repos/`
- File extensions: `.ts`, `.tsx`, `.mts`, `.cts`
- Explicit file exclusions: `.d.ts`, generated artifacts (`dist/`, `coverage/`, `node_modules/`)

## Node Model

### Node Kinds
`workspace`, `file`, `class`, `interface`, `typeAlias`, `enum`, `function`, `method`, `property`, `variable`, `namespace`

### Required Fields

| Field | Type | Rule |
|---|---|---|
| `schemaVersion` | string | Must be `kg-schema-v1` |
| `nodeId` | string | Must match `<workspace>::<file>::<symbol>::<kind>::<signature-hash>` |
| `workspace` | string | Workspace slug (for this repo: `beep-effect3`) |
| `file` | string | POSIX repo-relative path |
| `symbol` | string | Symbol display name, escaped for delimiter safety |
| `kind` | string | One of Node Kinds |
| `signatureHash` | string | Lowercase hex SHA-256 digest |
| `signatureCanonical` | string | Canonical signature string used in digest input |
| `exported` | boolean | `true` when symbol is exported from file/module boundary |
| `range` | object | `{startLine,startColumn,endLine,endColumn}` 1-based source range |

### Optional Fields
`module`, `category`, `domain`, `since`, `summary`, `deprecation`, `sourceCommitSha`

## Edge Model

### Core Edge Types
`CONTAINS`, `EXPORTS`, `IMPORTS`, `CALLS`, `RETURNS_TYPE`, `ACCEPTS_TYPE`, `EXTENDS`, `IMPLEMENTS`, `REFERENCES`, `DECLARES`

### Semantic Edge Types (Locked)
`IN_CATEGORY`, `IN_MODULE`, `IN_DOMAIN`, `PROVIDES`, `DEPENDS_ON`, `THROWS_DOMAIN_ERROR`

### Required Edge Fields

| Field | Type | Rule |
|---|---|---|
| `schemaVersion` | string | Must be `kg-schema-v1` |
| `edgeId` | string | SHA-256 of canonical edge tuple |
| `from` | string | Source `nodeId` |
| `to` | string | Target `nodeId` or canonical literal node ID |
| `type` | string | One of Core or Semantic edge types |
| `provenance` | string | One of `ast`, `type`, `jsdoc` |
| `confidence` | number | Range `[0,1]`; deterministic extraction defaults to `1.0` |

## Deterministic ID Canonicalization

### Canonicalization Rules
1. Normalize path separators to `/`.
2. Strip leading `./`.
3. Keep path casing exactly as on disk.
4. Normalize signature whitespace to single spaces.
5. Trim leading/trailing whitespace from all tuple fields.
6. Build digest input as: `workspace|file|symbol|kind|signatureCanonical`.
7. Compute `signature-hash` as full lowercase hex SHA-256 of the digest input.
8. Build `nodeId` as: `<workspace>::<file>::<symbol>::<kind>::<signature-hash>`.

### Canonical Fixtures

| Workspace | File | Symbol | Kind | Signature Canonical | SHA-256 |
|---|---|---|---|---|---|
| `beep-effect3` | `packages/ast-kg/src/index.ts` | `indexWorkspace` | `function` | `(mode:"full"|"delta")=>Effect<IndexSummary,IndexError>` | `780e5e74c08e1fef6c157b8602f8249c36379bdaac6f970205c02a5ac312c3e0` |
| `beep-effect3` | `apps/web/src/lib/graphiti/client.ts` | `GraphitiClient` | `class` | `class GraphitiClient{constructor(config:GraphitiConfig);query(packet:GraphQueryPacket):Effect<GraphResult,GraphitiError>}` | `dc1965237ec81eced7012cf9be117dc48406e2d483ab0e3f5da2a1c40f22bc5e` |
| `beep-effect3` | `tooling/agent-eval/src/commands/bench.ts` | `runBench` | `function` | `(args:BenchArgs)=>Effect<BenchReport,BenchError>` | `e59f5e546abea91d74495b60ba88f74c1584e5515a0ee5ddb1ac16001f4bbc4d` |

## Canonical Edge Digest
Edge hash input format:
`from|type|to|provenance`

Example digest:
- Input tuple:
`<workspace>::packages/ast-kg/src/index.ts::indexWorkspace::function::780e5e74c08e1fef6c157b8602f8249c36379bdaac6f970205c02a5ac312c3e0|CALLS|<workspace>::tooling/agent-eval/src/commands/bench.ts::runBench::function::e59f5e546abea91d74495b60ba88f74c1584e5515a0ee5ddb1ac16001f4bbc4d|type`
- `edgeId` SHA-256:
`8729de86cd97870a3b213728a9a5b968647c860864fbd7fd4549296d7c467a97`

## Semantic Tag Mapping (Locked, Exact)

| JSDoc Tag | Edge Type | Provenance |
|---|---|---|
| `@category` | `IN_CATEGORY` | `jsdoc` |
| `@module` | `IN_MODULE` | `jsdoc` |
| `@domain` | `IN_DOMAIN` | `jsdoc` |
| `@provides` | `PROVIDES` | `jsdoc` |
| `@depends` | `DEPENDS_ON` | `jsdoc` |
| `@errors` | `THROWS_DOMAIN_ERROR` | `jsdoc` |

## Validation Rules
1. Same commit + same source tree must produce byte-identical sorted node/edge JSONL output.
2. `nodeId` uniqueness is repository-global within a commit.
3. `edgeId` uniqueness is repository-global within a commit.
4. `provenance` outside `ast|type|jsdoc` is rejected.
5. Out-of-scope files are rejected before parse.

## P3 Ownership Handoff
- AST Engineer: implement node extraction, canonical signatures, deterministic hash generation.
- Semantic Engineer: implement locked JSDoc tag-to-edge mapper.
- Graphiti Engineer: consume this schema without introducing alternate ID or edge provenance formats.
- Hook Engineer: read-only consumer of `nodeId`, `edge.type`, and `provenance`.

## Freeze Statement
All schema-level open items from P1 are resolved in this contract with fixed canonicalization rules and fixtures.
