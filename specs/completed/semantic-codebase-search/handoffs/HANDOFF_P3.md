# Handoff → P3: Synthesis & Planning

> Context transfer from P2 (Evaluation & Design) to P3 (Synthesis & Planning)
> Token budget: ≤4,000 tokens

---

## Working Memory (≤2,000 tokens)

### Current Task
Synthesize 7 P2 design documents into a unified implementation plan. Produce: (1) package scaffolding spec, (2) task dependency graph, (3) implementation order with file-level assignments.

### Phase Objectives
1. **Consolidate package structure** — Define `tooling/codebase-search/` directory layout, package.json, tsconfig
2. **Build task graph** — Decompose into implementable tasks (each ≤2 hours) with dependencies
3. **Assign to implementation phases** — P4a (doc standards), P4b (extractor + pipeline), P4c (MCP + hooks)
4. **Cross-validate designs** — Verify IndexedSymbol fields align with extractor capabilities, MCP outputs align with LanceDB schema

### Coexistence Constraint
The `shared-memories` spec deploys Graphiti MCP (`graphiti-memory`, HTTP transport) with a `Stop` hook. Our system must not conflict:
- MCP server name: `codebase-search` (not `graphiti-memory`)
- Hook events: `SessionStart` + `UserPromptSubmit` (not `Stop`)
- No shared dependencies or runtime conflicts

### Blocking Issues
None. All designs are complete.

### Success Criteria
- [ ] Package scaffolding spec with exact directory layout, dependencies, scripts
- [ ] Task graph with ≤20 tasks, each sized ≤2 hours, dependencies explicit
- [ ] Implementation phases P4a/P4b/P4c have clear boundaries and entry/exit criteria
- [ ] Cross-validation report: no gaps between design docs

---

## Episodic Memory (≤1,000 tokens)

### P2 Summary
7 design documents produced (124KB total):

| Document | Key Output |
|----------|-----------|
| `jsdoc-standard.md` | Tag requirement matrix per symbol kind (9 kinds × 15 tags), quality bar, tsdoc.json |
| `indexed-symbol-schema.md` | 40+ field TypeScript interface, `buildEmbeddingText()`, `buildKeywordText()`, classification rules |
| `mcp-api-design.md` | 4 tools: search_codebase, find_related, browse_symbols, reindex. Token budgets defined. |
| `hook-integration-design.md` | SessionStart + UserPromptSubmit hooks. BM25-only for hooks (avoids cold model load). 5s timeout. |
| `eslint-config-design.md` | Full flat config, 2 custom rules (require-since-semver, require-schema-annotations), tsdoc.json |
| `docgen-vs-custom-evaluation.md` | **Hybrid approach**: reimplement docgen's JSDoc patterns (~150 LoC) + 5 Effect extractors (~200 LoC) |
| `embedding-pipeline-design.md` | CodeRankEmbed ONNX, LanceDB table schema, BM25 via wink, RRF k=60, incremental via content hash |

### Key Decisions Locked in P2
| Decision | Rationale |
|----------|-----------|
| Hybrid extractor (not docgen reuse) | Docgen is Effect v3, can't import. ~400 LoC total. |
| BM25-only hooks | Can't afford 2-3s model cold start in 5s hook timeout |
| 4 MCP tools | Covers search, navigation, browsing, indexing |
| Gradual ESLint (3 phases) | Phase 1: presence errors. Phase 2: quality errors. Phase 3: custom rules. |
| LanceDB single "symbols" table | All fields in one row. metadata_json blob for full IndexedSymbol. |

---

## Semantic Memory (≤500 tokens)

### Tech Stack Constants
- **Runtime:** Effect v4 (TypeScript)
- **Testing:** vitest + @effect/vitest (NEVER bun test)
- **Coding style:** Effect.fn, no native Map/Set/Array, Schema annotations required
- **Errors:** S.TaggedErrorClass (never Data.TaggedError)
- **New package:** `tooling/codebase-search/` (follows tooling/cli template)

### Package Dependencies (New)
- `@lancedb/lancedb` — embedded vector DB
- `@huggingface/transformers` — ONNX embedding model
- `wink-bm25-text-search` — keyword search
- `@modelcontextprotocol/sdk` — MCP server
- `ts-morph` — AST parsing
- `doctrine` — JSDoc parsing
- `eslint-plugin-jsdoc` — lint rules (root devDependency)

### Implementation Phases
- **P4a:** Doc standards enforcement (ESLint config, tsdoc.json, docgen config updates, backfill existing code)
- **P4b:** Extractor + embedding pipeline (ts-morph parser, Effect extractors, CodeRankEmbed, LanceDB storage, BM25 index)
- **P4c:** MCP server + hooks (4 tools, SessionStart hook, UserPromptSubmit hook, .mcp.json config)

---

## Procedural Memory (Links Only)

- P2 outputs: `specs/pending/semantic-codebase-search/outputs/` (7 new files)
- P1 outputs: same directory (10 existing files)
- Docgen source: `.repos/docgen/src/Parser.ts` (974 lines, key reference)
- Package template: `tooling/cli/` (follow for new package setup)
- Effect v4 patterns: `tooling/cli/src/commands/create-package.ts`
- Memory: `~/.claude/projects/.../memory/MEMORY.md` (Effect v4 API corrections)

---

## Verification Table

| Output | Verification Check |
|--------|-------------------|
| `outputs/package-scaffolding.md` | Directory layout, package.json, tsconfig, scripts defined |
| `outputs/task-graph.md` | ≤20 tasks, each ≤2h, dependency edges, phase assignment |
| `outputs/cross-validation-report.md` | All design docs aligned, no gaps |
| Updated `REFLECTION_LOG.md` | P3 section filled |
| `handoffs/HANDOFF_P4.md` | Context transfer for implementation |
| `handoffs/P4_ORCHESTRATOR_PROMPT.md` | Copy-paste ready |
