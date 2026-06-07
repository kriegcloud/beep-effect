# Storybook App Spec

## Objective

Create `apps/storybook` as the private executable workspace `@beep/storybook`
and make it the single host, validation owner, CI target, and Vercel deploy
surface for foundation UI-system Storybook stories.

## Non-Goals

- Moving story files into `apps/storybook`.
- Enrolling slice UI packages or `packages/shared/ui` stories.
- Adding a public `@beep/storybook` TypeScript API, package exports, docgen,
  dtslint, type-test, or repo-export catalog surface.
- Creating custom DNS, Cloudflare records, or any non-Vercel deploy resource.
- Running `pulumi up` or mutating live infrastructure.
- Updating architecture-wide doctrine unless implementation proves it necessary.

## Source Hierarchy

1. User objective and approved implementation plan from this conversation.
2. `AGENTS.md`, `CLAUDE.md`, and required skills.
3. Governing architecture, package, Turbo, Storybook, and infrastructure
   standards.
4. This `SPEC.md`.
5. `PLAN.md`.
6. `GOAL.md`.
7. Supporting `research/`, `ops/`, and `history/` files.

Higher sources outrank lower sources when they conflict.

## Target Surfaces

- `apps/storybook/**`
- `packages/foundation/ui-system/ui/.storybook/**`
- `packages/foundation/ui-system/ui/vitest.storybook.*`
- `packages/foundation/ui-system/ui/tsconfig.stories.json`
- `packages/foundation/ui-system/ui/package.json`
- `packages/foundation/ui-system/ui/README.md`
- Root workspace, scripts, lockfile, and Turbo config.
- `.github/workflows/storybook.yml`
- `infra/**` Vercel-only Storybook project wiring.
- `goals/storybook-app/**`

## Constraints

- `@beep/storybook` must be private and executable-only: no `src/index.ts`, no
  `exports`, no docgen, no dtslint, no type-test, and no public API catalog.
- Story discovery is limited to
  `packages/foundation/ui-system/*/stories/**/*.stories.@(ts|tsx)`.
- `@beep/ui` no longer owns Storybook runtime config, scripts, browser-story
  tests, or story validation execution.
- Story-owning packages may keep direct authoring dependencies required by their
  local story imports, such as Storybook story types/test helpers.
- Storybook Vite config must allow external workspace stories and dedupe React.
- Preview CSS must import `@beep/ui/styles/globals.css` and scan app config plus
  foundation UI-system source/story paths.
- Root Storybook scripts target `@beep/storybook` and preserve the portless
  service name `storybook.beep`.
- Turbo inputs must notice package-local story/source edits for Storybook app
  validation/build tasks.
- CI must build Storybook, run browser-story tests with Playwright Chromium, and
  upload/prove the static artifact.
- Vercel/Pulumi work is preview-capable wiring only. Credentials use normal
  Pulumi/1Password environment injection; raw secrets are never requested or
  exposed.

## Acceptance Criteria

- [x] `apps/storybook` exists as private `@beep/storybook`, has no public API
      exports, and owns Storybook runtime scripts/config/test setup.
- [x] Current UI stories remain under
      `packages/foundation/ui-system/ui/stories/**` and are discovered by the
      Storybook app.
- [x] `@beep/ui` package checks/lint/tests cover source/package concerns only.
- [x] Root Storybook commands filter to `@beep/storybook`.
- [x] Dedicated Storybook CI workflow builds, browser-tests, and uploads
      `storybook-static`.
- [x] Infra includes Vercel-only Storybook project wiring named
      `beep-storybook` with preview proof when credentials are available.
- [x] No unrelated refactors or formatting churn.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Packet launcher size | `test "$(wc -m < goals/storybook-app/GOAL.md)" -le 4000` | Passes |
| Manifest JSON | `jq . goals/storybook-app/ops/manifest.json` | Passes |
| Packet grep | `rg -n "storybook-app\|@beep/storybook\|apps/storybook\|agentLaunchers\|packetAnchorDocument" goals/storybook-app` | Finds expected anchors |
| Packet whitespace | `git diff --check -- goals/storybook-app` | Passes |
| Workspace config | `bun run config-sync:check` | Passes |
| Version sync | `bun run version-sync` | Passes |
| UI package lane | `bunx turbo run check lint test --filter=@beep/ui` | Passes |
| Storybook app lane | `bunx turbo run check lint storybook:build test:storybook --filter=@beep/storybook` | Passes |
| Root Storybook build | `bun run storybook:build` | Builds `apps/storybook/storybook-static/index.html` |
| Root Storybook tests | `bun run test:storybook` | Passes |
| Infra lane | `bunx turbo run check lint test --filter=@beep/infra` | Passes |
| Pulumi preview | Storybook stack preview with injected credentials, when available | No live mutation; blocker recorded if credentials unavailable |

## Stop Conditions

- Required source files are missing or materially contradictory.
- The implementation would exceed named scope.
- Verification requires credentials, cost, destructive side effects, or policy
  approval not named in this spec.
- The same blocker repeats after reasonable investigation.

## Exception Ledger

| Exception | Scope | Owner | Rationale | Removal condition |
| --- | --- | --- | --- | --- |
| None | N/A | N/A | N/A | N/A |
