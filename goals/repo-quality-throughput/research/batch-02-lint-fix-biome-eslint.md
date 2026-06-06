# Batch 2: Lint Fix Biome ESLint

Status: `complete`

Read-only agent lane. The agent returned this report; the orchestrator persisted
it.

## Hotspots

- `lint:fix` is healthy as a fast-path concept, but fragile: clean-tree no-op
  behavior is split across `src/bin.ts`, `src/bin-main.ts`, and
  `Quality/Tasks.ts`.
- Forced aggregate `lint:fix` is intentionally expensive: dry-run showed 87
  affected `lint:fix` tasks, all non-cacheable.
- Docs ESLint scans generated TS that Biome and deprecated-API ESLint ignore.
  Current generated-only probes were small, around 1.0-1.5s, but the ignore
  drift is real.
- Root lint policy sidecars are bounded at concurrency 3, but
  `lint:deprecated-apis` internally runs 24 type-aware ESLint shards
  sequentially with 4GB heap.
- Unscoped `lint --dry-run=json` is not a safe read-only probe: it dry-runs
  Turbo, then source says repo-wide lint sidecars can still execute.

## Source Evidence

- Root scripts route `lint`/`lint:fix` through `beep-cli`: `package.json`.
- Turbo keeps `lint:fix.cache = false`: `turbo.json`.
- Biome fixing mode uses `biome check --write --files-ignore-unknown=true`:
  `packages/tooling/tool/cli/src/commands/Quality/Tasks.ts`.
- Clean-tree no-op spans `bin.ts`, `bin-main.ts`, and `Quality/Tasks.ts`.
- Policy sidecars and their grouping live in
  `packages/tooling/tool/cli/src/commands/Quality/Tasks.ts`.
- Tests cover changed-file Biome args and scoped lint behavior in
  `packages/tooling/tool/cli/test/quality-tasks.test.ts`; no entrypoint no-op
  test was found.
- Generated ignore mismatch exists across `biome.jsonc`,
  `DeprecatedApisESLintConfig.ts`, and `DocsESLintConfig.ts`.
- Staged hook uses correct Biome fixing mode: `lefthook.yml`.
- Focused dry-runs: affected `lint` planned 87 tasks, all local cache hits;
  affected `lint:fix` planned 87 tasks, all `cache=false`.

## Duplicate Or Stale Findings Avoided

- Did not re-file initial lint sidecar grouping; current source already has
  `LINT_POLICY_GROUP_CONCURRENCY = 3`.
- Did not re-file "Biome format instead of check" as current behavior; no
  package script uses `biome format --write`.
- Did not claim ESLint should be removed. Current `beep-effect` uses docs ESLint
  and deprecated-API ESLint.
- Did not run `bun run lint:fix` because the dirty packet files would make it a
  write-mode command.
- Did not use Turbo `--summarize`, per read-only instruction.

## Candidate Implementation Tasks

| Rank | Task | Write Scope | Expected Impact | Risk | Proof | Rollback |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Add regression tests for clean-tree no-op, staged/unstaged/untracked changed-file collection, and no Turbo fan-out unless `--full/--repo` is explicit. | `src/bin*.ts`, `Quality/Tasks.ts`, `test/quality-tasks.test.ts` | High guardrail for the original every-edit path. | Low | 5 warm `bun run lint:fix` clean samples; temp-repo changed-file tests; `bun run test -- --filter=@beep/repo-cli`. | Revert test/helper changes; rerun repo-cli tests. |
| 2 | Mirror generated/build ignores into `DocsESLintConfig`; add config tests. | `DocsESLintConfig.ts`, tests | Low current direct speed, better future-proofing and fewer generated diagnostics. | Low | `eslint --print-config <generated.ts>` returns `undefined`; docs config tests; focused ESLint generated globs. | Revert ignore additions and tests. |
| 3 | Add explicit root lint plan/dry-run behavior so `lint --dry-run=json` cannot execute policy sidecars accidentally. | `Quality/Tasks.ts`, `quality-tasks.test.ts` | Medium resource-safety win for research/proof loops. | Medium | `bun run lint -- --dry-run=json` prints plan only; affected/filter behavior unchanged; repo-cli tests. | Revert dry-run handling. |
| 4 | Add per-sidecar and per-deprecated-API-shard timing; only then consider bounded shard concurrency. | `Lint.command.ts`, `Quality/Tasks.ts`, report artifacts | Medium diagnostic, possible high speedup if one shard dominates. | High for concurrency due memory. | Focused `bun run beep lint deprecated-apis`; compare memory/process snapshot; full `bun run lint` proof if changed. | Revert timing/concurrency; rerun focused deprecated lint. |
| 5 | Evaluate ESLint cache for docs sidecar with content strategy. | `Quality/Tasks.ts`, cache ignore docs if needed | Medium for repeated local root lint, unknown in CI. | Medium | Before/after repeated `bunx eslint .`; ensure config-change invalidation; full lint proof. | Remove cache args/cache location. |

## Resource Risks

- Current worktree is dirty under `goals/repo-quality-throughput`; write-mode
  lint probes would mutate packet files.
- Remote Turbo cache auth warning appeared during dry-runs; local cache evidence
  is still usable, remote evidence is not.
- Biome LSP and Graphiti proxy were already running; no heavy Turbo/Vitest/docgen
  lane was active.
- Deprecated ESLint concurrency must be treated carefully because current source
  sets `NODE_OPTIONS=--max-old-space-size=4096`.

## Do Not Do

- Do not replace `biome check --write` with `biome format --write`.
- Do not cache `lint:fix`; protect changed-file fast path instead.
- Do not bypass `beep-cli` with a root-only script.
- Do not remove ESLint sidecars without a proof-parity replacement.
- Do not use unscoped `bun run lint -- --dry-run=json` as a read-only probe
  until sidecar dry-run semantics are fixed.

## Memory Note

Graphiti MCP note from the reviewer: the repo proxy process exists, but this
session has no callable `graphiti-memory` MCP tool namespace, so shared-memory
MCP calls were skipped and the reviewer used local memory plus live source.
