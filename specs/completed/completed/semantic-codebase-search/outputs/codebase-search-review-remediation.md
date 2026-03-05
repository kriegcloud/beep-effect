# Codebase Search Review Remediation

Date: 2026-02-20  
Source review: `specs/completed/semantic-codebase-search/outputs/codebase-search-comprehensive-review.md`

## Summary

All findings from the comprehensive review were remediated in `tooling/codebase-search` and covered with regression tests. Baseline validation gates pass after changes.

## Remediations by Finding

### 1) P1: Relative `CODEBASE_ROOT` package identity/collision risk

Implemented:
- Normalized server runtime paths in `bin.ts`:
  - `rootDir` resolved to absolute path.
  - relative `indexPath` resolved against normalized `rootDir`.
- Hardened path normalization in pipeline package resolution:
  - `resolvePackageName` now strips `./`, leading slashes, and backslashes.
  - source-file relative path normalization hardened before package/module derivation.

Changed files:
- `tooling/codebase-search/src/bin.ts`
- `tooling/codebase-search/src/indexer/Pipeline.ts`

Regression coverage:
- `tooling/codebase-search/test/indexer/Pipeline.test.ts`
  - Added relative-root test verifying package filter works with `rootDir: "."` and package identities are correct.

---

### 2) P1: Package-filtered reindex deleting unrelated packages

Implemented:
- Added scoped file filtering in pipeline before destructive operations:
  - `added/modified/deleted/unchanged` sets are filtered by `packageFilter` for process/delete work.
  - LanceDB deletes now scoped to filtered `filesToDelete`.
  - BM25 removal now scoped to filtered `filesToDelete`.
- Explicitly rejected dangerous configuration:
  - `mode="full" + packageFilter` now fails fast with `IndexingError` in both `ReindexTool` and `Pipeline`.

Changed files:
- `tooling/codebase-search/src/indexer/Pipeline.ts`
- `tooling/codebase-search/src/mcp/ReindexTool.ts`

Regression coverage:
- `tooling/codebase-search/test/indexer/Pipeline.test.ts`
  - Added incremental package-filter regression test ensuring non-target package rows/symbol IDs remain in LanceDB/BM25.
  - Added full+packageFilter rejection assertion.
- `tooling/codebase-search/test/mcp/ReindexTool.test.ts`
  - Added full+packageFilter rejection test (`reindex-validate`).

---

### 3) P2: Filtered search underfill from post-truncation filtering

Implemented:
- `search_codebase` now expands hybrid candidate window when filters are present:
  - requests up to 20 fused candidates from `HybridSearch` when `kind` or `package` filter is used,
  - applies strict filters,
  - truncates to user-requested limit afterwards.

Changed file:
- `tooling/codebase-search/src/mcp/SearchCodebaseTool.ts`

Regression coverage:
- `tooling/codebase-search/test/mcp/SearchCodebaseTool.test.ts`
  - Added filter-truncation regression test with mocked ranked results where matching items appear after early non-matching items.

---

### 4) P2: BM25 tombstones starving active results under churn

Implemented:
- `Bm25Writer.search` now over-fetches raw BM25 hits to compensate for unmapped tombstoned docs:
  - fetch limit = `max(requestedLimit, activeMappedDocCount)`
  - then maps and truncates to requested limit.
- Applied to both live and mock writers for behavior consistency.

Changed file:
- `tooling/codebase-search/src/indexer/Bm25Writer.ts`

Regression coverage:
- Existing BM25 search tests continue to pass under updated behavior.

---

### 5) P2: `INDEX_PATH` inconsistency across server/indexer/hooks

Implemented:
- Added index-path-aware file-hash persistence/loading:
  - `scanFiles(..., options?.indexPath)`
  - `saveFileHashes(..., indexPath?)`
  - index path can be absolute or root-relative.
- Pipeline now threads `config.indexPath` through scan/hash persistence.
- Hooks now accept optional `indexPath` and resolve index directory consistently.
- Hook entrypoints now read `process.env.INDEX_PATH` and pass it through (including BM25 layer initialization).
- Added shared index-dir resolver helper for hook runtime entrypoints.

Changed files:
- `tooling/codebase-search/src/extractor/FileScanner.ts`
- `tooling/codebase-search/src/indexer/Pipeline.ts`
- `tooling/codebase-search/src/hooks/SessionStart.ts`
- `tooling/codebase-search/src/hooks/PromptSubmit.ts`
- `tooling/codebase-search/src/hooks/session-start-entry.ts`
- `tooling/codebase-search/src/hooks/prompt-submit-entry.ts`
- `tooling/codebase-search/src/internal/HookEntryRuntime.ts`
- `tooling/codebase-search/README.md`

Regression coverage:
- `tooling/codebase-search/test/extractor/FileScanner.test.ts`
  - Added custom `indexPath` read/write tests.
- `tooling/codebase-search/test/hooks/SessionStart.test.ts`
  - Added custom `indexPath` metadata read test.
- `tooling/codebase-search/test/hooks/PromptSubmit.test.ts`
  - Added custom `indexPath` BM25 path test.

## Validation Results

Executed after remediation:

```bash
npx eslint --config eslint.config.mjs 'tooling/*/src/**/*.ts'
bunx turbo run docgen --filter=@beep/repo-cli --filter=@beep/codebase-search
tsc -b tooling/codebase-search/tsconfig.json
npx vitest run tooling/codebase-search/test
```

Results:
- `eslint`: pass (warnings only, no errors)
- `docgen`: pass
- `tsc`: pass
- `vitest`: pass (`20` files, `319` tests)

## Notes

- `reindex` package filter semantics are now intentionally safe:
  - package filter is supported with `mode="incremental"`
  - `mode="full" + package` is rejected to prevent unintended full-index data loss.
