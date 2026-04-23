# Architecture Amendment Register

## Purpose

Track every proposal to preserve a non-canonical topology exception.

If a problem can be solved by canonical routing, a temporary shim in the
compatibility ledger, or an already-permitted high-bar shared-kernel package,
it does not belong here.

## Current Candidates

| Candidate | Default architecture outcome | Why it might be raised | Resolution rule | Status |
|---|---|---|---|---|
| keep `infra` outside `packages/tooling/tool/infra` | route `infra` to `packages/tooling/tool/infra` | some teams may prefer a root-level operational home | either move it canonically or amend `standards/ARCHITECTURE.md` explicitly | open only if a concrete blocker appears |
| keep a permanent `packages/runtime/*` family | delete the family after `repo-memory` and `editor` cut over | legacy naming may feel convenient during migration | reject unless the architecture standard is amended to add a real runtime family | rejected by default |
| keep executable code in `agents/runtime-adapter/*` | move executable logic to `packages/tooling/tool/*`; keep runtime adapters declarative | `.claude` and `.codex` currently mix both concerns | reject unless the architecture standard is amended to allow executable runtime adapters | rejected by default |
| keep permanent `shared/server` or `shared/tables` packages | move them to `drivers/*`, `foundation/*`, or delete them | legacy packages already exist and could be grandfathered silently | reject unless the architecture standard is amended to redefine the shared kernel | rejected by default |

## Non-Candidates

The following do not belong in this register:

- a narrow `shared/use-cases` package for shared sidecar control-plane
  contracts, because the architecture standard already allows a high-bar
  `shared/use-cases` package
- temporary package aliases or wrapper entrypoints, because those belong in the
  compatibility ledger instead

## Governance Rule

Every amendment candidate must close as one of:

1. `rejected`
2. `approved` with a matching edit to `standards/ARCHITECTURE.md`
3. `withdrawn`

Open candidates are not allowed to linger silently across cutover phases.
