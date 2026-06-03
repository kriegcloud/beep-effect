---
---

Expand `@beep/nlp-mcp` to expose the full NLP tool surface over stdio. The driver now
mounts the canonical `@beep/nlp` `NlpToolkit` (25 tools — including 6 new adjunct-parity
tools `Paragraphize`/`Stem`/`RemoveStopWords`/`WordCount`/`BagOfWords`/`Analyze` in
`@beep/nlp` with handlers in `@beep/wink`) and a new 17-tool streaming/file-IO
`StreamingToolkit` (file, JSONL, dataset, and line-transform pipeline tools) backed by
`effect/FileSystem`/`effect/Path`/`HttpClient`. The hand-rolled 5-tool MVP and its
duplicate schemas were removed. ~42 MCP tools total, registered in `.mcp.json` as the
`nlp` stdio server. No publishable release (private packages).
