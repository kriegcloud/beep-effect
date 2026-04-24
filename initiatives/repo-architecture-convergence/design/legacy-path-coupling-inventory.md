# Legacy Path-Coupling Inventory

## Purpose

Track the active repo surfaces that still hard-code legacy filesystem roots or
legacy package names.

This is a burn-down artifact for the enablement gate. A correct routing canon is
not enough if the repo still launches, scaffolds, documents, or validates the
old paths.

## Scan Baseline

This design artifact no longer freezes exact hit counts. Exact numeric totals
drift as the repo and the design packet change, so authoritative counts belong
in the active `P0` or closure evidence pack alongside the exact command output
used to produce them.

Use the following reproducible scan template for current counts:

```sh
rg -n --hidden \
  --glob '!dist/**' \
  --glob '!coverage/**' \
  --glob '!.turbo/**' \
  --glob '!initiatives/repo-architecture-convergence/**' \
  '<pattern>' \
  apps packages tooling infra .agents .aiassistant .claude .codex \
  package.json tsconfig.json turbo.json tsconfig.packages.json \
  tsconfig.quality.packages.json scratchpad syncpack.config.ts \
  cspell.json .markdownlint-cli2.jsonc .gitmodules
```

The table below records the query anchor to substitute for `<pattern>` and the
active surfaces the query is expected to light up.

| Legacy root or symbol | Reproducible query anchor | Representative active files | Rewrite owner | Rewrite type | Temporary compatibility |
|---|---|---|---|---|---|
| `packages/common/` | `packages/common/` | `package.json`, `tsconfig.json`, package-local `docgen.json`, app config surfaces | enablement gate plus non-slice family cutovers | workspace, alias, docgen, metadata, and app-config rewrite | no new hard-coded uses allowed |
| `tooling/docgen` | `tooling/docgen` | package scripts, `docgen.json` schemas, tooling tests | enablement gate plus tooling cutover | script-path and schema-path rewrite | only if a ledgered package alias is needed |
| `tooling/cli` | `tooling/cli` | root `create-package` script, CLI docs, CLI tests | enablement gate plus tooling cutover | script-path, import, and scaffolder rewrite | only if a ledgered package alias is needed |
| `tooling/repo-utils` | `tooling/repo-utils` | repo-utils tests and fixture paths | tooling cutover | fixture, workspace-scope, and import rewrite | only if a ledgered package alias is needed |
| `infra/` | `infra/` | `infra/docgen.json`, `infra/tsconfig.json`, `infra/package.json` | enablement gate plus tooling cutover | workspace, docgen, config, and package-metadata rewrite to `packages/tooling/tool/infra` | only if a ledgered package alias or wrapper path is needed |
| `packages/_internal/db-admin/` | `packages/_internal/db-admin/` | `packages/_internal/db-admin/docgen.json`, `packages/_internal/db-admin/package.json`, package-local tests and imports | enablement gate plus tooling cutover | workspace, docgen, import, and package-metadata rewrite to `packages/tooling/tool/db-admin` | only if a ledgered package alias or wrapper path is needed |
| `.agents` | `.agents` | `.codex/agents/*.toml`, `tooling/configs/test/effect-steering-guidance.test.ts`, `.gitmodules`, worktree docs | `P0` census plus agent/tooling cutover | subtree split using the decomposition matrix, skill-tree normalization, and consumer rewrite | yes, but only if ledgered |
| `.aiassistant` | `.aiassistant` | `cspell.json`, `.markdownlint-cli2.jsonc`, root steering/skill trees under `.aiassistant/*` | `P0` census plus agent/tooling cutover | subtree split using the decomposition matrix and root tooling allowlist rewrite | yes, but only if ledgered |
| `.claude` | `.claude` | root scripts, `turbo` inputs, package shell, hook paths | agent/tooling cutover | subtree split using the decomposition matrix plus descriptor normalization away from raw legacy-root paths | yes, but only if ledgered |
| `.codex` | `.codex` | root workspaces, `turbo` inputs, runtime config paths | agent/tooling cutover | subtree split using the decomposition matrix plus descriptor normalization away from raw legacy-root paths | yes, but only if ledgered |
| `packages/runtime/` | `packages/runtime/` | app sidecar launch scripts, `tsconfig` aliases, docs | enablement gate plus repo-memory cutover | launch-surface and import rewrite | yes, but only ledgered wrapper paths or package aliases |
| `packages/editor/runtime/` | `packages/editor/runtime/` | editor app Tauri/dev/build scripts | enablement gate plus editor cutover | launch-surface rewrite | yes, but only ledgered wrapper paths |
| `packages/shared/providers/` | `packages/shared/providers/` | package metadata, `tsconfig` paths, docs | shared-kernel/driver cutover | package path and import rewrite | only if a ledgered package alias is needed |
| `packages/common/ui` | `packages/common/ui` | `apps/editor-app/components.json`, app `tsconfig`, tooling allowlists | enablement gate plus foundation cutover | app config and path rewrite | yes, if a short-lived wrapper path is required |
| `@beep/runtime-protocol` | `@beep/runtime-protocol` | `apps/desktop`, `packages/repo-memory/client`, `packages/editor/protocol` | repo-memory cutover | import split by shared control-plane vs repo-memory contracts | yes, package alias only |
| `@beep/editor-lexical` | `@beep/editor-lexical` | `apps/editor-app`, editor package docs/tests | editor cutover | import rewrite to `@beep/editor-ui` | yes, package alias only |

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
| non-slice tooling workspaces `infra` and `packages/_internal/db-admin` | they already carry legacy workspace, docgen, and package metadata couplings yet are routed into tooling cutover outcomes | include them in every `P2` and `P3` path-coupling census until their target routes are live |
| agent-root consumers in `.codex/agents/*.toml`, `tooling/configs/test/effect-steering-guidance.test.ts`, lint allowlists, and worktree guidance | they hard-code `.agents` or `.aiassistant` and can silently preserve a second agent topology after package moves | rewrite during `P0` census and `P6` agent cutover, then prove each legacy root reaches zero by exact search audit |

## Burn-Down Rule

Every row above needs:

1. an owning cutover
2. a rewrite type
3. a decision on whether temporary compatibility is allowed
4. a validation query proving the coupling reached zero before final closure
5. if a batch needs numeric counts, the exact command and captured output stored
   in the relevant `P0`, cutover, or `P7` evidence pack

If a new path-coupled surface appears during migration, it is added here before
the batch is considered complete.
