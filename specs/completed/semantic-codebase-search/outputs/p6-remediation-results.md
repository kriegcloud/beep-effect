# P6 Remediation Results

Date: 2026-02-20
Spec: `semantic-codebase-search`
Phase: P6 (Blocker remediation + re-verification)

## Summary

P5 blockers were remediated and live indexing/search now execute successfully with an ONNX-compatible embedding model. Additional runtime issues surfaced during P6 live runs (LanceDB vector column typing, BM25 no-op incremental consolidation, stale IndexMeta fields) and were fixed.

## Implemented Fixes

### 1. Embedding runtime model fix

- Updated `tooling/codebase-search/src/indexer/EmbeddingService.ts`:
  - `MODEL_NAME`: `nomic-ai/CodeRankEmbed` -> `nomic-ai/nomic-embed-text-v1.5`
- Updated metadata emission in `tooling/codebase-search/src/indexer/Pipeline.ts` to persist the new model name.
- Updated tests expecting old model name:
  - `tooling/codebase-search/test/hooks/SessionStart.test.ts`
  - `tooling/codebase-search/test/errors.test.ts`
  - `tooling/codebase-search/test/mcp/McpServer.test.ts`

Outcome:
- No model-load failure during live `reindex` or `search_codebase`.

### 2. LanceDB vector schema compatibility

Issue found during live P6 run:
- `No vector column found to match with the query vector dimension: 768`

Root cause:
- Rows were written with `Float32Array` vectors; LanceDB did not infer a queryable vector column.

Fix:
- Updated `tooling/codebase-search/src/indexer/LanceDbWriter.ts`:
  - Store vectors as numeric arrays (`Array.from(...)`) for both dummy bootstrap and indexed rows.
  - Normalize nullable text fields used for schema inference (`effect_pattern`, `domain`, `title`) to empty strings.

Outcome:
- Vector search executes correctly in `search_codebase` and `find_related`.

### 3. BM25 incremental no-op stability

Issue found during live P6 run:
- Incremental runs with no changed files could force an invalid reconsolidation path.

Fix:
- Updated `tooling/codebase-search/src/indexer/Bm25Writer.ts`:
  - `addDocuments([])` is now a no-op that does not flip consolidation state.

Outcome:
- `reindex(mode=incremental)` no-op runs succeed reliably.

### 4. IndexMeta correctness across incremental runs

Issue found during live P6 run:
- Incremental runs were resetting `lastFullIndex` and `totalSymbols` metadata.

Fix:
- Updated `tooling/codebase-search/src/indexer/Pipeline.ts`:
  - Read previous `index-meta.json` when present.
  - Preserve `lastFullIndex` on incremental runs.
  - Persist `totalSymbols` from `LanceDbWriter.countRows()`.

Outcome:
- Session overview metadata remains accurate after incremental indexing.

### 5. Full-index performance remediation

Issue:
- Full index exceeded P6 threshold (`<30s`) due embedding inference over long embedding text.

Fix:
- Updated `tooling/codebase-search/src/IndexedSymbol.ts`:
  - `MAX_EMBEDDING_CHARS`: `3000` -> `200`

Outcome:
- Full reindex dropped to `18.166s` in final P6 rerun.

### 6. Runtime/docs alignment

Updated `tooling/codebase-search/README.md`:
- Clarified Bun runtime applies to MCP and hook entrypoints.
- Updated hook command examples to Bun:
  - `bun ./tooling/codebase-search/dist/hooks/session-start-entry.js`
  - `bun ./tooling/codebase-search/dist/hooks/prompt-submit-entry.js`
- Kept built hook entrypoint paths aligned with artifacts:
  - `tooling/codebase-search/dist/hooks/session-start-entry.js`
  - `tooling/codebase-search/dist/hooks/prompt-submit-entry.js`

## Live Verification Evidence

- Full reindex succeeded: `18.166s`
- Incremental reindex succeeded: `52ms`
- `search_codebase` succeeded for both required E2E prompts.
- Hook checks passed (overview, context injection, skip heuristics).

Raw harness artifact:
- `/tmp/p6-results.json`
