# Review Surface

This directory is the canonical adversarial review surface for
`repo-architecture-convergence`.

## Required Loop

1. `Review`
   - add one or more `loopN-<topic>.md` critiques with evidence, verdict, and
     required remediations
2. `Remediation`
   - update `loopN-remediation-register.md` with every blocking finding, the
     remediation surface, status, and evidence links
3. `Re-review`
   - update `loopN-rereview-gate.md` after the remediation lands

Packet or phase closure is blocked until the active loop has both a populated
remediation register and a re-review decision.

## Naming Contract

- `loopN-<topic>.md`
- `loopN-remediation-register.md`
- `loopN-rereview-gate.md`

Inside `history/reviews/`, the canonical namespace is loop-scoped, not
phase-scoped. Do not create `pX-*` review files here. Phase outputs should
reference the active loop register and re-review gate for the packet.

## Severity Contract

- Use `Critical`, `High`, `Medium`, and `Low` as the only review severity
  headings in this directory.
- `Critical` and `High` findings are blocking by default.
- `Medium` and `Low` findings remain actionable, but they do not block closure
  unless the active loop register or re-review gate says they are held as
  blockers.

## Loop 1 Index

- [loop1-architecture-alignment.md](./loop1-architecture-alignment.md)
- [loop1-canonical-pattern-and-ops.md](./loop1-canonical-pattern-and-ops.md)
- [loop1-phases-gates-and-process.md](./loop1-phases-gates-and-process.md)
- [loop1-repo-law-and-enforcement.md](./loop1-repo-law-and-enforcement.md)
- [loop1-repo-reality-and-routing.md](./loop1-repo-reality-and-routing.md)
- [loop1-remediation-register.md](./loop1-remediation-register.md)
- [loop1-rereview-gate.md](./loop1-rereview-gate.md)

## Loop 2 Index

- [loop2-architecture-and-repo-law.md](./loop2-architecture-and-repo-law.md)
- [loop2-canonical-ops-and-prompts.md](./loop2-canonical-ops-and-prompts.md)
- [loop2-phases-gates-and-evidence.md](./loop2-phases-gates-and-evidence.md)
- [loop2-repo-reality-and-routing.md](./loop2-repo-reality-and-routing.md)
- [loop2-remediation-register.md](./loop2-remediation-register.md)
- [loop2-rereview-gate.md](./loop2-rereview-gate.md)

## Gate Rules

- `Critical` and `High` findings remain blocking until the remediation register
  says they are closed or explicitly held with owner, rationale, and next gate.
- Phase outputs must cite the review inputs they addressed and the evidence they
  produced.
- Re-review must check the updated history surfaces, not only the author's
  summary.
