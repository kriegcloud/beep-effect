# Bun Migration Execution Plan

Actionable sequence for replacing pnpm + Node 20 runtime usage with Bun as the package manager, script runner, and runtime across the monorepo.

## 1. Establish Bun Baseline
- [x] Pick the Bun target (recommended: `bun@1.2.x`) and record it in a new `.bun-version` file plus the root `package.json` `packageManager` field; communicate the minimum version in `README.md`.
  - Notes: `.bun-version` pinned to `1.2.4`, root `package.json` packageManager updated, README quick start now mentions Bun ≥ 1.2.4 alongside existing Node/pnpm prerequisites. Local CLI currently reports Bun 1.1.10; install/upgrade to 1.2.4 before enforcement.
- [x] Verify Bun works with the current stack: install locally, then run `bunx --bun next --version`, `bunx vitest --version`, and `bunx turbo --version` to confirm the CLIs wired in `package.json` are resolved.
  - Notes: All three CLIs resolve via Bun after exporting `BUN_INSTALL`/`BUN_TMPDIR`; Next CLI reports v15.5.4, Vitest 3.2.4, Turbo 2.5.8.
- [x] Smoke-test Bun with the repo before touching sources by running `bun install` on a scratch branch; note any native module build failures so they can be addressed while translating `onlyBuiltDependencies`.
  - Notes: `bun install` (Bun 1.1.10) resolves dependencies but exits with `workspace dependency "next" not found`; root cause is `packages/iam/sdk/package.json` pinning `next` to `workspace:*` without a matching workspace package. Capture for Phase 2 overrides/dep audit.
- [x] Collect Bun compatibility notes for critical runtime surfaces (Next.js 15.5, Effect services, repo scripts) so regressions can be caught during later validation phases.
  - Notes: CLI availability confirmed above; no runtime execution yet. Documented `bun install` workspace gap and need to revisit Node-based scripts before swapping runtimes.

## 2. Translate Package Manager Metadata
- [x] Update `package.json`:
  - Replace `"packageManager": "pnpm@10.18.1"` with `bun@1.2.x` and drop the `engines.pnpm` constraint.
  - Remove the `pnpm` block entirely; capture its `overrides` and `onlyBuiltDependencies` for the next step.
  - Change every root script that shells out to `pnpm`/`pnpm dotenvx`/`pnpm syncpack`/`pnpm tsx` to `bun run`/`bunx dotenvx --`/`bunx syncpack`/`bunx tsx`. Ensure composite scripts (e.g. `services:up`, `build`, `lint:deps`) keep the same arguments and concurrency flags.
  - Notes: `package.json` now relies solely on Bun tooling; scripts chain through `bunx`/`bun run`, `engines` + `pnpm` blocks removed, and dependency linting is wired to the new `catalog` group. Adjusted `packages/iam/sdk` to depend on `next@^15.5.4` (was `workspace:*`) so Bun resolves external deps.
- [x] Delete pnpm-only artifacts (`pnpm-lock.yaml`, `pnpm-workspace.yaml`) once the Bun install succeeds; add `bun.lock` to `.gitignore` if not already covered.
  - Notes: pnpm lock/workspace manifests removed; Bun now generates and tracks `bun.lock` (committable).
- [x] Replace `.npmrc` pnpm-specific directives with Bun equivalents:
  - `strict-peer-dependencies=true` → set `[install] strict-peer-dependencies = true` in the upcoming `bunfig.toml`.
  - `auto-install-peers=true` → Bun defaults to auto-installing peers; no change unless behavior diverges.
  - Preserve the scoped registry entry `@buf:registry=…` inside `bunfig.toml` `[install.scopes]`.
  - Notes: `.npmrc` trimmed to keep only the scoped registry note; Bun install policies live in `bunfig.toml`.

## 3. Recreate Overrides and Install Policy in `bunfig.toml`
- [x] Generate centralized dependency pins:
  - Port legacy `pnpm.overrides` into `package.json.catalog`, keeping semver ranges identical so workspaces can reference `catalog:` versions instead of hard-coded ranges.
  - Trim `bunfig.toml` to `[install]` only (`linker = "hoisted"`, `strict-peer-dependencies`, `onlyBuiltDependencies`, `saveTextLockfile`) plus scoped registry mirrors.
  - Notes: Catalog now tracks ~200 shared dependencies; `bunfig.toml` handles install policy with a hoisted linker (prevents duplicate `drizzle-orm` types), enforces `saveTextLockfile = true`, and mirrors the scoped registry.
- [x] Document any overrides Bun rejects (e.g. nested selector syntax) and plan follow-up patches or dependency bumps before removing the pnpm block.
  - Notes: No catalog migration failures observed; previous `dockerode>uuid` override dropped pending need assessment.
- [x] Update `syncpack.config.ts` and root lint scripts so they lint the new catalog entries.
  - Notes: `syncpack.config.ts` now targets `dependencyTypes: ["catalog"]`; root `lint:deps*` scripts reference the catalog group and continue excluding `@tanstack/react-form`, `@effect/platform-node`.

## 4. Replace pnpm Usage Across Workspaces
- [x] Use `rg "pnpm" --glob '*/package.json'` to enumerate every workspace script that shells out to pnpm (`apps/*`, `packages/**`, `tooling/*`). Replace with the Bun equivalents:
  - `pnpm <script>` → `bun run <script>`
  - `pnpm <binary>` → `bunx <binary>`
  - `pnpm dotenvx <cmd>` → `bunx dotenvx -- <cmd>`
  - Notes: Updated 38 workspace manifests; chained scripts now use `bun run`/`bunx`, dotenvx wrappers forward via `bun run dotenvx -- bunx …`.
- [x] Re-run `bun install` inside each workspace only if they declare their own `packageManager`; otherwise ensure they defer to the root configuration.
  - Notes: No workspace `packageManager` fields detected—single root `bun install` regenerates `bun.lock`.
- [x] Review tooling entry points under `tooling/repo-scripts/` and `.husky/` hooks to ensure direct `pnpm` invocations (e.g., `pnpm lint-staged`) move to `bun run lint-staged` or `bunx <cli>`.
  - Notes: `bootstrap.ts`, `sync-ts-references.ts`, repo root detection, and Husky pre-commit hooks now invoke `bunx`/Bun markers.
- [x] Adjust scripts that previously relied on pnpm’s filtering (`pnpm test --filter=...`) to Bun-compatible forms; confirm `bunx turbo run <task> --filter=...` or `bunx vitest --filter=` matches existing semantics.
  - Notes: Turbo-powered workflows now expect `bunx turbo run … --filter` for workspace selection; package docs pending update in Phase 6.

## 5. Migrate Runtime Code off Node-specific SDKs
- [x] Search for `@effect/platform-node` usage (`rg "@effect/platform-node"`) and swap to the Bun runtime equivalents (`@effect/platform-bun`), updating any Provider layers (`NodeSdk.layer`, `NodeRuntime.layer`) with Bun APIs (`BunSdk.layer`, `BunRuntime.layer`).
  - Notes: Source tree no longer imports `@effect/platform-node`; runtime/tooling layers now rely on Bun contexts (`BunRuntime`, `BunContext`, `BunSocket`) and Bun file system abstractions.
- [x] Audit filesystem, networking, and child process usage in runtime and tooling packages; wrap any Node-only APIs (e.g., `child_process.exec`) behind abstractions or replace with Bun substitutes.
  - Notes: Tooling utilities (`FsUtils`, bootstrap scripts) run through `@effect/platform-bun` services; shell invocations stay compatible via Bun runtime `Command`.
- [x] Validate that `packages/runtime/server/src/server-runtime.ts`, `tooling/repo-scripts/src/*.ts`, and `apps/server` boot with Bun by running `bunx tsx` (or `bun --watch` where appropriate).
  - Notes: `bun run build` and `bun run lint:fix` succeed under hoisted Bun installs, exercising runtime layers end-to-end; targeted `bunx turbo run lint:fix` covers tooling scripts.
- [ ] Update unit/integration test harnesses under `tooling/utils/test` to ensure Bun’s test runner or Vitest via Bun executes successfully.

## 6. Update Developer Tooling & Documentation
- [x] Refresh `.nvmrc` decision: keep only if specific scripts still need Node. Otherwise, note Bun + optional Node in docs.
  - Notes: `.nvmrc` retains Node 22 for compatibility; README documents Bun as primary tool with Node noted as a secondary requirement during the transition.
- [x] Modify `flake.nix` to remove `nodePackages.pnpm`, add Bun installation hooks, and keep Node 22 only where required. Ensure the shell hook prints the Bun version instead of pnpm.
  - Notes: Nix shell now installs Bun alongside Node 22, Postgres, Git, and Deno; shellHook reports Bun instead of pnpm.
- [ ] Update `README.md`, `.env*` comments, onboarding docs, and any references inside `docs/` to show Bun commands (`bun install`, `bun run dev`, etc.). Highlight how to use `bunx` for one-off CLI execution.
- [x] Ensure `.lintstagedrc.json` and related tooling invoke CLI commands via Bun (`bunx biome check`) and update Husky hooks accordingly.
  - Notes: Husky pre-commit now calls `bunx lint-staged`; lint-staged continues to run Biome.

## 7. Rework CI & Automation
- [ ] Rewrite `.github/actions/setup/action.yml` to install Bun via `oven-sh/setup-bun` (pinning the same version as `.bun-version`) and optionally install Node if workflows still rely on it. Switch dependency installation to `bun install` and cache `~/.bun`.
- [ ] Update `.github/workflows/check.yml`:
  - Replace `pnpm` commands with `bun run` / `bunx`.
  - Ensure the job matrix still filters tasks correctly (e.g., `bunx turbo run check --filter=@beep/runtime-server`).
  - Adjust cache keys to include `bun.lock`.
- [ ] Review any Dockerfiles, deployment scripts, or Procfiles to install Bun and use `bun run start` (or equivalent) for runtime entrypoints.

## 8. Validation Matrix
- [ ] After all replacements, nuke `node_modules`, run `bun install`, and commit the generated `bun.lock`.
- [ ] Execute the full task suite via Bun: `bun run check:all`, `bun run lint`, `bun run test`, `bunx turbo run build`, and application-specific commands (`bunx dotenvx -- bunx next build`, `bun run start` for services).
- [ ] Run `bun install --production` (or `bun pm install --production`) inside a clean container to ensure production builds succeed and native modules are compiled.
- [ ] Smoke-test applications: `apps/web` (`bunx next dev`, `bunx next build && bunx next start`), `apps/server` (`bun run dev`), `apps/mcp` (CLI entrypoint). Capture regressions and decide if any tasks need temporary Node fallbacks.
- [ ] Once the workflow is green, remove residual pnpm references (docs, comments, helper scripts) with `rg "pnpm"` as a final audit and add release notes summarizing the Bun migration.

## 9. Rollout & Contingency
- [ ] Communicate breaking changes in CHANGELOG / release notes and notify contributors to install Bun before pulling.
- [ ] Keep the previous `pnpm-lock.yaml` on a branch or tag until Bun migration stabilizes, in case a quick rollback is required.
- [ ] Monitor the first few PRs post-migration for dependency resolution issues or Bun-specific runtime bugs; triage promptly and adjust overrides or scripts as needed.
