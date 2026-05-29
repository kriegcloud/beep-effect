# P4 — Streaming MCP tools: deferral note

**Status:** deferred (documented gap, not a regression).
**Date:** 2026-05-29.
**Owner decision:** land the core MCP server now; defer the streaming/dataset
subsystem to a follow-up driver commit.

## What landed in P4

`packages/drivers/nlp-mcp` — an `effect/unstable/ai` MCP server (stdio transport)
that re-exposes the `@beep/nlp` `NLPBackend` catalog as five schema-validated MCP
tools:

| MCP tool | Backend op | Output schema |
|---|---|---|
| `nlp_sentencize` | `NLPBackend.sentencize` | `TextArrayOutput` |
| `nlp_tokenize`   | `NLPBackend.tokenize`   | `TextArrayOutput` |
| `nlp_pos_tag`    | `NLPBackend.posTag`     | `POSOutput` |
| `nlp_lemmatize`  | `NLPBackend.lemmatize`  | `LemmaOutput` |
| `nlp_entities`   | `NLPBackend.extractEntities` | `EntityOutput` |

Modules: `Schemas.ts` (flat MCP I/O + `NlpToolError`), `Tools.ts`
(`Tool.make` + `NlpToolkit`), `Server.ts` (handlers over `WinkBackend`/`WinkEngine`,
`McpServer.toolkit` + `McpServer.layerStdio` with `NodeStream.stdin`/`NodeSink.stdout`),
`bin.ts` (stdio entrypoint), `test/Server.test.ts` (handlers exercised against wink-nlp).
`pkg:verify @beep/nlp-mcp` green (lint/check/test/lint:circular).

This satisfies the P4 exit criterion: *"server starts; tools callable +
schema-validated."*

## What is deferred

The adjunct `src/Mcp/Streaming/*` subsystem (~4.5k LOC across
`TextStream` / `Jsonl` / `DatasetLoader` / `Cache` / `Pipeline` + the 17 streaming
tools and their handlers). These are **batch/dataset I/O conveniences** — NDJSON
ingest, on-disk dataset loaders, a result cache, and a streaming pipeline — layered
on top of the same `@beep/nlp` operations the core tools already expose.

## Why deferring is sound

1. **No loss of categorical fidelity.** The categorical structure of the port
   (monoids + laws, F-algebra cata/ana, free⊣forgetful & query⊣index adjunctions,
   the operation Kleisli category, proofs-as-law-tests) lives in `@beep/nlp` and
   landed in P1–P3. The streaming MCP tools are transport/batch wrappers, not
   theory — deferring them leaves the algebra intact.
2. **The core deliverable is complete.** An MCP client can call every NLP operation
   today; streaming only adds bulk-throughput ergonomics over the same ops.
3. **It is genuinely large and I/O-heavy.** Porting it requires
   `effect/unstable/encoding/Ndjson` + `@effect/platform-node` `FileSystem`/`Path`
   wiring and its own property tests; bundling it into this commit risked landing
   red, which the goal's discipline forbids.

## How to pick it up (follow-up commit)

Port `adjunct/src/Mcp/Streaming/*` into `packages/drivers/nlp-mcp/src/Streaming/`:

- `TextStream` → `Stream<string>` line readers built on `NodeStream`.
- `Jsonl` → `effect/unstable/encoding/Ndjson` encode/decode (replaces adjunct's
  hand-rolled JSONL; v4 ships `Ndjson`).
- `DatasetLoader` → `@beep/nlp` operations over `FileSystem` (`@effect/platform-node`
  `NodeFileSystem`/`NodePath`), product-neutral (no IP-law vocabulary).
- `Cache` → `effect` `Cache`/`ScopedCache` over operation results keyed by input hash
  (use `Clock` for TTL, not `Date.now`).
- `Pipeline` → compose the above through the `@beep/nlp` `Operations` Kleisli
  combinators; expose as additional `Tool.make` entries added to `NlpToolkit`.

Add proofs (`effect/testing/FastCheck`) for chunk↔reassemble round-trips and
NDJSON encode/decode round-trips. Land as a second green
`feat(nlp-mcp): streaming/dataset tools (P4)` commit. Wildcard exports
(`./*` → `./src/*.ts`) mean new files need no manual `package.json` export entries.
