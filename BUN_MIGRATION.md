# Bun Migration Plan

> Use this checklist during a follow-up Codex session to replace `pnpm` + Node with Bun as the package manager and runtime across the repo.

## Goals & Definition of Done
- Bun (>=1.2.x) is the only package manager used; `bun.lockb` is the source of truth.
- All workspace scripts run through Bun/Bunx (no `pnpm` invocations).
- Runtime targets (Next.js app, Effect services, tooling scripts) execute successfully on Bun.
- CI, local onboarding docs, and dev-shells bootstrap Bun instead of Node+pnpm.
- README/dev docs explain the new workflow; pnpm-specific artifacts are removed.

## Current State Snapshot
- Root `package.json`: declares `packageManager: pnpm@10.18.1`, `engines.pnpm`, and a large `pnpm.overrides` map (`package.json#L5-L210`).
- Workspaces are declared both in `package.json` and `pnpm-workspace.yaml`.
- Scripts across the repo shell out to `pnpm ...`, `pnpm dotenvx ...`, `pnpm madge ...`, etc. (see `apps/**/package.json`, `packages/**/package.json`, `tooling/**/package.json`).
- Runtime code relies on `@effect/platform-node` primitives (e.g. `packages/runtime/server/src/server-runtime.ts`, `tooling/repo-scripts/src/*`, tests under `tooling/utils/test/*`).
- CI workflow `.github/workflows/check.yml` and composite action `.github/actions/setup/action.yml` install pnpm & Node 20.
- Dev tooling includes `.nvmrc` (Node 22) and `flake.nix` which provisions `nodePackages.pnpm` plus Node.js.
- Docs (`README.md`, `.env*` comments) explicitly reference pnpm commands.

## Risks & Unknowns
- **Next.js on Bun**: confirm Next `15.5.x` works with Bun 1.2+ for dev and production builds. Validate edge functions/serverless compatibility if deployed.
- **Effect runtime switches**: migrations from `@effect/platform-node` to `@effect/platform-bun` may require code changes (e.g. `NodeSdk` → `BunSdk`, socket layer differences).
- **`workspace:` protocol**: ensure Bun resolves `workspace:^` ranges the same way pnpm did.
- **Overrides parity**: translate `pnpm.overrides` + `onlyBuiltDependencies` into Bun equivalents; Bun supports `overrides` & `packageExtensions` via `bunfig.toml`, but the mapping should be verified.
- **Tooling CLIs**: confirm `bunx` can run `turbo`, `dotenvx`, `syncpack`, `madge`, `tsx`, etc., or replace with Bun-native alternatives.

## Phase 0 – Alignment & Tooling Prep
1. Choose target Bun version (likely latest stable >= 1.2) and note required minimum in docs.
2. Audit production deployment targets (Docker images, hosting) to ensure Bun is available or can be added.
3. Document fallback plan if a dependency blocks running on Bun (e.g. temporarily run specific scripts via `node` shim).

## Phase 1 – Package Manager Swap
1. Update root `package.json`:
   - Set `packageManager` to `bun@<version>` and drop the `engines.pnpm` constraint.
   - Remove the `"pnpm"` configuration block (`overrides`, `onlyBuiltDependencies`) and list entries for translation in step 2.
2. Recreate dependency pins and build flags:
   - Move forced versions into the standard `overrides` field recognized by Bun/npm.
   - Reproduce `onlyBuiltDependencies` via `bunfig.toml` (e.g. `[install] onlyBuiltDependencies = ["@parcel/watcher", ...]`).
   - Validate Bun can build native dependencies across supported platforms.
3. Clean pnpm artifacts:
   - Delete `pnpm-lock.yaml` and `pnpm-workspace.yaml`.
   - Ensure `.gitignore` includes `bun.lockb`.
4. Refresh registry settings:
   - Replace pnpm-specific `.npmrc` directives (`strict-peer-dependencies`, `auto-install-peers`) with Bun equivalents or remove them if defaults are acceptable.
   - Preserve scoped registry entries (e.g. `@buf`).
5. Install with Bun:
   - `rm -rf node_modules` then `bun install` from the repo root.
   - Commit the generated `bun.lockb`.
6. Verify workspace linking:
   - Spot-check packages (e.g. `packages/common/utils`) with `bun pm ls` to ensure `workspace:^` versions resolve locally.
   - Update `syncpack.config.ts` & `lint:deps*` scripts to operate on `overrides` instead of `pnpmOverrides`.

## Phase 2 – Scripts & Task Runner Updates
1. Apply consistent replacements repository-wide:
   - `pnpm <script>` → `bun run <script>` for script chaining.
   - `pnpm <binary>` → `bunx <binary>` for CLI tools (turbo, vitest, madge, syncpack, biome, dotenvx, tsx, etc.).
   - `pnpm dotenvx ...` → `bunx dotenvx -- ...` to maintain env loading.
   - `pnpm vitest run ...` → `bunx vitest run ...`.
2. Update root scripts (`package.json`) using the new pattern. Examples:
   - `build`: `bunx dotenvx -- bunx turbo run build`
   - `dev`: `bunx dotenvx -- bunx turbo run dev --concurrency=36`
   - `lint:deps`: `bunx syncpack lint --dependency-types='overrides' --dependencies='!{@tanstack/react-form,@effect/platform-bun}'`
   - `gen:secrets`: `bunx dotenvx -- bunx tsx ./tooling/repo-scripts/src/generate-env-secrets.ts`
3. Propagate changes to every workspace `package.json` under `apps/`, `packages/`, `tooling/`:
   - Replace chains like `pnpm build-esm && pnpm build-cjs` with `bun run build-esm && bun run build-cjs`.
   - Swap `pnpm madge`, `pnpm tsx`, `pnpm dotenvx tsx` for `bunx` equivalents.
   - Confirm watch scripts (`tsx watch ...`) function under `bunx tsx`; fallback to `bun --watch` if necessary.
4. Turborepo integration:
   - Ensure `bunx turbo run <task>` succeeds for build/check/test pipelines.
   - Keep `turbo` declared in dependencies so Bun can resolve the binary locally.
5. (Optional) Write a one-off codemod to rewrite `"pnpm "` substrings, then manually audit sensitive scripts.

## Phase 3 – Runtime Migration
1. Swap `@effect/platform-node` imports for Bun equivalents across runtime/tooling code:
   - Files: `packages/runtime/server/src/server-runtime.ts`, `packages/_internal/db-admin/test/pg-container.ts`, `tooling/repo-scripts/src/*.ts`, `tooling/utils/src/FsUtils.ts`, related tests, and any others surfaced by `rg "@effect/platform-node"`.
   - Update DevTools sockets (`NodeSocket.layerWebSocketConstructor`) to the Bun socket layer.
2. Adjust telemetry runtime wiring:
   - Replace `NodeSdk.layer` with the Bun SDK layer and confirm OTLP exporters behave correctly.
   - Validate any Node-only APIs (e.g. `process.env`, `performance`) used by observability layers under Bun.
3. Audit Node-specific APIs in application code:
   - Review usages of `fs`, `path`, `child_process`, `worker_threads`, etc.; Bun supports most APIs but confirm advanced patterns behave identically.
   - Where differences exist, wrap logic behind platform abstractions or document temporary Node fallbacks.
4. Application surfaces:
   - **Next.js (`apps/web`)**: test `bunx dotenvx -- bunx next dev --turbopack`, `bunx next build`, and `bunx next start`; capture blockers (native modules, Node-only features).
   - **Effect services (`apps/server`, `apps/mcp`)**: ensure `bunx tsx watch` and `bun run start` behave; migrate to Bun-native `bun --watch` if `tsx` shows incompatibilities.
5. Deployment considerations:
   - Update Docker or hosting scripts to install Bun and call `bun run start`.
   - Decide whether Node stays available in production images as a fallback (document rationale).

## Phase 4 – Developer Environment & Tooling
1. Runtime version files:
   - Add `.bun-version` (or document required Bun version) and keep `.nvmrc` only if Node remains necessary for edge cases.
   - Explain in docs why Node might still be installed locally.
2. Nix dev shell (`flake.nix`):
   - Replace `nodePackages.pnpm` with Bun packages.
   - Retain Node 22 only if specific tooling still depends on it.
3. Documentation refresh:
   - Update `README.md`, `.env`, `.env.example`, `docs/**`, and onboarding checklists to reference Bun commands (`bun install`, `bun run dev`, etc.).
   - Mention how to install Bun and use `bunx` for CLIs.
4. Config updates:
   - Expand `bunfig.toml` with overrides/install settings migrated from pnpm.
   - Ensure lint-staged (`.lintstagedrc.json`) runs CLI commands through Bun/Bunx.
5. Repo-wide cleanup:
   - Use `rg "pnpm"` to locate remaining references in code comments or docs and update them.

## Phase 5 – CI/CD & Automation
1. Composite setup action (`.github/actions/setup/action.yml`):
   - Swap pnpm installation with `oven-sh/setup-bun`.
   - Install Node only if still required; configure caching for Bun (`~/.bun` or `BUN_INSTALL_CACHE`).
   - Run `bun install` instead of `pnpm install`.
2. Workflow jobs (`.github/workflows/check.yml`):
   - Replace commands with `bun run check`, `bun run lint`, `bun run test`, etc.
   - Adjust caching strategy to include `bun.lockb` and Bun's download cache.
3. Husky & lint-staged (`.husky/*`, `.lintstagedrc.json`):
   - Ensure hooks invoke `bun run lint-staged` or direct Bunx commands.
4. Deployment automation:
   - Update Docker/Procfile scripts to install Bun and call `bun run start`.

## Phase 6 – Validation & Cleanup
1. Execute full task matrix via Bun: `bun run check:all`, `bun run build`, `bun run test`, `bun run coverage`, targeted Turbo tasks, etc.
2. Smoke-test each app surface (Next dev/build/start, Effect server runtime, MCP tools, repo scripts).
3. Run `bun install --production` (or `bun pm install --production`) to validate production builds and native module compilation.
4. Monitor native dependencies (`@parcel/watcher`, `sharp`, `protobufjs`, etc.) for Bun compatibility; patch or pin as needed.
5. Remove lingering pnpm references/artifacts once the Bun workflow is stable.
6. Update release notes/CHANGELOG and communicate breaking changes.

## Appendix – Script Replacement Cheatsheet
| Current | Bun | Notes |
| --- | --- | --- |
| `pnpm <script>` | `bun run <script>` | Runs another script within the same package. |
| `pnpm <binary>` | `bunx <binary>` | Executes local CLI binaries. |
| `pnpm dotenvx <cmd>` | `bunx dotenvx -- <cmd>` | Use `--` to forward arguments after env loading. |
| `pnpm tsx ...` | `bunx tsx ...` | Works for direct exec and watch mode. |
| `pnpm test --filter=...` | `bunx vitest run --filter=...` | Same CLI options available. |
| `pnpm update-lockfile` | `bun pm update` or `bun install --force` | Regenerates `bun.lockb`. |
| `pnpm exec <cmd>` | `bunx <cmd>` | Bunx handles on-demand CLI execution. |