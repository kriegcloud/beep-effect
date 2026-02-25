# Reflection Log

Cumulative learnings for the agent-reliability-effect-v4 spec.

---

## P0: Scaffolding + Contract Freeze (2026-02-25)

What worked:

1. Grounding the plan in existing repo assets avoided speculative architecture churn.
2. Locking an explicit benchmark protocol removed ambiguity for promotion decisions.
3. Treating `.repos/effect-smol` + Graphiti as strict truth sources simplified migration disputes.

What we learned:

1. Reliability gains require measurement-first governance, not instruction-volume increases.
2. Focused micro-skills (max 3) are easier to evaluate and tune than broad instruction fanout.
3. The existing scaffold is viable but must be refactored around Effect v4 service patterns.

Open questions:

1. Which 18 tasks should rotate first at the two-week mark?
2. What threshold should trigger strategic exception logs when promotion gates fail?
