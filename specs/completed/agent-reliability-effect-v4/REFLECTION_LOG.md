# Reflection Log

Cumulative learnings for the agent-reliability-effect-v4 spec.

---

## P0: Scaffolding + Contract Freeze (2026-02-25)

What worked:

1. Grounding the plan in existing repo assets avoided speculative architecture churn.
2. Locking an explicit benchmark protocol removed ambiguity for promotion decisions.
3. Treating `.repos/effect-v4` + Graphiti as strict truth sources simplified migration disputes.

What we learned:

1. Reliability gains require measurement-first governance, not instruction-volume increases.
2. Focused micro-skills (max 3) are easier to evaluate and tune than broad instruction fanout.
3. The existing scaffold is viable but must be refactored around Effect v4 service patterns.

Open questions:

1. Which 18 tasks should rotate first at the two-week mark?
2. What threshold should trigger strategic exception logs when promotion gates fail?

---

## P6 Closure + P7 Handoff Readiness (2026-02-28)

What worked:

1. Benchmark + detector + ingestion infrastructure produced reproducible artifacts and clear failure signatures.
2. Promotion lock prevented unsafe rollout despite pressure to move quickly.
3. Playbook formalization made ongoing operations explicit and repeatable.

What we learned:

1. Runtime timeout behavior can dominate reliability outcomes even when policy/detector wiring is correct.
2. Comparable matrix assumptions must be enforced early or scorecard conclusions degrade.
3. A spec can close with a no-go promotion result if deliverables and operational guardrails are complete.

Open questions:

1. Which timeout/root-cause fixes should be prioritized to restore live comparability?
2. Should next-cycle experiments narrow task complexity or increase per-task run budget first?
