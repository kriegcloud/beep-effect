# P4: Ranked Candidate Inventory

## Status

**COMPLETED**

## Objective

Build a durable, evidence-backed inventory of stale, unused, duplicate, redundant, or low-value cleanup candidates, then route approved candidates one at a time to a fresh executor session.

## Current Baseline

- The earlier `apps/editor-app` Pigment dependency blocker recorded in P1 through P3 was resolved after P3 by commit `83166a377d` (`fix(editor-app): declare pigment build deps`).
- P4 ranking therefore starts from a repo baseline where `bun run check` and `bun run build` are green again.
- This orchestrator session does not delete candidates. It only builds the ranked list, presents one candidate at a time, and records approvals or rejections.

## Candidate Loop Contract

1. Build or refine the ranked inventory.
2. Present one candidate at a time in descending confidence order.
3. Do nothing destructive until the user answers `yes`.
4. When the user approves a candidate, update the checklist and manifest, then hand the candidate to a fresh executor session using `prompts/CANDIDATE_EXECUTOR_PROMPT.md`.
5. After the executor cleanup finishes, record verification and commit evidence, then stop for confirmation before moving to the next candidate.
6. Record rejected or deferred candidates explicitly.
7. P4 closes only when the inventory is exhausted or the user explicitly ends the loop.

## Ranking Rubric

Each candidate is ranked using three inputs:

- confidence: how strongly repo evidence suggests the surface is stale or low-value
- cleanup value: how much active repo noise, dependency load, or maintenance burden the cleanup removes
- blast radius: how likely the candidate is to affect live development flows

Tie-break order:

1. higher confidence
2. higher cleanup value
3. lower blast radius

## Ranked Inventory

| Rank | Candidate ID | Category | Confidence | Decision | Notes |
|---|---|---|---|---|---|
| 1 | `P4-C01` | Empty excluded workspace | `0.95` | `REJECTED` | User wants to preserve `scratchpad/` as an easy sandbox for ideas, so this is intentionally retained despite the low activity footprint |
| 2 | `P4-C02` | Orphaned disabled tooling surface | `0.91` | `COMPLETED` | Approved and completed: the dead Lost Pixel lane is removed while Storybook remains in place |
| 3 | `P4-C03` | Unused internal package | `0.82` | `REJECTED` | User wants to preserve `packages/_internal/db-admin` for future shared-migration work across vertical slices |
| 4 | `P4-C04` | Unused provider package | `0.68` | `COMPLETED` | Approved and completed: the unconsumed shared providers package and its stale active wiring are removed from the live repo graph |

## Candidate Details

### `P4-C01` — `scratchpad/`

- `id`: `P4-C01`
- `path`: `scratchpad/`
- `category`: Empty excluded workspace
- `confidence`: `0.95`
- `evidence`: `scratchpad/index.ts` is empty, `scratchpad/package.json` has no scripts, and the workspace has only three tracked files. `rg -n "scratchpad" . --glob '!node_modules/**' --glob '!bun.lock'` shows the repo mostly carrying exclusions, filters, and tsconfig references for it rather than consuming it.
- `dependents_or_references`: root `package.json` workspace list plus exclusion filters in root `dev`, `build`, `check`, `test`, `lint`, and `docgen`; `tsconfig.packages.json`; `tsconfig.quality.packages.json`; `syncpack.config.ts`; `lefthook.yml`; `biome.jsonc`; `cspell.json`; `_typos.toml`; `tooling/cli/src/commands/TsconfigSync.ts`.
- `script_or_ci_references`: excluded from the main repo scripts rather than owned by any live CI or app flow.
- `tsconfig_or_alias_references`: `scratchpad/tsconfig.json`; root package-ref files include it as a workspace project.
- `generated_docs_or_inventory_impact`: no active docgen participation; removal should reduce workspace-graph and ignore-surface noise rather than affect published docs.
- `historical_doc_policy`: not historical evidence; this is a live workspace surface.
- `managed_artifact_impact`: `config-sync`, root tsconfig refs, and the lockfile may all shrink because `scratchpad/package.json` currently pulls in a large workspace dependency fan-in.
- `expected_value`: removes a tracked but empty workspace and the special-case root exclusions that currently exist only to accommodate it.
- `blast_radius`: Medium. Root workspace metadata changes, but no live code imports or package consumers were found.
- `recommended_action`: Rejected for deletion. Preserve as the repo's lightweight sandbox for trying ideas.
- `verification_commands`: `rg -n "scratchpad" . --glob '!node_modules/**' --glob '!bun.lock'`; `bun run config-sync`; `bun run version-sync --skip-network`; `bun run lint:repo`; `bun run lint`; `bun run check`; `bun run test`

### `P4-C02` — Disabled Visual Regression Residue

- `id`: `P4-C02`
- `path`: root `test:visual` wiring, root `lost-pixel` dependency, and `packages/common/ui/lostpixel.config.ts`
- `category`: Orphaned disabled tooling surface
- `confidence`: `0.91`
- `evidence`: root `package.json` still exposes `test:visual` and still depends on `lost-pixel`, but `packages/common/ui/package.json` now sets `test:visual` and `test:visual:update` to echo that visual regression is disabled. `rg -n "test:visual|lost-pixel|lostpixel|visual regression" .github package.json packages tooling .claude .codex --glob '!node_modules/**' --glob '!bun.lock'` only finds the root script, the root dependency, the disabled package scripts, the stale `lostpixel.config.ts`, and an ESLint ignore entry.
- `dependents_or_references`: root `package.json`; `turbo.json`; `packages/common/ui/package.json`; `packages/common/ui/lostpixel.config.ts`; `tooling/configs/src/eslint/ESLintConfig.ts`.
- `script_or_ci_references`: root `test:visual`; `@beep/ui` `test:visual` and `test:visual:update`; no active `.github` workflow reference remains.
- `tsconfig_or_alias_references`: none found.
- `generated_docs_or_inventory_impact`: no docgen or generated-doc ownership.
- `historical_doc_policy`: not historical evidence; this is active tooling residue.
- `managed_artifact_impact`: root package metadata, Turbo task wiring, and the lockfile should all shrink if the disabled lane is fully removed.
- `expected_value`: removes a dead testing lane and a direct dependency that no current script actually uses.
- `blast_radius`: Low to medium. Storybook remains active, but visual-regression automation is already effectively disabled.
- `recommended_action`: Completed. The dead Lost Pixel residue was removed end-to-end without touching Storybook.
- `verification_commands`: `rg -n "test:visual|lost-pixel|lostpixel" . --glob '!node_modules/**' --glob '!bun.lock'`; `bun run version-sync --skip-network`; `bun install --lockfile-only`; `bun run lint:repo`; `bun run lint`; `bun run test:storybook`

### `P4-C03` — `packages/_internal/db-admin`

- `id`: `P4-C03`
- `path`: `packages/_internal/db-admin/`
- `category`: Unused internal package
- `confidence`: `0.82`
- `evidence`: no package manifests depend on `@beep/db-admin`, and repo-wide import search only finds self-owned README, test, docgen, and tsconfig alias references. `packages/_internal/db-admin/src/index.ts` exports only `VERSION`.
- `dependents_or_references`: root `tsconfig.json` path aliases; `tsconfig.packages.json`; `tsconfig.quality.packages.json`; `tstyche.json`; the package's own docs, tests, and docgen config.
- `script_or_ci_references`: only standard workspace tasks; no app, service, or CI workflow owns it.
- `tsconfig_or_alias_references`: root path aliases plus project references.
- `generated_docs_or_inventory_impact`: package-local docs and docgen surfaces would need regeneration or removal.
- `historical_doc_policy`: preserve historical mentions if any surface outside the package needs them, but none were found in active spec docs.
- `managed_artifact_impact`: removing the workspace would require `config-sync`, `docgen`, and version or lockfile refresh.
- `expected_value`: removes a placeholder workspace whose implementation, README example, tests, and generated docs currently revolve around a version constant only.
- `blast_radius`: Medium. Workspace-graph changes are real, but no live consumers were found.
- `recommended_action`: Rejected for deletion. Preserve as planned future shared-migration infrastructure across vertical slices.
- `verification_commands`: `rg -n "@beep/db-admin|db-admin" . --glob '!node_modules/**' --glob '!bun.lock' --glob '!specs/**'`; `bun run config-sync`; `bun run docgen`; `bun run version-sync --skip-network`; `bun run lint`; `bun run check`; `bun run test`

### `P4-C04` — `packages/shared/providers`

- `id`: `P4-C04`
- `path`: `packages/shared/providers/`
- `category`: Unused provider package
- `confidence`: `0.68`
- `evidence`: no package manifests or source imports consume `@beep/shared-providers` or its subpaths outside the package's own README, tests, docgen config, tsconfig wiring, and identity registry. Unlike `P4-C03`, the package does contain real 1Password configuration code, so intent is less certain.
- `dependents_or_references`: root `tsconfig.json`; `tsconfig.packages.json`; `tsconfig.quality.packages.json`; `tstyche.json`; `packages/common/identity/src/packages.ts`; package-local docs, tests, and docgen config.
- `script_or_ci_references`: only standard workspace tasks; no dedicated CI or app owner found.
- `tsconfig_or_alias_references`: root path aliases plus project references.
- `generated_docs_or_inventory_impact`: package-local docs and docgen outputs would need cleanup if the workspace is removed.
- `historical_doc_policy`: preserve historical mentions if the user wants to keep 1Password-provider work as roadmap evidence.
- `managed_artifact_impact`: removing the workspace would require config, docgen, and identity-registry cleanup.
- `expected_value`: removes a currently unconsumed provider surface and its identity registration if the repo no longer plans to ship it.
- `blast_radius`: Medium to high. The code is real and could still represent near-term planned work even though it has no current consumers.
- `recommended_action`: Completed. The unconsumed shared-providers package and its stale active repo wiring were removed.
- `verification_commands`: `rg -n "@beep/shared-providers" . --glob '!node_modules/**' --glob '!bun.lock' --glob '!specs/**'`; `bun run config-sync`; `bun run docgen`; `bun run version-sync --skip-network`; `bun run lint`; `bun run check`; `bun run test`

## Approved Cleanup Log

| Candidate ID | Verification Summary | Commit | Notes |
|---|---|---|---|
| `P4-C02` | Active `lost-pixel` or `test:visual` refs are now gone outside spec history; `version-sync`, `bun install --lockfile-only`, `lint:repo`, and `lint` passed; `test:storybook` still fails because the local Playwright browser binary is missing | `chore(repo): remove stale visual-regression residue` | Completed in one approved candidate cleanup without widening into Storybook or other browser-test surfaces |
| `P4-C04` | Active `shared-providers` and `@1password/sdk` refs are now gone outside spec history; `config-sync`, `docgen`, `version-sync`, `bun install --lockfile-only`, `lint`, `check`, and `test` all passed | `chore(repo): remove stale shared providers package` | Completed in one approved candidate cleanup; the inventory is now exhausted |

## Deferred Or Unreviewed Candidates

| Candidate ID | Status | Notes |
|---|---|---|
| `P4-C01` | `REJECTED` | User chose to keep `scratchpad/` as an idea-sandbox workspace |
| `P4-C03` | `REJECTED` | User wants to keep `db-admin` for future shared migrations between vertical slices |

## Exit Gate

P4 is complete only when the ranked inventory is durable, every approved candidate has verification, checklist, and commit evidence, and either the inventory is exhausted or the user explicitly ends the loop.
