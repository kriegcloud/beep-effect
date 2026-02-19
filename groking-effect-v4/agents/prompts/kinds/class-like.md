Kind guidance: Class export

Primary example goals:
- Show class/constructor discovery.
- Show one construction or static-usage example.
- If class summary indicates key-marker semantics (e.g., `ServiceMap` key), include one domain-semantic round-trip example.

Design heuristics:
- Avoid assuming zero-arg constructor exists.
- Use reflective checks when constructor shape is uncertain.
- If construction is unsafe, document why and pivot to static/member inspection.
- Prefer deterministic examples that teach intended usage over opaque constructor success/failure logs.
- Constructor probe alone is insufficient for semantic-key exports; include at least one summary-aligned domain workflow example.
- Trigger phrase heuristic: if summary includes terms like `ServiceMap key`, `annotation`, or `reference`, prioritize round-trip usage examples.
