# Review Surface

This directory contains the initiative's two review namespaces:

- `loop*-*.md`: initiative-wide critique history and cross-phase evidence
- `pX-critique.md`, `pX-remediation.md`, and `pX-rereview.md`: phase-scoped
  execution review loop required by `ops/*`

## Required Loop

1. `Phase Execution Review`
   - add or update the active phase critique in `pX-critique.md`
   - track required fixes in `pX-remediation.md`
   - record the final gate decision in `pX-rereview.md`
2. `Initiative-Wide Critique`
   - add `loopN-<topic>.md` critiques when the finding spans multiple phases,
     packet surfaces, or control-plane assumptions
   - update `loopN-remediation-register.md` and `loopN-rereview-gate.md` when
     those broader findings are being worked
3. `Closure`
   - phase closure is blocked until the active `pX-remediation.md` and
     `pX-rereview.md` are populated
   - packet-level closure is also blocked by any still-open loop-wide finding
     that has not been explicitly cleared or held

## Naming Contract

- phase-scoped review loop:
  - `pX-critique.md`
  - `pX-remediation.md`
  - `pX-rereview.md`
- initiative-wide review loop:
  - `loopN-<topic>.md`
  - `loopN-remediation-register.md`
  - `loopN-rereview-gate.md`

The canonical review namespace is now dual, not exclusive. Do not use
`loop*-*.md` files as a substitute for missing `pX-*` phase review artifacts,
and do not treat `pX-*` files as a replacement for broader loop-wide critique
history.

## Severity Contract

- Use `Critical`, `High`, `Medium`, and `Low` as the only review severity
  headings in this directory.
- `Critical` and `High` findings are blocking by default.
- `Medium` and `Low` findings remain actionable, but they do not block closure
  unless the active loop register or re-review gate says they are held as
  blockers.

## Phase Review Index

Phase-scoped execution review files exist for `P0` through `P7` alongside this
README. Use the set that matches the active handoff and evidence pack named in
`ops/manifest.json`.

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
- Phase outputs must cite the phase review inputs they addressed, plus any
  loop-wide critique artifacts that still governed the batch.
- Re-review must check the updated history surfaces, not only the author's
  summary.
