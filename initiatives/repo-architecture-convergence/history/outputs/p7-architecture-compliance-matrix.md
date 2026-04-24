# P7 Architecture Compliance Matrix

## Artifact Status

Scaffolded - execution not started

## Role In Phase Model

This is a required companion artifact for
[p7-final-architecture-and-repo-law-verification.md](./p7-final-architecture-and-repo-law-verification.md).
P7 is not complete until this matrix and the repo-law matrix are both updated
from executed repo evidence.

Before scoring any row in this matrix, immediately reread
`../../standards/ARCHITECTURE.md`,
`../../standards/effect-laws-v1.md`,
`../../standards/effect-first-development.md`,
`../../ops/compatibility-ledger.md`, and
`../../ops/architecture-amendment-register.md`. Any status entered before that
same-batch reread is stale and cannot support closure.

## Matrix

| Architecture proof area | Required evidence | Command or search audit | Status | Notes |
| --- | --- | --- | --- | --- |
| Canonical route canon matches live package and app placement | Pending execution | Pending execution | Scaffolded | Verify the final route map against landed repo state. |
| Shared-kernel and slice boundaries match the converged architecture | Pending execution | Pending execution | Scaffolded | Confirm extraction, ownership, and boundary rules. |
| Legacy roots and duplicate architecture surfaces are removed or governed | Pending execution | Pending execution | Scaffolded | Cite deletions or live ledger entries for approved temporary holds. |
| Consumer imports point at canonical destinations and export surfaces | Pending execution | Pending execution | Scaffolded | Include importer rewrites and residual search-audit checks. |
| Compatibility bridges are deleted or explicitly ledgered with exit path | Pending execution | Pending execution | Scaffolded | Cross-check `../../ops/compatibility-ledger.md` before closure. |
| Final architecture signoff is reproducible from history evidence | Pending execution | Pending execution | Scaffolded | Ensure reviewers can replay the proof from cited artifacts. |

## Exceptions And Holds

- Pending execution. Record any approved temporary architecture hold with the
  governing `ops/*` ledger entry and target deletion phase.
