# Required Outputs

Every phase owns a bundle of artifacts, not a single phase write-up.

## Required For Every Phase

1. One evidence pack under `history/outputs/`.
2. One critique artifact under `history/reviews/`.
3. One remediation artifact under `history/reviews/`.
4. One re-review artifact under `history/reviews/`.
5. A manifest update that records artifact state, evidence status, blockers,
   and next action.

## Phase-Owned Durable Artifacts

- `P0`: `history/outputs/p0-consumer-importer-census.md`
- `P1`: `ops/compatibility-ledger.md`
- `P1`: `ops/architecture-amendment-register.md`
- `P7`: `history/outputs/p7-architecture-compliance-matrix.md`
- `P7`: `history/outputs/p7-repo-law-compliance-matrix.md`

## Bundle Rules

- The evidence pack must summarize landed repo changes plus proof.
- Durable artifacts must carry the canonical data the later phases depend on.
- Later phases do not close on packet authoring. They close only when repo
  changes, command gates, search audits, and review-loop proof all exist.
- If a required durable artifact is missing, the phase is blocked.
