# P0 Landscape Comparison

## Purpose
Document the external and internal evidence used to lock P0 decisions for AST KG + JSDoc semantic enrichment on Graphiti.

## Decision Snapshot
1. Primary extraction stack: `ts-morph + TypeScript TypeChecker` (semantic) with optional `tree-sitter` prefilter for fast changed-range detection. [S6][S7][S8][S9][S11]
2. Read path: `hybrid` local deterministic cache + Graphiti semantic retrieval via MCP. [S4][S5]
3. Incremental strategy: `per-file delta` tied to change scope; optionally widened by project graph impact. [S10][S11][S14]
4. Secondary source-intelligence path: optional SCIP ingestion bridge (not mandatory for P2). [S12][S13]
5. Documentation semantics source of truth: repo JSDoc/TSDoc policy + structured extraction outputs. [S7][S15]

## Comparative Findings

| Topic | Source Signal | P0 Decision |
|---|---|---|
| Code graph app patterns | FalkorDB code-graph and backend show practical graph-centric code exploration and query flow patterns. [S1][S2] | Reuse architecture patterns only; do not adopt backend language constraints directly. |
| MCP + graph retrieval integration | Code-Graph-RAG demonstrates MCP + graph retrieval composition for code assistants. [S3] | Keep MCP tool-first retrieval design in downstream contracts. |
| Temporal graph memory | Graphiti is built for temporal knowledge graph workflows and incremental state updates. [S4] | Graphiti remains semantic memory layer; deterministic AST snapshot remains local canonical cache. |
| Graphiti tool transport | Graphiti MCP docs define HTTP MCP server usage and tool access pattern. [S5] | Reuse existing in-repo Graphiti client/transport conventions. |
| TypeScript semantic extraction | ts-morph wraps Compiler API and exposes docs/types accessors with TypeChecker support. [S6][S7][S8][S9] | Use ts-morph as primary semantic extractor. |
| Incremental behavior | TS incremental builds persist graph data for faster rebuilds; tree-sitter supports edit+changed range parsing. [S10][S11] | Lock per-file delta ingestion and deterministic cache metadata by commit. |
| Code intelligence protocol | SCIP provides protocol-level source code intelligence; scip-typescript provides TS indexer workflow. [S12][S13] | Treat SCIP as optional enrichment path, not a hard dependency. |
| Change scoping at monorepo level | Nx affected uses project graph + git diff to compute impact scope. [S14] | Use changed file + dependency scope expansion for delta planning. |
| Documentation output contracts | TypeDoc output options expose JSON/HTML output boundaries useful for doc-derived metadata quality checks. [S15] | Allow optional doc-output validation pass in P3/P4. |
| Language support guardrails | CodeQL confirms JS/TS are supported for analysis workflows. [S16] | Keep static-analysis compatibility assumptions limited to JS/TS. |

## Required Source Coverage Ledger (No Omissions)

| ID | Source | Used For |
|---|---|---|
| S1 | FalkorDB code-graph README | Code-graph architecture patterns and graph query UX baseline |
| S2 | FalkorDB code-graph-backend README | Backend indexing/query service boundaries and current language support notes |
| S3 | Code-Graph-RAG README | MCP + graph retrieval architecture reference |
| S4 | Graphiti README | Temporal graph memory model and incremental context premise |
| S5 | Graphiti MCP server docs | MCP transport/server integration model |
| S6 | ts-morph docs | TypeScript project parsing and semantic API wrapper grounding |
| S7 | ts-morph JSDoc API | Deterministic JSDoc extraction surfaces |
| S8 | ts-morph types API | TypeChecker/type relationship extraction surfaces |
| S9 | TypeScript Compiler API wiki | Program/type-checker compilation model |
| S10 | TSConfig incremental option | Incremental build metadata and re-run behavior |
| S11 | tree-sitter advanced parsing | Changed-range incremental parsing behavior |
| S12 | SCIP protocol docs | Protocol-level source intelligence reference |
| S13 | scip-typescript README | TypeScript SCIP indexer implementation surface |
| S14 | Nx affected docs | Monorepo affected-scope computation |
| S15 | TypeDoc output options | Structured documentation output constraints |
| S16 | CodeQL supported languages/frameworks | JS/TS support boundaries for static analysis compatibility |

## Locked Implications for P1/P2
1. Schema contracts must expose deterministic IDs that are independent from Graphiti-generated identifiers.
2. Delta planner must start with changed files and support widening scope through dependency-aware expansion.
3. Hook context enrichment must run through hybrid read path and obey strict timeout/fallback behavior.
4. Any SCIP integration must be additive and optional until benchmark evidence proves necessity.

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
