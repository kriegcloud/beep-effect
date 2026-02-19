Kind guidance: Function export

Primary example goals:
- Show discovery/introspection first.
- Show one invocation-oriented example.
- If required arity is known (`fn.length > 0` or docs show required inputs), use documented invocation as primary runtime example.
- Include one boundary or contrast case when docs show two outcomes (for example non-empty vs empty input).
- If source example exists, at least one invocation must mirror source inputs or equivalent values.

Design heuristics:
- Prefer zero-arg probe only when safe and semantically representative.
- Do not use zero-arg probing as primary invocation for required-arity functions.
- Include expected success and expected failure pathways when useful.
- Explain why an invocation might fail without implying the export is broken.
