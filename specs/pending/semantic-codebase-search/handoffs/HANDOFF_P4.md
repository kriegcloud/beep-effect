# Handoff → P4: Implementation

> Context transfer from P3 (Synthesis & Planning) to P4 (Implementation)
> Token budget: ≤4,000 tokens

---

## Working Memory (≤2,000 tokens)

### Current Task
Implement the semantic codebase search system across 3 sub-phases: P4a (documentation standards), P4b (extractor + pipeline), P4c (MCP server + hooks). Total: 18 tasks, ~25 hours estimated.

### Phase Objectives
1. **P4a (T1–T4):** Configure ESLint JSDoc rules, update docgen config, backfill existing code JSDoc, add lefthook pre-commit. Result: all existing code meets documentation standards.
2. **P4b (T5–T12):** Scaffold package, implement IndexedSymbol schema, build JSDoc + Effect extractors, create embedding service, wire up LanceDB + BM25 storage, orchestrate pipeline. Result: `reindex` produces a searchable index.
3. **P4c (T13–T18):** Implement hybrid search + relation resolver, build 4 MCP tools, tune output formatting, configure integration, implement hooks. Result: working MCP server + auto-injection hooks.

### Critical Implementation Notes
- **Two-pass import resolution:** SymbolAssembler must extract all symbols first (build ID registry), then resolve imports against registry in second pass. See cross-validation-report.md GAP-1.
- **LanceDB has 21 columns** (not 18): SymbolRow in embedding-pipeline-design.md is authoritative. Includes `end_line`, `effect_pattern`, `title` that the mapping table missed.
- **Hooks use BM25-only search** (no embedding model). MCP tools use full hybrid (vector + BM25 + RRF). This is intentional — hooks can't afford model cold start within 5s timeout.
- **ONNX model is 521MB:** First `EmbeddingService` use downloads the model. Document this. Mock the service in tests.
- **No ESLint rule for @category or @provides/@depends:** Accept in Phase 1. Extractor validates these via `validateIndexedSymbol()`.

### Blocking Issues
None. All designs and plans are complete.

### Success Criteria
- [ ] `npx eslint --config eslint.config.mjs 'tooling/*/src/**/*.ts'` — zero errors
- [ ] `tsc -b tooling/codebase-search/tsconfig.json` — compiles clean
- [ ] `npx vitest run` — all tests pass (extractor, indexer, search, MCP, hooks)
- [ ] MCP server starts on stdio, responds to all 4 tools
- [ ] Hooks complete within 5s timeout
- [ ] Full index of existing codebase completes in <30s
- [ ] search_codebase returns relevant results for "schema for package names"

---

## Episodic Memory (≤1,000 tokens)

### P3 Summary
3 documents produced:

| Document | Key Output |
|----------|-----------|
| `package-scaffolding.md` | Exact directory layout (30+ files), package.json with 9 dependencies, tsconfig, vitest config, MCP + hook configs |
| `task-graph.md` | 18 tasks across P4a/P4b/P4c with dependency edges, acceptance criteria, effort estimates |
| `cross-validation-report.md` | 6 checks, 6 gaps found (none blocking), all with resolutions |

### Parallelism Opportunities
- T1 (ESLint) and T5 (package scaffold) can start in parallel
- T7 (JSDoc extractor) and T8 (Effect extractor) can run in parallel after T6
- T13 (search) and T17 (SessionStart hook) can run in parallel after T11

### Key Decisions from P3
| Decision | Rationale |
|----------|-----------|
| 21 LanceDB columns (SymbolRow authoritative) | Mapping table was incomplete, SymbolRow has all needed fields |
| Two-pass import resolution | Need full symbol registry before resolving cross-file imports |
| Deferred @category enforcement | No built-in ESLint rule; custom rule in Phase 2 |
| Intentional hook vs MCP format difference | Hooks optimize for compact injection; MCP for completeness |

---

## Semantic Memory (≤500 tokens)

### Tech Stack Constants
- **Runtime:** Effect v4 (TypeScript)
- **Testing:** `npx vitest run` (NEVER `bun test`)
- **Coding style:** Effect.fn, no native Map/Set/Array, Schema annotations required
- **Errors:** S.TaggedErrorClass (never Data.TaggedError)
- **CLI module:** `effect/unstable/cli`

### Package Dependencies (catalog additions)
```
@lancedb/lancedb ^0.15.0    — embedded vector DB
@huggingface/transformers ^3.5.0 — ONNX embedding model
@modelcontextprotocol/sdk ^1.12.0 — MCP server protocol
wink-bm25-text-search ^2.2.0    — keyword search
ts-morph ^25.0.0             — AST parsing
doctrine ^3.0.0              — JSDoc parsing
eslint-plugin-jsdoc ^50.0.0  — lint rules (root devDep)
```

### File Locations
- Package scaffold: `tooling/codebase-search/`
- ESLint config: `eslint.config.mjs` (root)
- Custom rules: `eslint-rules/` (root)
- tsdoc.json: root
- Index output: `.code-index/` (gitignored)
- MCP config: `.mcp.json`
- Hook config: `.claude/settings.json`

---

## Procedural Memory (Links Only)

- P3 outputs: `specs/pending/semantic-codebase-search/outputs/package-scaffolding.md`, `task-graph.md`, `cross-validation-report.md`
- P2 outputs: same directory (7 design documents)
- Package template: `tooling/cli/` (follow for structure)
- Effect v4 patterns: `tooling/cli/src/commands/create-package.ts`
- Memory: `~/.claude/projects/.../memory/MEMORY.md` (Effect v4 API corrections)
- Docgen source: `.repos/docgen/src/Parser.ts` (reference for JSDoc extraction patterns)

---

## Verification Table

| Phase | Verification |
|-------|-------------|
| P4a complete | `npx eslint` zero errors, `bunx @effect/docgen` succeeds, all exports documented |
| P4b complete | `tsc -b` compiles, `npx vitest run` passes, full reindex produces valid index |
| P4c complete | MCP server responds to all 4 tools, hooks complete <5s, search returns relevant results |
