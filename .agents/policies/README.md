# Adaptive Policy Overlays

Condition-aware overlays for benchmark packets and skill activation.

## Rules

- `core.json` is always active.
- Total active skills per run must be `<= 3`.
- Retrieval packets are bounded by `maxFacts` and `maxChars`.
- `adaptive_kg` may query Graphiti, all other conditions stay local-only.
