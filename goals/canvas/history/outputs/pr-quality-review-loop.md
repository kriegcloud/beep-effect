# PR Quality Review Loop

Date: 2026-05-22

## Scope

This closure loop covers the `canvas` P1/P2 PR surface:

- `apps/canvas` Tauri 2 + React shell, command bridge, tests, package metadata,
  and generated config.
- `packages/canvas/*` generated documentation and export catalog effects from
  the bootstrap surface.
- `goals/canvas` initiative docs, closure evidence, and ops manifest.
- Repo quality plumbing touched by the branch: `bun.lock`, root `tsconfig.json`,
  `standards/repo-exports.catalog.*`, `.changeset/canvas-bootstrap-closure.md`,
  and `osv-scanner.toml`.

`flake.nix` is intentionally excluded from this review loop because it was
already dirty and unrelated to the canvas closure work.

## Review And Fix Log

### Baseline Failure: Generated Config Drift

- `status`: fixed
- `evidence`: the first full `bun run audit:github quality` run reported
  generated config/docgen drift after the canvas app package changed.
- `fix`: ran `bun run config-sync`, which updated `apps/canvas/docgen.json`,
  `apps/canvas/tsconfig.json`, and root `tsconfig.json`.
- `acceptance`: `bun run config-sync -- --check` passed with no drift.

### Baseline Failure: Missing OSV Scanner Config

- `status`: fixed
- `evidence`: repo sanity failed because the GitHub/local audit lane passed
  `--config=osv-scanner.toml`, but the file was missing from the checkout.
- `fix`: added a root `osv-scanner.toml` with no ignored vulnerability ids.
  This matches OSV Scanner's documented config-file lane while keeping the
  default policy strict.
- `acceptance`: `bun run beep quality bun-audit` and `bun run audit:github
  repo-sanity` passed; the final full `bun run audit:github quality` passed.

### User Review Finding: Command Domain Modeling

- `status`: fixed
- `evidence`: `apps/canvas/src/commandBridge.ts` modeled the native command
  name schema as an explicit literal union instead of using the repo's canonical
  literal-domain helper.
- `fix`: changed `CanvasCommandName` and `CanvasHealthStatus` to `LiteralKit`
  schemas with annotations.
- `acceptance`: `bun run beep lint schema-first`, `cd apps/canvas && bun run
  check`, and `cd apps/canvas && bun run test` passed.

### User Review Finding: Runtime Boundary Placement

- `status`: fixed
- `evidence`: the command bridge previously owned promise execution details
  instead of returning Effect values to the app boundary.
- `fix`: made the command bridge Effect-returning, lifted Tauri `invoke` with
  `Effect.tryPromise`, and moved `ManagedRuntime` ownership to the React app and
  tests.
- `acceptance`: `cd apps/canvas && bun run lint`, `cd apps/canvas && bun run
  check`, `cd apps/canvas && bun run test`, `bun run beep laws effect-imports
  --check`, and the final full `bun run audit:github quality` passed.

### Baseline Failure: Changeset Status

- `status`: fixed
- `evidence`: `changeset status --since=origin/main` failed because the branch
  changed package surfaces without a tracked changeset.
- `fix`: added `.changeset/canvas-bootstrap-closure.md` as an empty internal
  changeset so no package release bump is forced by this app/spec branch.
- `acceptance`: `bun run changeset:status:since-main` and the final full
  `bun run audit:github quality` passed.

## Final Verification

Focused app gates:

- `cd apps/canvas && bun run lint`
- `cd apps/canvas && bun run check`
- `cd apps/canvas && bun run test`
- `cd apps/canvas && bun run build`

Focused repo policy gates:

- `bun run beep lint schema-first`
- `bun run beep laws effect-imports --check`
- `bun run beep docgen check`
- `bun run config-sync -- --check`
- `bun run beep quality repo-exports-catalog --check`
- `bun run changeset:status:since-main`

Native Tauri gates:

- `cd apps/canvas/src-tauri && cargo check`
- `cd apps/canvas/src-tauri && cargo test`

Full closure gate:

- `bun run audit:github quality`

Result:

- All focused TypeScript, policy, docgen, catalog, changeset, and app gates
  passed.
- Tauri `cargo check` passed.
- Tauri `cargo test` passed with `3 passed`.
- Final full `bun run audit:github quality` passed, including build, type-check,
  lint/policy, docgen generate/aggregate, repo export catalog, unit tests, type
  tests, integration tests, repo sanity, bun audit, and changeset status.

## Residual Risks And Warnings

- `cargo fmt -- --check` could not be run because `cargo-fmt` is not installed
  for the active Rust toolchain.
- `apps/canvas` Vite build exits successfully but reports a chunk-size warning
  for the current app bundle. Treat this as a later optimization unless bundle
  size becomes a release constraint.
- Full repo build output includes existing `professional-desktop`
  lightningcss/Tailwind unknown at-rule warnings. They were not introduced by
  the canvas branch and are out of scope for this loop.

## Current Closure Status

The baseline quality gate is green. The next closure step is the read-only
reviewer panel required by the quality-review-fix loop.
