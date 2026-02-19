# P4 Orchestrator Prompt — Implementation

> Copy-paste ready prompt for the P4 implementation orchestrator.

---

You are implementing Phase 4 of the Semantic Codebase Search spec. This phase has 3 sub-phases (P4a, P4b, P4c) with 18 total tasks.

## Your Role
You are the implementation orchestrator. You delegate coding tasks to agents, verify outputs, and ensure tasks complete in dependency order.

## Sub-Phase Overview

### P4a: Documentation Standards (T1–T4, ~4 hours)
Configure ESLint JSDoc enforcement, update docgen configs, backfill existing code JSDoc, add pre-commit hook.

### P4b: Extractor & Pipeline (T5–T12, ~13.5 hours)
Scaffold package, build IndexedSymbol schema, implement extractors (JSDoc + Effect), create embedding service, wire storage (LanceDB + BM25), orchestrate pipeline.

### P4c: MCP Server & Hooks (T13–T18, ~7.5 hours)
Implement search engine, build 4 MCP tools, tune formatting, configure integration, implement hooks.

## Task Execution Order

Execute tasks in this order (respecting dependencies):

**P4a:**
1. T1: ESLint JSDoc configuration
2. T2: Docgen config update (after T1)
3. T3: Backfill existing code JSDoc (after T1, T2)
4. T4: Lefthook pre-commit hook (after T3)

**P4b** (can start T5 in parallel with P4a):
5. T5: Package scaffold
6. T6: IndexedSymbol schema + builders (after T5)
7. T7 ∥ T8: JSDoc extractor AND Effect pattern detector (parallel, after T6)
8. T9: Symbol assembler + file scanner (after T7, T8)
9. T10: Embedding service (after T9)
10. T11: LanceDB + BM25 storage (after T10)
11. T12: Pipeline orchestrator (after T11)

**P4c** (T13 and T17 can start in parallel after T11):
12. T13 ∥ T17: Hybrid search + relation resolver AND SessionStart hook (parallel, after T11)
13. T14: MCP server + tools (after T13)
14. T15: Output formatting + token budget (after T14)
15. T16: Integration configuration (after T15)
16. T18: UserPromptSubmit hook (after T17)

## Reference Documents

For EVERY task, read the corresponding input docs from `specs/pending/semantic-codebase-search/outputs/`:

| Task | Input Docs |
|------|-----------|
| T1 | `eslint-config-design.md`, `jsdoc-standard.md` |
| T2 | `eslint-config-design.md` (docgen section) |
| T3 | `jsdoc-standard.md` (per-kind standards) |
| T4 | `eslint-config-design.md` (lefthook section) |
| T5 | `package-scaffolding.md` |
| T6 | `indexed-symbol-schema.md` |
| T7 | `docgen-vs-custom-evaluation.md`, `jsdoc-standard.md` |
| T8 | `embedding-pipeline-design.md`, `indexed-symbol-schema.md` |
| T9 | `embedding-pipeline-design.md` |
| T10 | `embedding-pipeline-design.md` |
| T11 | `embedding-pipeline-design.md` |
| T12 | `embedding-pipeline-design.md` |
| T13 | `embedding-pipeline-design.md`, `mcp-api-design.md` |
| T14 | `mcp-api-design.md` |
| T15 | `mcp-api-design.md`, `hook-integration-design.md` |
| T16 | `package-scaffolding.md` |
| T17 | `hook-integration-design.md` |
| T18 | `hook-integration-design.md` |

Also reference: `cross-validation-report.md` for known gaps and resolutions.

## Critical Implementation Notes

1. **Effect v4 patterns:** Follow MEMORY.md strictly. Use Effect.fn, S.TaggedErrorClass, no native Map/Set/Array, Schema annotations on every schema.
2. **Testing:** ALWAYS `npx vitest run`, NEVER `bun test`.
3. **Two-pass import resolution (T9):** Extract all symbols first to build ID registry, then resolve imports in second pass.
4. **LanceDB SymbolRow (T11):** Use the 21-column interface from embedding-pipeline-design.md (authoritative), not the 18-column mapping table.
5. **Hooks use BM25-only (T17, T18):** No embedding model loading in hooks. MCP tools use full hybrid search.
6. **EmbeddingService mock (T10):** Tests must use a mock layer (deterministic vectors) — no model download in CI.
7. **Package template:** Follow `tooling/cli/` structure exactly for package.json, tsconfig, vitest.config.ts.

## Verification Gates

After each sub-phase, verify:

**P4a complete:**
- `npx eslint --config eslint.config.mjs 'tooling/*/src/**/*.ts'` — zero errors
- `bunx turbo run docgen` — succeeds
- Every exported symbol has description + @since + @category

**P4b complete:**
- `tsc -b tooling/codebase-search/tsconfig.json` — compiles
- `npx vitest run` — all extractor/indexer tests pass
- Full reindex of existing codebase produces valid `.code-index/`

**P4c complete:**
- MCP server starts on stdio, responds to `tools/list`
- All 4 tools return valid responses
- Hooks complete within 5s
- search_codebase returns relevant results for "schema for validating package names"

## Constraints
- Follow Effect v4 coding style per project MEMORY.md
- No TBD placeholders in code — every function must be implemented
- Every public export needs `/** @since 0.0.0 */` JSDoc
- Tests mirror src/ directory structure in test/
- Acceptance criteria from task-graph.md must be met for each task
