# @beep/nlp-mcp Agent Guide

## Purpose & Fit
- Model Context Protocol server exposing ~42 tools over stdio by mounting two
  toolkits into one server:
  - the product-neutral `@beep/nlp-processing/Tools/NlpToolkit` (25 tools) bound to its
    wink-backed handler layer (`WinkNlpToolkitLive` from `@beep/wink`); the driver
    does not redeclare these tools, schemas, or handlers; and
  - a driver-local `StreamingToolkit` (17 file/JSONL/dataset/pipeline tools) backed
    by `StreamingToolkitHandlersLive`, which uses `effect/FileSystem` + `effect/Path`
    (+ `HttpClient` for URL loads), provided at the entrypoint.
- Streaming handlers annotate spans with counts, `path_length`, and `size_bytes`
  only — never raw file content or line/record text. Integration tests use synthetic
  temp fixtures only.

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | `VERSION` | package entry point |
| server | `makeServerLayer`, `NlpMcpServerConfig` | stdio MCP server layer mounting both toolkits; requires `FileSystem \| HttpClient \| Path \| Stdio` |
| streaming tools | `StreamingToolkit`, `LinesOutput`/`FileInfoOutput`/`TextStatsOutput`/`JsonlOutput`/`JsonlStatsOutput`/`DatasetMetaOutput`/`DataOutput`/`PipelineOutput` | 17 `Tool.make` defs + `S.Struct` output schemas; `failureMode: "return"` with `AiToolError` |
| streaming handlers | `StreamingToolkitHandlersLive` | `Tool.HandlersFor<StreamingToolkit.tools>`; requires `FileSystem \| HttpClient \| Path` |
| streaming helpers | `Streaming/{TextStream,Jsonl,DatasetLoader,Pipeline}` | line/JSONL/dataset/pipeline helpers over `effect/Stream` + `effect/FileSystem` |
| bin | `bin.ts` | stdio entrypoint; provides `NodeStdio` + `NodeFileSystem` + `NodePath` + `FetchHttpClient` and launches the server |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/nlp-mcp` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { VERSION } from "@beep/nlp-mcp"
```

## Verifications
- `bunx turbo run test --filter=@beep/nlp-mcp`
- `bunx turbo run test:integration --filter=@beep/nlp-mcp`
- `bunx turbo run lint --filter=@beep/nlp-mcp`
- `bunx turbo run check --filter=@beep/nlp-mcp`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
