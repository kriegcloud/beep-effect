# Rubrics

## Reliability Rubric (Primary)

Score each phase 0-2 per dimension.

1. **Correctness**: outputs match declared contract and interfaces.
2. **Safety**: no regressions in check/lint/test/docgen gates.
3. **Effect v4 fidelity**: no v3 API leakage in code or prompts.
4. **Measurement rigor**: A/B protocol followed exactly.
5. **Operational clarity**: handoffs and prompts are reproducible.

Pass threshold: total >= 8/10 and no zero in Correctness or Safety.

## Benchmark Promotion Rubric

A change is promotable only if:

1. Aggregate success rate increases, or
2. Wrong-API incidents decrease,

and

3. No regression in safety checks (`check`, `lint`, `test`, `docgen`).

If neither (1) nor (2) holds, require strategic exception with written rationale.

## KG Loop Rubric

1. Failed run emits typed episode.
2. Next run retrieves relevant correction fact.
3. Retrieved packet remains within count/char caps.
4. Retrieved fact is attributable to local truth source.
