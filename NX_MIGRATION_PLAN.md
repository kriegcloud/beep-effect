# Nx Migration Plan

> This document captures the recommended strategy for migrating the `beep-effect` monorepo from Turborepo to Nx. It assumes Bun 1.2+, Next.js 15, React 19 RC, Effect-based backend services, and the current workspace layout (`apps/*`, `packages/**`, `tooling/*`).

---

## 1. Objectives & Success Criteria
- Replace Turborepo task orchestration with Nx while preserving existing developer workflows (`bun run dev`, `bun run build`, `bun run check`, etc.).
- Maintain or improve incremental build & test performance through Nx computation caching (local and remote).
- Keep Bun as the package manager and runtime for scripts, with minimal disruption to Effect-first patterns and current toolchain.
- Ensure CI pipelines, production build artifacts, and developer tooling continue to function identically (or better) after the migration.
- Provide clear rollback and contingency paths during the migration window.

## 2. Current State Summary (Turbo)
- Root `package.json` scripts proxy through `bunx turbo run <target>` with `dotenvx` for environment layering.
- `turbo.json` defines task graph, shared inputs (env files, tsconfig), outputs (`dist/**`, `.next/**`, etc.), and concurrency expectations (`dev` persistent processes).
- Workspace structure mixes Next.js app (`apps/web`), Effect server runtime (`apps/server`), MCP tooling (`apps/mcp`), and multiple domain packages under `packages/*`.
- CI (unspecified in repo) likely calls the same `bun run` scripts, relying on Turborepo's caching when `TURBO_TOKEN`/`TURBO_TEAM` are set.
- Turborepo dependency still listed in root devDependencies; `.turbo/` artifacts ignored via scripts.

## 3. Nx Overview & Relevant Capabilities
- Nx 20+ offers standalone workspaces, per-project `project.json`, and fine-grained `targetDefaults` to mimic Turborepo pipelines.
- Official Nx plugins cover Next.js (`@nx/next`), Node backends (`@nx/node`), generic JS/TS packages (`@nx/js`), and Bun (`@nx/bun`).
- Nx computation caching parallels Turborepo, with optional Nx Cloud for remote cache; local cache stored in `.nx/cache`.
- Nx \"run-commands\" executor can wrap custom Bun scripts, easing parity for bespoke tasks (`db:generate`, `gen:beep-paths`).
- Nx graph introspection (`nx graph`) helps validate dependency wiring between apps and packages, replacing Turbo's internal graph.

## 4. Risks & Investigation Items
- **Bun executors**: Confirm `@nx/bun` or `@nx/js` supports Bun-based builds/tests without falling back to Node. Some Nx generators still expect Node-based tooling.
- **Next.js 15 / React 19**: Verify the `@nx/next` plugin is compatible with Next 15 (likely via `next@canary`). If gaps exist, plan to use `run-commands` executor invoking `bunx next` directly.
- **Effect runtime scripts**: Nx must not force async/await usage; ensure custom targets wrap Bun CLIs without altering code style expectations.
- **Env management**: `dotenvx` usage must be mirrored via shell wrappers or Nx target configuration (e.g., `command: \"bun run dotenvx -- bunx <...>\").`
- **Persistent dev tasks**: Nx treats `serve` targets as long-running; confirm watch mode works with `nx serve web` etc.
- **CI caching**: Nx Cloud adoption vs. self-hosted caching needs evaluation; adjust secrets (`TURBO_TOKEN`) replacements.
- **Tooling integrations**: Husky, lint-staged, Biome, Syncpack should remain unaffected but ensure Nx doesn't auto-format or conflict with Biome.
- **Bootstrap scripts**: Root `bootstrap` script currently outside Turbo; confirm Nx keeps this as-is or re-home in workspace generators.

## 5. Migration Phases

### Phase 0 — Preparation (1–2 days)
1. **Stakeholder alignment**: Confirm acceptance criteria with dev leads (tools supported, downtime window, CI owner availability).
2. **Baseline metrics**: Capture Turborepo build/test timings and cache hit rates to compare post-migration.
3. **Inventory tasks**: Tabulate existing Turbo targets (`build`, `check`, `lint`, `test`, `dev`, `db:*`, `gen:*`). Document per-package scripts from `apps/*/package.json` and `packages/**/package.json`.
4. **Review Nx docs**: Read \"Nx Workspace Overview\", \"Nx for Bun\" (if available), `@nx/next` plugin notes for Next 15 compatibility.
5. **Establish feature flag**: Create branch `feat/nx-migration` with Turborepo still intact for iterative work.

### Phase 1 — Bootstrap Nx Workspace (1–2 days)
1. **Install dependencies**: Add `nx`, `@nx/workspace`, `@nx/js`, `@nx/next`, `@nx/node`, and (if needed) `@nx/bun` to devDependencies. Pin versions aligning with Bun 1.2 support.
2. **Initialize Nx**: Run `bunx nx init` (or manual creation) to generate `nx.json`, base `project.json` for root, and update `.gitignore` to include `.nx/cache`.
3. **Set npm scope**: Configure `nx.json` with `npmScope: \"beep\"` (or reuse `@beep`), workspace layout, and default runner (`nx/tasks-runner`) or Nx Cloud.
4. **Target defaults**: Mirror Turbo global settings by defining `targetDefaults.build.inputs`, `outputs`, environment passthroughs (`NEXT_PUBLIC_STATIC_URL`, `AWS_*`, etc.).
5. **Bun integration**: Update `nx.json` `tasksRunnerOptions` or each target to prefix commands with `bunx` / `bun run dotenvx --`. Optionally, configure `nx` to use Bun as package manager via `.nx/workspace.json` or `nx.json` `useBunInstall: true`.

### Phase 2 — Model Projects & Targets (3–5 days)
1. **Generate project configs**:
   - `apps/web`: Use `@nx/next:app` to scaffold config (without creating files) or hand-craft `apps/web/project.json` referencing existing sources. Define targets: `build`, `serve` (dev), `lint`, `test` (if any), `check` (typecheck). Ensure outputs align with `.next`, `.vercel`, etc.
   - `apps/server`: Use `@nx/node:application` or `@nx/js:package` depending on runtime entry. Map to `build` (bundle or `tsc`), `dev` (Effect runtime), `lint`, `test`.
   - `apps/mcp`: Similar approach depending on build/test commands.
   - Libraries under `packages/*`: Use `@nx/js:library` style `project.json` with relevant targets (`build`, `lint`, `test`, `check`).
2. **Assign `tags` & `implicitDependencies`**: Tag domain slices (`iam`, `files`, `shared`) to enforce architectural boundaries via Nx linting. Use `implicitDependencies` for cross-cutting packages (e.g., `packages/core/env`).
3. **Replicate Turbo dependsOn**: For each target, set `dependsOn` to `^build` etc. using Nx syntax (`dependsOn: ["^build"]`). Leverage `targetDefaults` to avoid duplication.
4. **Inputs/Outputs parity**: Translate Turbo `inputs` to Nx `inputs` (supports globs + `inputSet`). Use named inputs for env files, tsconfig, generated artifacts.
5. **Custom executors**: For tasks without direct Nx plugin support (`db:*`, `gen:*`), configure `nx run-commands` with `command`: `bun run dotenvx -- bunx turbo run ...` placeholders, later replace with direct script invocation (`bun run packages/...`).
6. **Ensure script parity**: Update root `package.json` scripts to call `nx run-many` or specific targets (e.g., `"build": "bun run dotenvx -- nx run-many --target=build --all"`). Keep old scripts temporarily behind feature flags for rollback.

### Phase 3 — Hybrid Verification (3–5 days)
1. **Dual wiring**: Allow both Turborepo and Nx commands to run in parallel. Gate Nx scripts behind an env toggle (`USE_NX=1`) so early adopters can validate workflows.
2. **Cache validation**: Run `nx build web --verbose` twice to verify cache hits and inspect `.nx/cache` contents.
3. **Nx graph inspection**: Execute `nx graph` (and `nx show project web`) to confirm dependency edges align with established architecture.
4. **Dev server parity**: Validate `nx serve web`, `nx serve server`, etc. replicate `bun run dev`. Use `nx run-many --target=serve --parallel --maxParallel=3` for multi-surface starts.
5. **CI dry runs**: Trigger pipelines on the feature branch executing Nx scripts alongside Turbo to compare performance and artifacts.
6. **Documentation spike**: Draft updates to `AGENTS.md`, `README.md`, and `docs/patterns/` that describe Nx conventions and guardrails.

### Phase 4 — Cutover (2–3 days)
1. **Flip package scripts**: Update root and workspace `package.json` scripts to call Nx. Remove `bunx turbo` once Nx commands are verified.
2. **Remove Turbo config**: Delete `turbo.json`, drop `.turbo` references from scripts and `.gitignore`, and uninstall the `turbo` dependency.
3. **Nx Cloud decision**: Decide whether to enable Nx Cloud. If yes, configure `tasksRunnerOptions` with `"runner": "@nrwl/nx-cloud"` (or `@nx/nx-cloud` for Nx 20) and add API tokens to CI.
4. **Update CI**: Replace `turbo run ...` with `nx run-many` or `nx affected`. Ensure CI installs Nx (e.g., `bunx nx`), seeds cache directories, and exports Nx artifacts if needed.
5. **Regression sweep**: Execute `nx run-many --all --targets=build,check,lint,test` in CI and locally to confirm no regressions.
6. **Finalize documentation**: Merge updated docs, publish migration notes, and announce cutover to the team.

### Phase 5 — Post-Migration Hardening (1–2 weeks)
1. **Monitor developer feedback**: Collect issues around new CLI flow, caching behavior, or missing shortcuts; resolve via docs or scripts.
2. **Optimize configuration**: Tune `namedInputs` and `targetDefaults.inputs/outputs` for heavy tasks (Next build, Drizzle generation) to maximize cache benefits.
3. **Enable workspace automation**: Evaluate authoring custom Nx generators or a lightweight plugin to codify Effect architecture scaffolding.
4. **Cleanup**: Remove fallback env toggles, ensure `.gitignore` includes `.nx/cache`, and verify no lingering Turbo artifacts remain.
5. **Long-term adoption**: Establish Nx upgrade cadence (`nx migrate latest`), consider `nx release` workflows, and integrate Nx reports into observability dashboards.

## 6. Detailed Task Mapping (Turbo → Nx)
| Turbo Target / Script | Proposed Nx Target | Notes |
|-----------------------|--------------------|-------|
| `bun run build` (`turbo run build`) | `nx run-many --target=build --all` (default `build` target on all projects) | Ensure `build` outputs include `.next`, `dist`, `.vercel`, `_next` directories |
| `bun run dev` (`turbo run dev --concurrency=36`) | `nx run-many --target=serve --projects=web,server,mcp --parallel --maxParallel=3` | Configure `serve` targets as persistent; ensure `dotenvx` wraps commands |
| `bun run dev:https` | Dedicated Nx target `serve-https` or `serve` with `configuration: https` | Mirror TLS certificate handling in Nx target `configurations` |
| `bun run check` | `nx run-many --target=check --all` | Implement `check` targets using `tsc --noEmit` or `biome check` as required |
| `bun run lint` | `nx run-many --target=lint --all` | Use `run-commands` executor to call `bunx biome check` and `bunx syncpack lint` |
| `bun run lint:fix` | `nx run-many --target=lint-fix --all` | Provide `lint-fix` target invoking Biome fix + Syncpack fix |
| `bun run test` | `nx run-many --target=test --all --parallel` | Ensure env var `TESTCONTAINERS_RYUK_DISABLED=true` applied via `options.env` |
| `bun run coverage` | `nx run-many --target=coverage --all` | Configure outputs to include coverage directories for caching |
| `bun run db:generate`/`db:migrate`/`db:push` | `nx run tooling/db-admin:generate` etc. via `run-commands` | Consider consolidated `tooling/db-admin` project managing Drizzle tasks |
| `bun run gen:beep-paths` | `nx run tooling/repo-scripts:gen-beep-paths` | Evaluate building Nx generator to produce assets dynamically |
| `bun run bootstrap` | Keep as `nx run tooling/repo-scripts:bootstrap` | Optionally integrate into Nx custom executor for onboarding |
| `bun run start` | `nx run-many --target=start --projects=web,server` | Map to production start commands |
| `bun run services:up` | Non-cached `run-commands` target | Document manual execution due to Docker side effects |

## 7. Configuration Artifacts to Produce
- `nx.json`: root configuration with `npmScope`, `workspaceLayout` (if needed), `namedInputs`, `targetDefaults`, and `tasksRunnerOptions`.
- Per-project `project.json` files under each app/library defining targets, outputs, `dependsOn`, and `tags`.
- `.gitignore` updates adding `.nx/cache`, `.nx/workspace-data`, and removing `.turbo` post-cutover.
- CI workflow updates referencing `nx affected` commands.
- Optional `tools/` or `packages/tooling` Nx generators/executors to wrap common scripts.

## 8. Testing & Validation Strategy
- **Unit/Integration**: Run `nx test <project>` using Vitest (Bun). Confirm watchers work via `nx test <project> --watch`.
- **Type-check**: `nx check <project>` or `nx run-many --target=check` ensures TypeScript diagnostics match current expectations.
- **Lint**: `nx lint` wrappers for Biome + Syncpack; ensure no Nx-native ESLint config conflicts.
- **Smoke Tests**: Use `nx run-many --target=serve` plus scripted HTTP checks to validate runtime surfaces.
- **Cache audits**: Periodically run `nx graph --focus=<project>` and inspect `.nx/cache` to ensure large artifacts stored once.

## 9. Rollback Plan
- Keep `turbo.json`, `turbo` dependency, and `bunx turbo` scripts on a branch until post-cutover validation completes.
- Maintain `USE_NX` feature flag for at least one sprint to allow instant fallback.
- Document steps to revert: reinstall `turbo`, restore scripts, delete Nx config files (`nx.json`, `project.json` additions) via git revert.
- Ensure CI retains ability to run legacy Turbo pipeline (e.g., via pipeline variable) during stabilization period.

## 10. Communication & Training
- Publish a command translation table (Turbo → Nx) for developers.
- Host a short internal session covering `nx graph`, `nx affected`, caching, and how to define new targets.
- Update onboarding docs (`README.md`, `AGENTS.md`) with Nx-first instructions and links to official Nx resources.
- Define ownership for Nx upgrades (`nx migrate` cadence) and Nx Cloud administration.

## 11. Timeline Estimate
| Phase | Duration | Dependencies |
|-------|----------|--------------|
| 0. Preparation | 1–2 days | Team coordination, Turbo audits |
| 1. Bootstrap Nx | 1–2 days | Nx plugin selection |
| 2. Model Projects | 3–5 days | Task inventory, plugin readiness |
| 3. Hybrid Verification | 3–5 days | Feature branch stability |
| 4. Cutover | 2–3 days | Passing hybrid tests |
| 5. Post-Migration Hardening | 1–2 weeks (overlapping) | Successful cutover |

## 12. Open Questions
- Which CI provider manages current pipelines and cache storage? (Impacts Nx Cloud decision.)
- Are there hidden Turbo pipelines inside `tooling` scripts or `package.json` `postinstall` hooks?
- Does `apps/server` require special process supervision beyond `bun run` (e.g., signals, watchers) that Nx must support?
- Should we author a custom Nx plugin to enforce Effect-specific architecture patterns?
- Do we need environment-specific targets (`build:prod`, `serve:ci`) or can Nx `configurations` cover them?

---

**Next Steps:**
1. Review this plan with platform and DX owners.
2. Decide on Nx version/plugins and verify Bun compatibility.
3. Kick off Phase 0 tasks and build the feature branch for iterative migration.
