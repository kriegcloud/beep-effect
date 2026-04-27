# Repo Architecture Automation Plan

This plan executes [SPEC.md](./SPEC.md). It intentionally starts with repo
economics and fixture proof before generator code.

## A. Preserve And Branch

- Create `archive/pre-repo-architecture-automation-2026-04-27` from clean
  committed `main` HEAD.
- Create `chore/repo-architecture-automation` from the same commit.
- Record the archive branch in the initiative manifest.

## B. Retire The Old Active Topology

- Delete the legacy app, package, shared, runtime, repo-memory, and editor
  surfaces named in the spec.
- Delete the superseded memory and convergence initiative packets after
  extracting the digest.
- Update root workspace, syncpack, TypeScript, Turbo, scratchpad, docgen,
  standards inventory, allowlist, package identity, agent guidance, initiative
  index, and docs references that point at deleted live surfaces.

## C. Prove The Golden Slice

- Keep the `fixture-lab/Specimen` registry under CLI test fixtures.
- Promote the checked output into private live workspaces under
  `packages/fixture-lab/specimen/*` so normal repo quality gates exercise it.
- Shape the fixture as the `entities/Specimen` exemplar from
  `standards/ARCHITECTURE.md`, including role-suffix files and explicit
  package boundary exports.
- Add a lightweight test that keeps the fixture contract from silently losing a
  required role or surface.

## D. Prepare Generator Extraction

- Keep implementation direction in the initiative design docs.
- Do not build the generator until the fixture is accepted.
- When implementation starts, add registry parsing, plan rendering, writer
  selection, fixture reproduction, and idempotency tests in that order.

## Required Checks

Run these as the branch becomes coherent:

- `bun run config-sync:check`
- targeted CLI fixture test
- deleted-surface search audits
- package graph check
- `bun run check`
- `bun run lint`
- `bun run test`
- `bun run docgen`
- `bun run audit:full`

If a full gate is blocked by unrelated pre-existing repo state, record the
exact command, failure, and remaining follow-up before handoff.
