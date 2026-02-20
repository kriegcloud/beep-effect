# P5 Search Quality Report

Date: 2026-02-20
Harness: `.tmp-p5-runner-safe.mjs`
Raw results: `/tmp/p5-results-safe.json`

## Quality Target

- Aggregate precision target: `>= 70%` on 10 fixed queries.

## Fixed Query Set (10)

| # | Query | Expected relevant symbols (examples) |
|---|---|---|
| 1 | `create Account schema` | `PackageName`, `PackageJsonSchema`, other `schema` patterns |
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

All 10 queries failed before retrieval with the same error:
- `Failed to load embedding model: Could not locate file: "https://huggingface.co/nomic-ai/CodeRankEmbed/resolve/main/onnx/model.onnx".`

Measured attempt latencies ranged from `51.94ms` to `63.25ms`.

## Precision Calculation

- Evaluable queries: `0/10`
- Retrieved result sets: `0`
- Aggregate precision: **N/A** (no successful retrievals)
- Gate interpretation: **FAIL** (target `>=70%` not met; quality run blocked)

## Quality Verdict

**FAIL** — precision target cannot be evaluated because search execution is blocked by embedding model initialization.
