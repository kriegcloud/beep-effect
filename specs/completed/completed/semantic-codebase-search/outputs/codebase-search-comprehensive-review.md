# Codebase Search Comprehensive Review

Date: 2026-02-20  
Scope: `tooling/codebase-search/src/**`, `tooling/codebase-search/test/**`, `tooling/codebase-search/README.md` + P6 closeout artifacts

## 1. Executive Verdict

**FAIL**

Baseline quality gates pass (`eslint`, `docgen`, `tsc`, `vitest`), but there are high-severity correctness defects around package identity and package-filter reindex behavior that can corrupt or remove index coverage.

## 2. Findings (Severity Ordered)

### [P1] Relative `CODEBASE_ROOT` (`.`) produces incorrect package identity and cross-package collisions

- Impacted files:
  - `tooling/codebase-search/src/indexer/Pipeline.ts:181`
  - `tooling/codebase-search/src/indexer/Pipeline.ts:269`
  - `tooling/codebase-search/src/bin.ts:27`
  - `tooling/codebase-search/README.md:37`
- Failure mode:
  - Default runtime config uses `CODEBASE_ROOT="."`.
  - In `extractSymbolsFromFiles`, ts-morph source paths become absolute-like (`/tooling/...`) when created from relative paths.
  - Relative-path recovery fails, so `resolvePackageName` sees segments like `['', 'tooling', 'cli', ...]` and resolves package to `@beep/tooling` (or `@beep/packages`) instead of `@beep/cli`, `@beep/repo-utils`, etc.
  - This collapses package identity, breaks package filtering/browse accuracy, and can create ID collisions across packages.
- Recommended fix:
  - Normalize `rootDir` to an absolute path at startup (`path.resolve`) and in pipeline path handling use `Path.relative(rootDir, sfPath)` with normalization.
  - Strip leading `/` and `./` before `resolvePackageName`.
- Test needed:
  - Integration test for `Pipeline.run` with `rootDir: "."` asserting extracted symbols keep correct package names (e.g., `@beep/cli` and `@beep/repo-utils` remain distinct).

### [P1] `package`-filtered reindex deletes unrelated package data in both LanceDB and BM25

- Impacted files:
  - `tooling/codebase-search/src/indexer/Pipeline.ts:355`
  - `tooling/codebase-search/src/indexer/Pipeline.ts:360`
  - `tooling/codebase-search/src/indexer/Pipeline.ts:400`
  - `tooling/codebase-search/src/indexer/Pipeline.ts:425`
- Failure mode:
  - `extractSymbolsFromFiles` respects `packageFilter`, but deletion/removal sets are computed from unfiltered scan results.
  - `lanceDbWriter.upsert(filesToDelete, symbolsWithVectors)` deletes modified/deleted files repo-wide, then only reinserts filtered-package symbols.
  - BM25 removal uses unfiltered affected files/prefixes, removing unrelated symbol mappings that are not re-added.
  - In full mode with `packageFilter`, `createTable()` wipes the entire table before reindexing only the selected package.
- Recommended fix:
  - Apply package filtering to `filesToProcess`, `filesToDelete`, and BM25 affected-prefix inputs before delete/remove operations.
  - Decide and enforce semantics for `mode="full" + packageFilter` (either reject this combination or preserve non-target packages).
- Test needed:
  - Two-package integration test: seed full index, mutate both packages, run incremental with `packageFilter` for one package, assert untouched package symbols remain in LanceDB and BM25.

### [P2] Filtered search can return empty/underfilled results due post-truncation filtering

- Impacted files:
  - `tooling/codebase-search/src/search/HybridSearch.ts:261`
  - `tooling/codebase-search/src/search/HybridSearch.ts:281`
  - `tooling/codebase-search/src/mcp/SearchCodebaseTool.ts:90`
- Failure mode:
  - `HybridSearch` applies `kind`/`package` only to vector search; BM25 runs unfiltered.
  - Fused results are truncated to `config.limit` before `SearchCodebaseTool` re-filters by `kind`/`package`.
  - Out-of-scope BM25 hits can consume the limited slots, then get removed post hoc, leaving too few or zero results despite valid matches existing below the truncation boundary.
- Recommended fix:
  - Enforce `kind`/`package` prior to final truncation (either filter BM25 candidates pre-fusion or over-fetch then post-filter before final `take`).
- Test needed:
  - Regression test with mixed-package fixtures where filtered-package matches rank below unfiltered BM25 top-N; assert filtered query still returns expected hits.

### [P2] BM25 incremental tombstones can starve active results under churn

- Impacted files:
  - `tooling/codebase-search/src/indexer/Bm25Writer.ts:283`
  - `tooling/codebase-search/src/indexer/Bm25Writer.ts:306`
- Failure mode:
  - `removeBySymbolIds` only removes ID mappings; docs remain in BM25 engine forever.
  - `search(query, limit)` may return stale docs in top-`limit`; these are dropped by mapping conversion, so active docs can be hidden.
  - Recall degrades as update churn increases.
- Recommended fix:
  - Implement over-fetch/backfill in `search` (retrieve >`limit` raw hits until `limit` mapped hits are produced), and/or periodic compact rebuild.
- Test needed:
  - High-churn test: add/remove many docs sharing tokens, then confirm active docs are still returned at requested `limit`.

### [P2] `INDEX_PATH` support is inconsistent across server, incremental state, and hooks

- Impacted files:
  - `tooling/codebase-search/src/bin.ts:29`
  - `tooling/codebase-search/src/extractor/FileScanner.ts:116`
  - `tooling/codebase-search/src/hooks/SessionStart.ts:47`
  - `tooling/codebase-search/src/hooks/PromptSubmit.ts:21`
- Failure mode:
  - MCP server storage can be moved via `INDEX_PATH`, but file-hash persistence for incremental scans is hardcoded to `.code-index/file-hashes.json` and hooks are hardcoded to `.code-index`.
  - Non-default `INDEX_PATH` can lead to MCP reading one index path while incremental/hook logic uses another.
- Recommended fix:
  - Thread `indexPath` into file-hash load/save and hook entry runtime (env/config), or remove `INDEX_PATH` configurability and document fixed path behavior.
- Test needed:
  - End-to-end config test with non-default index path validating full+incremental correctness plus both hooks reading the same index location.

## 3. Coverage and Testing Gaps

- No test covers `Pipeline.run` with `rootDir: "."` (default runtime path), which is where package identity currently breaks.
- No test validates `packageFilter` correctness for incremental/full reindex side effects on non-target packages.
- `HybridSearch`/`SearchCodebaseTool` tests do not stress filtered retrieval under mixed-package mixed-kind ranking pressure.
- `Bm25Writer` tests only exercise mock no-op save/load and do not exercise live persistence/churn behavior.
- No integration test validates non-default `INDEX_PATH` coherence across pipeline + hooks.

## 4. Runtime/Doc Alignment

- Confirmed passing gates:
  - `npx eslint --config eslint.config.mjs 'tooling/*/src/**/*.ts'` (warnings only)
  - `bunx turbo run docgen --filter=@beep/repo-cli --filter=@beep/codebase-search`
  - `tsc -b tooling/codebase-search/tsconfig.json`
  - `npx vitest run tooling/codebase-search/test`
- Hook smoke checks succeeded with built entrypoints:
  - `tooling/codebase-search/dist/hooks/session-start-entry.js`
  - `tooling/codebase-search/dist/hooks/prompt-submit-entry.js`
- Documentation issue remains: README default `CODEBASE_ROOT: "."` aligns with current examples but triggers the package-identity defect above.

## 5. Suggested Remediation Plan

1. Fix `rootDir` normalization and source-file relative path handling (`P1`).
2. Fix package-filter deletion/removal semantics in pipeline (`P1`).
3. Add regression tests for both `P1` issues before merge.
4. Fix filtered-search truncation semantics and add ranking-pressure test (`P2`).
5. Harden BM25 churn behavior and path configuration consistency (`P2`).
6. Re-run P6 verification harness after fixes and update closeout artifacts.
