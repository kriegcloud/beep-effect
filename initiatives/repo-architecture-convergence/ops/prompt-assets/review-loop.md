# Review Loop

Every phase uses the same three-step review loop across the whole artifact
bundle:

1. `critique`
   - Inspect the evidence pack, phase-owned durable artifacts, ledger deltas,
     commands, and search audits.
   - Record findings with severity and taxonomy-backed blockers where
     applicable.
2. `remediation`
   - Land the missing repo changes or fix the control-plane artifact drift.
   - Map every finding to a disposition: fixed, blocked, or escalated.
3. `re-review`
   - Re-check the remediated artifact bundle.
   - Decide whether the phase is `cleared`, `partially cleared`, or `blocked`.

## Review Namespace Rules

- `history/reviews/loop*-*.md` is the initiative-wide critique namespace.
- `history/reviews/pX-critique.md`, `pX-remediation.md`, and `pX-rereview.md`
  are per-phase review-loop artifacts.

## Closure Rules

- Any blocking finding prevents phase completion.
- A phase is complete only after re-review clears the artifact bundle and the
  required evidence is fresh.
