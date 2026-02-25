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

2. Retrieval packets:
- Deduplicate facts.
- Enforce fact-count and character-budget caps.

3. Grounding:
- Prefer concrete, source-backed facts over broad context dumps.
- Fail safe when retrieval is unavailable.
