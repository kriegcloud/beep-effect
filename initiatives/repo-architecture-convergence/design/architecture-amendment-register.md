# Architecture Amendment Register Design Seed

## Purpose

This file is a design-time seed and reference only. It is not the live
architecture amendment register for the initiative.

The authoritative live register is
`../ops/architecture-amendment-register.md`. Use this document to name the
amendment classes the design surface anticipates, so the owning phase knows
what to promote into `ops/*` if canonical routing and governed compatibility
cannot resolve the problem.

If a problem can be solved by canonical routing, a temporary shim in
`../ops/compatibility-ledger.md`, or an already-permitted high-bar
shared-kernel package, it does not belong here.

## Design-Time Candidate Seeds

| Candidate | Default architecture outcome | Why it might be raised | Promotion rule |
|---|---|---|---|
| keep `infra` outside `packages/tooling/tool/infra` | route `infra` to `packages/tooling/tool/infra` | some teams may prefer a root-level operational home | promote only if a concrete blocker survives canonical routing |
| keep a permanent `packages/runtime/*` family | delete the family after `repo-memory` and `editor` cut over | legacy naming may feel convenient during migration | promote only if the architecture standard is amended to add a real runtime family |
| keep executable code in `agents/runtime-adapter/*` | move executable logic to `packages/tooling/tool/*`; keep runtime adapters declarative | `.agents`, `.aiassistant`, `.claude`, and `.codex` currently mix declarative and executable concerns | promote only if the architecture standard is amended to allow executable runtime adapters |
| keep permanent `shared/server` or `shared/tables` packages | move them to `drivers/*`, `foundation/*`, or delete them | legacy packages already exist and could be grandfathered silently | promote only if the architecture standard is amended to redefine the shared kernel |
| keep `.agents` or `.aiassistant` as canonical repo roots | split their contents into `agents/*` and `packages/tooling/tool/*`, then retire the roots as canonical homes | legacy discovery habits, vendored skill trees, or runtime convenience may tempt teams to preserve the roots | promote only if the architecture standard is amended to allow root-level agent families |

## Non-Candidates

The following do not belong in this register:

- a narrow `shared/use-cases` package for shared sidecar control-plane
  contracts, because the architecture standard already allows a high-bar
  `shared/use-cases` package
- temporary package aliases or wrapper entrypoints, because those belong in the
  live `ops/compatibility-ledger.md` instead

## Governance Rule

When a design-time candidate becomes real, the owning phase records and closes
it in `../ops/architecture-amendment-register.md`.

This file does not carry live candidate status.

Every promoted amendment candidate must close as one of:

1. `rejected`
2. `approved` with a matching edit to `standards/ARCHITECTURE.md`
3. `withdrawn`

Open candidates are not allowed to linger silently across cutover phases, but
that state is enforced only in the live `ops/*` register.
