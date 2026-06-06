# Batch 3: Scoped Config Design

## Findings

- The right strategy is hybrid, not blanket package-local config. Keep root
  policy canonical, move non-universal root config from `globalDependencies`
  into task-specific inputs only after proof, and use package-local
  `turbo.json` / `biome.json` as narrow overlays for packages that truly need
  different behavior.
- The user's package-local blast-radius idea is directionally good for
  package-owned differences, but it cannot solve all root blast radius.
  Turborepo package configs can override task fields, but cannot override
  global configuration such as `globalDependencies`; root `package.json`,
  lockfile, root `turbo.json`, and any global dependencies still affect the
  whole graph.
- The current repo has one root `turbo.json` and one root `biome.jsonc`. Root
  `turbo.json` treats `.bun-version`, `.nvmrc`, `tsconfig.json`,
  `tsconfig.base.json`, `tsconfig.packages.json`, `package.json`,
  `tstyche.json`, and `vitest.shared.ts` as global dependencies. That is
  correct for some files, too broad for others, and the main safe design
  surface for `rqt-006`.
- Biome should stay root-canonical for common rules. Package-local Biome configs
  are safe only as explicit overlays using Biome v2 nested config semantics,
  ideally `extends: "//"` with package-local exceptions.
- The safest first wedge is to classify root config by consumer, add
  task-specific Turbo inputs for each tool, prove affected dry-runs
  before/after, then pilot package-local configs only where resolved task
  definitions show a real reduction.

## Evidence

- Current source has only root `turbo.json` and root `biome.jsonc`; no
  package-local Turbo/Biome configs were found.
- Current `turbo query affected --packages --base=origin/main --head=HEAD`
  reported all affected entries as `GlobalDepsChanged`.
- Current changed global files include `bun.lock`, `package.json`, and
  `tsconfig.base.json`.
- Current `turbo run build check lint test --affected --dry-run=json` reported
  348 tasks across 87 packages.
- Current `turbo run lint --affected --dry-run=json` and `turbo run docgen
  --affected --dry-run=json` each reported 87 tasks.
- Root package scripts route `build`, `check`, `test`, `lint`, `lint:fix`, and
  `audit` through `beep-cli`; `coverage` and `docgen` still call Turbo
  directly.
- Package scripts are already mechanically consistent: 86 `lint`/`lint:fix`
  delegates, 82 `beep:lint`/`beep:lint:fix` direct Biome scripts, and 82 docgen
  package scripts.
- Batch 1/2 already rejected using this root/global branch as a normal small-PR
  baseline and rejected blanket package-local Turbo configs.
- Official Turbo docs checked: configuration, package configurations, and run
  dry-run JSON. Official Biome docs checked: nested config for big projects.

## Recommended Tasks

| Rank | Task | Expected Impact | Risk | Proof | Rollback |
| --- | --- | --- | --- | --- | --- |
| 1 | Add a scoped-config proof harness/report for synthetic root config changes. | High safety unlock; prevents guessing on global/hash behavior. | Low. | Controlled dry-runs for root `tsconfig.base.json`, `vitest.shared.ts`, `tstyche.json`, `biome.jsonc`, and package-local config edits; record task/package deltas and `resolvedTaskDefinition`. | Remove harness/report; no runtime behavior change. |
| 2 | Reclassify root `globalDependencies` into universal vs task-specific inputs. | High for root config-only PRs. | High correctness risk. | Before/after affected dry-runs for build/check/lint/test/type-test/docgen plus full `audit:github quality` fallback. | Revert `turbo.json`; rerun affected dry-runs and quality. |
| 3 | Add Biome config as a lint-owned input, then pilot nested Biome overlays only for real exceptions. | Medium correctness win; avoids stale lint cache and config sprawl. | Medium until affected behavior is proven. | Root `biome.jsonc` edit should affect lint/lint:fix proof only; package overlay should alter only that package's resolved lint definition. | Delete package `biome.json`; restore root-only Biome path. |
| 4 | Use package-local `turbo.json` only for packages with divergent task outputs/env/inputs. | Medium; reduces root task config bloat without broad drift. | Medium because arrays replace by default. | Inspect `resolvedTaskDefinition`; require `$TURBO_EXTENDS$` where preserving root arrays; compare non-target packages unchanged. | Delete pilot package `turbo.json`; root config remains canonical. |
| 5 | Pair package-owned generated artifacts with package-owned Turbo tasks, starting from repo-export shard design. | High for metadata/docgen-style lanes. | Medium-high migration surface. | `turbo run repo-exports:shard --dry-run=json`; shard cache hit/miss proof; root aggregate remains authoritative. | Disable shard mode and keep current root catalog generator/check. |
| 6 | Teach `create-package` / `config-sync` to generate and validate scoped overlays. | Medium long-term drift prevention. | Medium generated-config churn. | Repo-cli tests, `config-sync:check`, and sample package scaffold snapshot. | Revert generator changes; remove generated overlays. |

## Rejected Ideas

- Blanket `turbo.json` in every package.
- Package-local Biome configs that copy root rules.
- Removing root `package.json` or `bun.lock` from Turbo global behavior.
- Moving root config out of hashes to get speed.
- Trusting hash-only package shards as authoritative proof.
- Caching `lint:fix`.

## Open Questions

- Is `futureFlags.affectedUsingTaskInputs` stable enough for this repo, or
  should it stay shadow-only until a focused PR proves task-level affected
  behavior?
- Which root config files are truly universal?
- Should `tsconfig.base.json` remain global because almost every TS task
  depends on it, or should it become explicit inputs for specific tasks?
- Should root `biome.jsonc` be a lint task input only, or should it be global
  until task-level affected selection is proven?
- Which app packages need package-local Turbo overlays for framework
  outputs/env?
