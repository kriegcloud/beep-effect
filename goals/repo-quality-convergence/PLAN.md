# Repo Quality Convergence Plan

## P0 - Evidence Packet

- Record baseline local quality state, current GitHub Check/Release state, and
  source paths for the two known blockers.
- Capture stale changeset package references and removed workspace config refs.
- Record the official tool docs that explain the external behavior being
  guarded: Changesets, GitHub Actions Release workflow behavior, and Turborepo
  affected lanes.

## P1 - Known Blockers

- Exclude generated docs output from TypeScript source-law traversals.
- Add `bun run beep quality changeset-graph` as a non-mutating release graph
  guard in `@beep/repo-cli`.
- Wire the guard into repo sanity and the Release workflow before
  `changesets/action`.
- Remove all stale changeset frontmatter entries that name packages outside the
  current workspace graph.
- Remove tracked root config references to removed workspaces.

## P2 - Guardrails And Tests

- Add focused tests for generated docs exclusion.
- Add focused tests for the changeset graph guard: valid packages pass, missing
  package names fail, and empty/no-op changesets remain valid.
- Keep speed work in `repo-quality-acceleration`; convergence records only the
  measured performance score and open performance risks.

## P3 - Proof And Review

- Run the local proof bundle:

  ```sh
  bun run beep lint schema-first
  bun run lint
  bun run check
  bun run repo-exports:catalog:check
  bun run audit:github repo-sanity
  bun run beep quality changeset-graph
  # run in a throwaway checkout/copy only; this command mutates package files
  bun run changeset:version
  ```

- Confirm fresh GitHub Check and Release evidence after the changes land.
- Run a changed-scope review over tooling, workflow, docs, tests, and initiative
  files.
- Update the scorecard and current-state evidence before closure.
