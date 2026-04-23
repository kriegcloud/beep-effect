# Legacy Path-Coupling Inventory

## Purpose

Track the active repo surfaces that still hard-code legacy filesystem roots or
legacy package names.

This is a burn-down artifact for the enablement gate. A correct routing canon is
not enough if the repo still launches, scaffolds, documents, or validates the
old paths.

## Scan Baseline

Quick repo scan on `2026-04-23`, excluding `dist`, `coverage`, and `.turbo`
artifacts:

| Legacy root or symbol | Quick scan hits | Representative active files | Rewrite owner | Rewrite type | Temporary compatibility |
|---|---:|---|---|---|---|
| `packages/common/` | 119 | `package.json`, `tsconfig.json`, package-local `docgen.json`, app config surfaces | enablement gate plus non-slice family cutovers | workspace, alias, docgen, metadata, and app-config rewrite | no new hard-coded uses allowed |
| `tooling/docgen` | 106 | package scripts, `docgen.json` schemas, tooling tests | enablement gate plus tooling cutover | script-path and schema-path rewrite | only if a ledgered package alias is needed |
| `tooling/cli` | 57 | root `create-package` script, CLI docs, CLI tests | enablement gate plus tooling cutover | script-path, import, and scaffolder rewrite | only if a ledgered package alias is needed |
| `tooling/repo-utils` | 41 | repo-utils tests and fixture paths | tooling cutover | fixture, workspace-scope, and import rewrite | only if a ledgered package alias is needed |
| `.claude` | 38 | root scripts, `turbo` inputs, package shell, hook paths | agent/tooling cutover | subtree split using the decomposition matrix | yes, but only if ledgered |
| `.codex` | 21 | root workspaces, `turbo` inputs, runtime config paths | agent/tooling cutover | subtree split using the decomposition matrix | yes, but only if ledgered |
| `packages/runtime/` | 35 | app sidecar launch scripts, `tsconfig` aliases, docs | enablement gate plus repo-memory cutover | launch-surface and import rewrite | yes, but only ledgered wrapper paths or package aliases |
| `packages/editor/runtime/` | 8 | editor app Tauri/dev/build scripts | enablement gate plus editor cutover | launch-surface rewrite | yes, but only ledgered wrapper paths |
| `packages/shared/providers/` | 14 | package metadata, `tsconfig` paths, docs | shared-kernel/driver cutover | package path and import rewrite | only if a ledgered package alias is needed |
| `packages/common/ui` | 32 | `apps/editor-app/components.json`, app `tsconfig`, tooling allowlists | enablement gate plus foundation cutover | app config and path rewrite | yes, if a short-lived wrapper path is required |
| `@beep/runtime-protocol` | 24 | `apps/desktop`, `packages/repo-memory/client`, `packages/editor/protocol` | repo-memory cutover | import split by shared control-plane vs repo-memory contracts | yes, package alias only |
| `@beep/editor-lexical` | 13 | `apps/editor-app`, editor package docs/tests | editor cutover | import rewrite to `@beep/editor-ui` | yes, package alias only |

## High-Risk Coupling Families

The following surfaces are explicit required work, not incidental cleanup:

| Coupled surface | Why it is high risk | Required action |
|---|---|---|
| root repo wiring: `package.json`, `tsconfig.json`, `turbo.json`, `tsconfig.packages.json`, `tsconfig.quality.packages.json`, `scratchpad/tsconfig.json`, `syncpack.config.ts` | these files teach the repo what topology is canonical | rewrite them before slice cutovers start |
| app sidecar entrypoints in `apps/desktop` | they hard-code `packages/runtime/server/src/main.ts` across Tauri, build, dev, and docs surfaces | rewrite during the enablement gate and repo-memory cutover |
| app sidecar entrypoints in `apps/editor-app` | they hard-code `packages/editor/runtime/src/main.ts` across Tauri, build, and dev surfaces | rewrite during the enablement gate and editor cutover |
| shared UI app config in `apps/editor-app/components.json` and `apps/editor-app/tsconfig.json` | they hard-code `packages/common/ui` and can reintroduce legacy paths even after package moves | rewrite during the enablement gate |
| identity registry at `packages/common/identity/src/packages.ts` | package moves change canonical package identities and example ids | update with every package rename/relocation batch |
| `tooling/cli/src/commands/CreatePackage/Handler.ts` | the scaffolder is hard-coded to the current identity registry path and can emit legacy roots | migrate together with the identity registry and new family grammar |

## Burn-Down Rule

Every row above needs:

1. an owning cutover
2. a rewrite type
3. a decision on whether temporary compatibility is allowed
4. a validation query proving the coupling reached zero before final closure

If a new path-coupled surface appears during migration, it is added here before
the batch is considered complete.
