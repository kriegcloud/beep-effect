# Freckle Whiteboard Ultra-Compact (One Screen)

1. Open: "Three layers: Enrichment, Sync Conflicts, Ontology Upgrade."
2. Goal: operator trust + predictable workflows + fast time-to-value.

3. Draw Flow 1: Source -> Normalize -> Resolve/Dedupe.
4. Draw: Waterfall -> Confidence -> Field Policy.
5. Draw: Transactional Write -> CRM Sync -> Trusted/Fresh Outcome.
6. Add rails: Retry(backoff), DLQ, Rollback, Telemetry.
7. Say: "Success = fresh trusted CRM data, not just 200 OK."

8. Draw Flow 2: Incoming Update -> Load Existing+Version -> Per-field conflict.
9. Inputs: source trust, confidence, recency, manual-lock.
10. Decision: apply / preserve / human review.
11. Concurrency: optimistic write; on version conflict re-read + idempotent re-eval.
12. Say: "Field-level conflict policy prevents clobbering high-trust values."

13. Draw Flow 3: Ontology cache/load -> ontology context.
14. Merge: provider candidates + ontology constraints -> typed facts.
15. Draw: graph assemble -> grounding/filter -> clustering/canonicalize.
16. Back to sync: policy -> transaction -> CRM -> explainable operator view.
17. Side lane: low-confidence -> human review.
18. Say: "Ontology is a quality layer, rolled out incrementally on high-impact paths."

19. Guardrails to name: idempotency, conflict-safe updates, transactional invariants, observability.
20. Reliability line: "Retry transient, DLQ permanent, fail soft with deterministic responses."

21. Metric option A: "Up to 40% travel-time reduction from workflow optimization."
22. Metric option B: "Mozilla Observatory A+ (115/100) external hardening signal."

23. Tradeoff: more modeling upfront, less downstream CRM drift/support burden.
24. Close: "I optimize for safe automation that operators can trust every day."
25. If cut short (20s): "Normalize -> score -> policy -> transaction -> idempotent sync -> telemetry; ontology adds precision + explainability."
