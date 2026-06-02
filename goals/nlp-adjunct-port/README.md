# NLP Adjunct Port & MCP Toolkit Expansion

Status: **DONE** (see `ops/manifest.json`)

## What this is

The upstream half of the IP-law "AI stack": a product-neutral NLP capability
(`@beep/nlp`), its wink-nlp driver (`@beep/wink`), and an MCP server
(`@beep/nlp-mcp`) that exposes the NLP tool surface to agents over stdio. It hands
off a generic graph IR (`@beep/nlp/Handoff`) to the downstream
[`ip-law-knowledge-graph`](../ip-law-knowledge-graph) initiative, which owns the
ontology/KG and the generic→IP-law mapping. This packet does **not** build the KG,
the `law-practice` slice, or document ingestion.

## History

The faithful Effect-v4 port of [`adjunct`](https://github.com/mepuka/adjunct)
(categorical text-graph engine) landed earlier via **PR #199** (2026-05-30):
`@beep/nlp` carries the full categorical spine (Algebra/Graph/Ontology/Operations),
the `Handoff` IR, a 19-tool `NlpToolkit`, and property "proofs"; `@beep/wink`
implements the toolkit + backend; `@beep/nlp-mcp` shipped as a 5-tool stdio MVP.

## Current phase — MCP toolkit expansion

Bring the MCP server up to (and past) adjunct's tool surface:
- **P1 (done):** converge the driver onto the canonical 19-tool `NlpToolkit`
  (delete the duplicated hand-rolled MVP).
- **P2 (done):** add the 6 standalone parity tools adjunct had (→ 25-tool `NlpToolkit`).
- **P3 (done):** port the full 17-tool streaming/file-IO suite (`StreamingToolkit` +
  `Streaming/{TextStream,Jsonl,DatasetLoader,Pipeline}`), mounted as a second toolkit;
  18 integration tests over synthetic temp fixtures.
- **P4 (done):** registered in `.mcp.json` (`nlp` stdio server) and verified 42 tools
  live over stdio via a JSON-RPC `tools/list` probe; full quality gates + docgen +
  export-catalog refresh/check all green; docs + changeset.

The MCP server now exposes **42 tools** (25 NLP + 17 streaming). The upstream half of
the IP-law AI stack is complete; the generic graph IR (`@beep/nlp/Handoff`) is the
handoff to the downstream [`ip-law-knowledge-graph`](../ip-law-knowledge-graph) packet.

## Reading order

1. `SPEC.md` — scope, locked decisions, exit criteria.
2. `ops/manifest.json` — phase status.
3. `history/reflection-log.md` — decisions, surprises, and the latent bugs found.
4. Plan of record: `~/.claude/plans/wondrous-pondering-dragonfly.md`.

## Key packages

- `packages/foundation/capability/nlp` — `@beep/nlp` (product-neutral capability).
- `packages/drivers/wink` — `@beep/wink` (wink-nlp driver: backend + toolkit handlers).
- `packages/drivers/nlp-mcp` — `@beep/nlp-mcp` (stdio MCP server).
