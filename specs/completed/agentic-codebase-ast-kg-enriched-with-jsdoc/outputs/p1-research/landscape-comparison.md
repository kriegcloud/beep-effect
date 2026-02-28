# P1 Landscape Comparison (Decision-Log Freeze)

## Purpose
Revalidate the P0 research base and freeze the evidence log used for P2 architecture contracts.

## Lock Integrity Check (P0 -> P1)

| Decision Surface | P0 Lock | P1 Result |
|---|---|---|
| Read path policy | `hybrid` (local deterministic cache + Graphiti semantic layer) | Unchanged; no conflicting evidence found. [S4][S5] |
| Ingestion granularity | `per-file delta` | Unchanged; still aligned with TS incremental and changed-range parsing models. [S10][S11][S14] |
| Group strategy | stable `beep-ast-kg` + commit metadata | Unchanged; continues to support replay/debug provenance. [S4][S5] |
| Hook latency budget | enforce `p95 <= 1.5s` from R2 | Unchanged; remains required for rollout safety. |
| Index scope | include `apps/`, `packages/`, `tooling/`, `.claude/hooks`, `.claude/scripts`; exclude `specs/`, `.repos/` | Unchanged; no source or repo evidence requires scope expansion in P1. |

## Landscape Revalidation

| Topic | P1 Revalidation | Decision Freeze |
|---|---|---|
| Graph-backed code intelligence patterns | FalkorDB/code-graph repos still serve as architecture references, not direct drop-in implementation for this TS/Effect stack. [S1][S2] | Reuse pattern only; no backend adoption. |
| MCP + graph retrieval composition | Code-Graph-RAG pattern remains directionally useful for tool-mediated retrieval orchestration. [S3] | Keep MCP tool-first retrieval model. |
| Temporal semantic layer | Graphiti remains the semantic/episodic graph layer and aligns with existing repo integration anchors. [S4][S5] | Keep Graphiti as semantic layer, not deterministic source of truth. |
| TypeScript semantic extraction | ts-morph + TypeChecker remains the strongest deterministic extraction baseline for symbols, docs, and type relations. [S6][S7][S8][S9] | Keep as primary extraction stack. |
| Incremental planning | TS incremental + tree-sitter changed-range support + affected-scope pattern still supports per-file-first delta model. [S10][S11][S14] | Keep changed-file-first with widening policy in P2 contract. |
| Secondary index overlays | SCIP/scip-typescript remains useful but optional for MVP complexity control. [S12][S13] | Keep optional overlay, non-blocking for P2 freeze. |
| Documentation and static-analysis compatibility | TypeDoc + CodeQL support signals remain compatible with JS/TS validation boundaries. [S15][S16] | Keep optional validation overlays only. |

## Source Coverage Ledger (16/16 Retained)

| ID | Source | Status |
|---|---|---|
| S1 | FalkorDB code-graph README | Retained |
| S2 | FalkorDB code-graph-backend README | Retained |
| S3 | Code-Graph-RAG README | Retained |
| S4 | Graphiti README | Retained |
| S5 | Graphiti MCP server docs | Retained |
| S6 | ts-morph docs | Retained |
| S7 | ts-morph JSDoc API | Retained |
| S8 | ts-morph types API | Retained |
| S9 | TypeScript Compiler API wiki | Retained |
| S10 | TSConfig incremental option | Retained |
| S11 | tree-sitter advanced parsing | Retained |
| S12 | SCIP protocol docs | Retained |
| S13 | scip-typescript README | Retained |
| S14 | Nx affected docs | Retained |
| S15 | TypeDoc output options | Retained |
| S16 | CodeQL supported languages/frameworks | Retained |

## P2 Carry-Forward Items (Defaults Locked)
1. Deterministic hash canon details remain to be frozen in examples/fixtures.
- Default carried to P2: `workspace+path+symbol+kind+signature` field composition.
2. Local cache retention/invalidation policy remains to be specified.
- Default carried to P2: JSONL snapshots keyed by commit SHA.
3. Delta widening heuristic remains to be formalized.
- Default carried to P2: changed-file first, dependency-aware widening optional.
4. SCIP merge depth remains undecided.
- Default carried to P2: optional overlay, queried separately from deterministic cache.

## Freeze Statement
P1 research does not introduce any contradiction to P0 locked defaults or locked interface defaults. Remaining ambiguity is explicitly constrained to P2 contract authoring with defaults preserved.

## Sources
- [S1](https://raw.githubusercontent.com/FalkorDB/code-graph/main/README.md)
- [S2](https://raw.githubusercontent.com/FalkorDB/code-graph-backend/main/README.md)
- [S3](https://raw.githubusercontent.com/vitali87/code-graph-rag/main/README.md)
- [S4](https://raw.githubusercontent.com/getzep/graphiti/main/README.md)
- [S5](https://help.getzep.com/graphiti/getting-started/mcp-server)
- [S6](https://ts-morph.com/)
- [S7](https://ts-morph.com/details/documentation)
- [S8](https://ts-morph.com/details/types)
- [S9](https://raw.githubusercontent.com/wiki/microsoft/TypeScript/Using-the-Compiler-API.md)
- [S10](https://www.typescriptlang.org/tsconfig/#incremental)
- [S11](https://tree-sitter.github.io/tree-sitter/using-parsers/3-advanced-parsing.html)
- [S12](https://scip.dev/)
- [S13](https://raw.githubusercontent.com/sourcegraph/scip-typescript/main/README.md)
- [S14](https://nx.dev/ci/features/affected)
- [S15](https://typedoc.org/documents/Options.Output.html)
- [S16](https://codeql.github.com/docs/codeql-overview/supported-languages-and-frameworks/)
