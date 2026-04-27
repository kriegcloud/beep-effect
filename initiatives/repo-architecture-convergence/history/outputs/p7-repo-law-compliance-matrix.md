# P7 Repo-Law Compliance Matrix

## Artifact Status

Scaffolded - execution not started

## Role In Phase Model

This is a required companion artifact for
[p7-final-architecture-and-repo-law-verification.md](./p7-final-architecture-and-repo-law-verification.md).
P7 is not complete until this matrix and the architecture matrix are both
updated from executed repo evidence.

Before scoring any row in this matrix, immediately reread
`../../standards/ARCHITECTURE.md`,
`../../standards/effect-laws-v1.md`,
`../../standards/effect-first-development.md`,
`../../ops/compatibility-ledger.md`, and
`../../ops/architecture-amendment-register.md`. Any status entered before that
same-batch reread is stale and cannot support closure.

## Matrix

| Repo-law proof area | Required evidence | Command or search audit | Status | Notes |
| --- | --- | --- | --- | --- |
| Schema-first and domain-model requirements | Pending execution | Pending execution | Scaffolded | Cite the migrated surfaces and the checks that prove schema-first compliance. |
| Effect-first service and boundary rules | Pending execution | Pending execution | Scaffolded | Capture the service-boundary proof relevant to moved code. |
| Typed errors, tagged unions, and decode boundaries | Pending execution | Pending execution | Scaffolded | Record the enforcement evidence used in the final review. |
| Documentation, annotations, and docgen obligations | Pending execution | Pending execution | Scaffolded | Include docgen-proof and any annotation-specific audits. |
| Temporary exceptions are closed or governed through the live ledgers | Pending execution | Pending execution | Scaffolded | Cross-check `../../ops/compatibility-ledger.md` and `../../ops/architecture-amendment-register.md` before final signoff. |
| Final repo-law signoff is reproducible from history evidence | Pending execution | Pending execution | Scaffolded | Ensure reviewers can replay the proof from cited artifacts. |

## Exceptions And Holds

- Pending execution. Record any approved repo-law hold with the governing
  `ops/*` ledger entry, owner, and next gate.
