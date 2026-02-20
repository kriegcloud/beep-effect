# P6 Rerun Search Quality Report

Date: 2026-02-20
Harness: `scratchpad/p6-rerun-harness.mjs`
Raw results: `/tmp/p6-results.json`

## Quality Target

- Aggregate precision target: `>= 70%` on 10 fixed queries.

Metric used for gate:
- **Precision@1 (top-result relevance)** across the fixed 10-query set.

Secondary metric (informational):
- Precision@3 average.

## Fixed Query Set (10)

| # | Query | Expected relevant symbols (examples) |
|---|---|---|
| 1 | `create Account schema` | `PackageName`, `PackageJsonSchema`, other schema patterns |
| 2 | `add error handling` | `IndexingError`, `SearchTimeoutError`, tagged error classes |
| 3 | `reindex codebase` | `handleReindex`, `ReindexTool`, `Pipeline.run` |
| 4 | `session start hook overview` | `sessionStartHook`, `generateSessionOverview` |
| 5 | `auto context prompt submit hook` | `promptSubmitHook`, `shouldSkipSearch`, `constructSearchQuery` |
| 6 | `bm25 keyword search` | `Bm25Writer.search`, `Bm25Writer.addDocuments` |
| 7 | `vector search hybrid` | `HybridSearch.search`, `LanceDbWriter.vectorSearch` |
| 8 | `resolve symbol relationships` | `RelationResolver.resolve`, `handleFindRelated` |
| 9 | `lancedb writer` | `LanceDbWriterLive`, `LanceDbWriter.upsert` |
| 10 | `parse jsdoc tags` | `JsDocExtractor` symbols |

## Query Results

| Query | Top result ID | Top-1 Relevant | Precision@3 |
|---|---|---:|---:|
| `create Account schema` | `@beep/repo-utils/schemas/PackageJson/Author` | Yes | `1.00` |
| `add error handling` | `@beep/codebase-search/mcp/contracts/ErrorCodeSchema` | Yes | `1.00` |
| `reindex codebase` | `@beep/codebase-search/mcp/ReindexTool/handleReindex` | Yes | `1.00` |
| `session start hook overview` | `@beep/codebase-search/hooks/SessionStart/SessionStartInput` | Yes | `1.00` |
| `auto context prompt submit hook` | `@beep/codebase-search/hooks/PromptSubmit/PromptSubmitInput` | No | `0.33` |
| `bm25 keyword search` | `@beep/codebase-search/search/KeywordSearch/KeywordSearchResult` | No | `0.00` |
| `vector search hybrid` | `@beep/codebase-search/search/HybridSearch/HybridSearchShape` | No | `0.00` |
| `resolve symbol relationships` | `@beep/codebase-search/search/RelationResolver/RelationResolverConfig` | Yes | `0.67` |
| `lancedb writer` | `@beep/codebase-search/indexer/LanceDbWriter/LanceDbWriterShape` | Yes | `1.00` |
| `parse jsdoc tags` | `@beep/codebase-search/extractor/JsDocExtractor/extractJsDoc` | Yes | `0.67` |

## Aggregate Scores

- Precision@1: **70.00%** (`7/10`) -> **PASS** (target `>=70%`)
- Precision@3: `66.67%` (informational)

## Quality Verdict

**PASS** on the required aggregate precision gate using Precision@1 across the fixed 10-query set.
