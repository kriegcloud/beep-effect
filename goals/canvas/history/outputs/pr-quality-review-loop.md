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

### Read-Only Reviewer Round 1

- `status`: fixed
- `evidence`: six read-only reviewers found required issues across testing,
  Effect boundaries, schema-first decoding, architecture boundaries, generated
  docs, and final quality readiness.
- `required findings`:
  - saved scene payloads were returned from native load but not restored into
    the in-memory use-case repository when a scene already existed.
  - native success and failure payloads crossed the Tauri boundary as trusted
    unknown values, and Rust `{ tag, message }` errors lost their message.
  - scene-load recovery treated all use-case `get` failures as not-found
    recovery instead of narrowing recovery to repository not-found.
  - React select/id decoding used synchronous decoders and an unsafe node-kind
    cast outside the Effect error channel.
  - Rust JSON/file failures returned redacted public errors but dropped the
    original cause without a local diagnostic.
  - `@beep/canvas-server` was imported through the package root instead of the
    canonical layer subpath.
  - app tests imported local `src` files instead of the package alias.
  - public app exports and generated export catalog/docs were stale or missing
    required examples, and the app README still looked like a package template.
- `fix`: added `RestoreCanvasProjectCommand` and a `restore` use-case/server
  surface, restored native load payloads through that use-case, decoded every
  unknown native/app boundary payload through schemas, preserved structured
  native error messages, moved React decode work into `ManagedRuntime` effects,
  logged redacted Rust causes locally, switched server wiring to
  `@beep/canvas-server/layer`, switched tests to `@beep/canvas`, restored the
  `VERSION` export, expanded README/AGENTS, refreshed public export catalog
  data, and added docgen examples for the app surface.
- `acceptance`: focused Turbo check/lint/test/type-test, Rust tests, schema-first
  lint, effect-import law check, docgen check, docgen quality, config-sync
  check, changeset status, `bun run docgen:local -- --full`, and repo export
  catalog check passed after the fixes.

### Local Docgen Full-Proof Drift

- `status`: fixed
- `evidence`: `bun run docgen:local` correctly refused bounded mode because
  `bun.lock` and root `tsconfig.json` are global docgen/Turbo inputs changed by
  this branch.
- `fix`: used the repo-local full-proof lane,
  `bun run docgen:local -- --full`. The first run caught a missing `@since`
  annotation on the new `CanvasProjectServer` layer re-export; the export was
  documented and the catalog was regenerated. A later full-proof run caught a
  JSDoc example import mismatch in the canvas use-case commands; the examples
  now import the canvas domain namespace instead of aliasing the `CanvasProject`
  class.
- `acceptance`: `bun run docgen:local -- --full` passed with `77 successful`,
  `77 total`, and aggregated `apps/canvas`, `packages/canvas/server`, and
  `packages/canvas/use-cases` into `docs/canvas`.

### Read-Only Reviewer Round 2

- `status`: fixed
- `evidence`: second-pass reviewers found the remaining PR-readiness blockers:
  restored package changelogs were still untracked, final audit evidence was
  pending, and public `VERSION` constants in `@beep/canvas-server` and
  `@beep/canvas-use-cases` still reported `0.0.0` while package manifests and
  changelogs reported `0.0.1`.
- `fix`: updated both public `VERSION` exports to `0.0.1`, regenerated the
  export catalog, reran package docgen checks and docgen quality for server and
  use-cases, and included the restored changelogs in the final canvas closure
  scope.
- `acceptance`: focused server/use-cases type check passed, server/use-cases
  package docgen checks and quality scoring passed, `bun run repo-exports:catalog`
  and `bun run repo-exports:catalog:check` passed, and
  `bun run docgen:local -- --full` passed again after the `VERSION` fix. After
  merging `origin/main`, the final full `bun run audit:github quality` passed.

## Final Verification

Focused app gates:

- `bunx turbo run check lint test type-test --filter=@beep/canvas
  --filter=@beep/canvas-use-cases --filter=@beep/canvas-server`

Focused repo policy gates:

- `bun run beep lint schema-first`
- `bun run beep laws effect-imports --check`
- `bun run beep docgen check -p apps/canvas`
- `bun run beep docgen quality -p apps/canvas --json --score codex --output
  /tmp/beep-canvas-docgen-quality.json`
- `bun run docgen:local -- --full`
- `bun run config-sync -- --check`
- `bun run repo-exports:catalog`
- `bun run repo-exports:catalog:check`
- `bun run changeset:status:since-main`

Native Tauri gates:

- `cargo test --manifest-path apps/canvas/src-tauri/Cargo.toml`

Full closure gate:

- `bun run audit:github quality`

Result:

- Focused TypeScript check/lint/test/type-test passed across `@beep/canvas`,
  `@beep/canvas-use-cases`, and `@beep/canvas-server`.
- Schema-first, effect-import law, app docgen check, app docgen quality,
  server/use-cases docgen checks and quality, config-sync, repo export catalog,
  changeset status, and local full-proof docgen passed.
- Tauri `cargo test` passed with `3 passed`.
- Final full `bun run audit:github quality` passed on the merged PR head before
  PR handoff.

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

The round-1 and round-2 required reviewer findings are fixed, focused gates are
green, the branch is merged with `origin/main`, and the final full
`bun run audit:github quality` passed. The canvas PR is ready for review.
