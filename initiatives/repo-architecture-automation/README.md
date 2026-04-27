# Repo Architecture Automation

## Status

Active

## Mission

This initiative replaces `repo-architecture-convergence` as the active repo
architecture program. The migration posture changes from "move the old world
into the target shape" to "archive the old world, reduce the active checkout to
a lean slate, prove the target topology with a golden fixture, then generate
future slices from a registry-backed `beep` topology factory."

The full pre-automation repo remains recoverable from:

- `archive/pre-repo-architecture-automation-2026-04-27`

Active destructive work happens only on:

- `chore/repo-architecture-automation`

## Current Contract

- `main` is preserved by the archive branch before deletion work begins.
- The feature branch removes the active legacy topology instead of carrying it
  as migration scaffolding.
- The old convergence packet is reduced to a digest in this initiative.
- The first proof target is the checked synthetic golden fixture
  `fixture-lab/Specimen`.
- `standards/ARCHITECTURE.md` is binding for the fixture topology and export
  boundaries.
- Generator implementation stays repo-owned in `tooling/cli` and delegates from
  `bun run beep ...`; `@turbo/gen` can become a later wrapper only.

## Reading Order

- [SPEC.md](./SPEC.md) - binding contract and acceptance rules
- [PLAN.md](./PLAN.md) - ordered rollout and verification
- [design/generator-direction.md](./design/generator-direction.md) - CLI and
  writer strategy
- [design/golden-slice-contract.md](./design/golden-slice-contract.md) - fixture
  shape and graduation rule
- [design/prior-convergence-digest.md](./design/prior-convergence-digest.md) -
  compact archive of the replaced packet
- [ops/manifest.json](./ops/manifest.json) - machine-readable routing,
  deletion, and gate catalog

## Active Golden Fixture

The checked fixture registry root is:

`tooling/cli/test/fixtures/repo-architecture-automation`

It contains the registry input for `fixture-lab/Specimen`. The corresponding
golden output is temporarily promoted into live private workspaces under:

`packages/fixture-lab/specimen/*`

These packages are not product roadmap packages and must not be imported by
product code.
