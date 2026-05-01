---
name: effect-v4-http-ai
description: >
  Focused app-layer guidance for Effect v4 HTTP + AI tool paths.
  Use for chat/graph routes, tool handlers, and bounded retrieval packets.
version: 0.1.0
status: active
---

# Effect v4 HTTP + AI (Focused)

1. Route boundaries:
- Keep route layer thin.
- Delegate tool behavior to explicit handlers.
- Keep boundary decode/encode typed with `S.decodeUnknown*` / `S.encode*` (no raw `JSON.parse` / `JSON.stringify`).

2. Retrieval packets:
- Deduplicate facts.
- Enforce fact-count and character-budget caps.
- Keep transformations Effect-first (`A`, `O`, `R`, `S` aliases) and avoid native array method chains.

3. Grounding:
- Prefer concrete, source-backed facts over broad context dumps.
- Fail safe when retrieval is unavailable.
- Do not use Node core `fs/path`, `new Error`, `try/catch`, `throw`, nullable unions, type assertions, or non-null assertions in task implementations.
