# Yeet Operator Clarity Spec

## Objective

Yeet gives autonomous operators a concise, structured view of branch readiness:
`yeet status` summarizes local state and latest Yeet artifacts without touching
GitHub by default, `--summary` provides opt-in compact monitor/closeout output,
and failed-lane remediation hints prefer evidence near the failure instead of
the last unrelated needle in giant proof logs.

## Non-Goals

- No repository knowledge-graph workflow changes.
- No pglite flake repair.
- No weakening of full local proof, hosted check names, or manual fallback
  lanes.
- No default output compatibility break; compact summaries are opt-in first.
- No new package; all code lands in `packages/tooling/tool/cli`.
- No dependency or lockfile changes.

## Source Hierarchy

1. User objective and operator reflections from 2026-06-11.
2. `AGENTS.md`, `CLAUDE.md`, and required skills.
3. Governing architecture/package standards.
4. This `SPEC.md`.
5. `PLAN.md`.
6. `GOAL.md`.
7. Supporting `research/`, `ops/`, and `history/` files.

Higher sources outrank lower sources when they conflict.

## Target Surfaces

- `packages/tooling/tool/cli/src/commands/Yeet/**`
- `packages/tooling/tool/cli/test/yeet.test.ts`
- `.claude/skills/yeet/SKILL.md`
- Repo-export catalog artifacts when new test exports are added
- This packet's status, evidence, and reflection files

## Requirements

### E1 - Local-first `yeet status`

- Add `bun run beep yeet status`.
- Default behavior is local-only: current branch, base/head, staged/unstaged/
  untracked counts, dirty/clean state, latest `verdict.json`, latest
  `pr-closeout.json`, and the next suggested Yeet command.
- `--remote` is the only mode that calls GitHub. It may fetch/update base state
  and should include current PR number/url/state plus mergeability/check summary
  when available.
- `--json` emits a schema-valid `yeet-status/v1` snapshot.
- `--plan --json` emits a valid Yeet plan for the local and optional remote
  status reads.
- Running status must not overwrite the latest `verdict.json`; if it writes a
  run artifact, use `status.json`.

### E2 - Opt-in compact summaries

- Add `--summary` to monitor, closeout, and publish-with-monitor paths.
- Existing default output remains unchanged.
- Summary output should print one concise operator block: branch/PR, local
  verdict outcome, hosted check verdict when known, closeout issue counts when
  known, key artifact paths, and the next command.
- `--summary --json` is not a separate protocol; JSON remains the existing
  machine-readable object for the command.

### E3 - Failure-local remediation hints

- Remediation for failed verdict lanes and issue packets should inspect output
  near failure markers or the failed step's captured output before falling back
  to broad tail scanning.
- The verdict failed-lane id must remain authoritative when hint text is
  ambiguous.
- Add focused tests proving a later unrelated successful lane needle does not
  replace the remediation for the real failed lane.

### E4 - Skill text update

- Update `.claude/skills/yeet/SKILL.md` to prefer `yeet status` before raw log
  scanning, document `--remote`, document `--summary`, and keep closeout gates
  unchanged.

## Constraints

- Effect-first and schema-first repo law applies. New data models are schemas
  first with `$I.annote` / `$I.annoteSchema`.
- Use existing `RepoRunContext`, `runRepoCommandCapture`,
  `runOutputPathForContext`, `buildYeetVerdict`, `PrCloseoutReport`, and
  `@beep/repo-cli/test/Yeet` patterns where practical.
- New exported helpers need JSDoc with `@example`, `@category`, and
  `@since 0.0.0`.
- Regenerate repo-export catalog after any new exported test helpers.

## Acceptance Criteria

- [x] `yeet status` works locally on a branch with and without prior Yeet
      artifacts.
- [x] `yeet status --json` decodes as `yeet-status/v1` and does not overwrite
      `verdict.json`.
- [x] `yeet status --remote --plan --json` contains remote status read steps.
- [x] `yeet monitor --summary --plan --json` and
      `yeet closeout --summary --plan --json` produce valid plans.
- [x] `--summary` output is opt-in and existing default monitor/closeout output
      is unchanged when the flag is absent.
- [x] Failure-local remediation hint tests cover the prior tail-needle
      misattribution case.
- [x] Yeet skill text documents the new operator path honestly.
- [x] No unrelated refactors or formatting churn.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Packet launcher size | `test "$(wc -m < goals/yeet-operator-clarity/GOAL.md)" -le 4000` | Passes |
| Manifest JSON | `jq . goals/yeet-operator-clarity/ops/manifest.json` | Passes |
| Packet refs | `rg -n "yeet-operator-clarity|GOAL.md|agentLaunchers|packetAnchorDocument" goals/yeet-operator-clarity` | Expected refs |
| Focused tests | `bunx --bun vitest run packages/tooling/tool/cli/test/yeet.test.ts` | Passes |
| Status smoke | `bun run beep yeet status --json` | Schema-valid JSON |
| Plan smokes | `bun run beep yeet status --remote --plan --json && bun run beep yeet monitor --summary --plan --json && bun run beep yeet closeout --summary --plan --json` | Valid plans |
| Catalog | `bun run repo-exports:catalog && bun run repo-exports:catalog:check` | Passes |
| Reflection | `bun run beep lint reflection-artifacts` | Passes |
| Whitespace | `git diff --check -- goals/yeet-operator-clarity packages/tooling/tool/cli/src/commands/Yeet packages/tooling/tool/cli/test/yeet.test.ts .claude/skills/yeet/SKILL.md` | Passes |

## Stop Conditions

- Required source files are missing or materially contradictory.
- The implementation would exceed named scope.
- A change would weaken full proof, hosted checks, or closeout gates.
- Verification requires unnamed credentials, cost, destructive side effects, or
  policy approval.
- The same blocker repeats after reasonable investigation.

## Exception Ledger

| Exception | Scope | Owner | Rationale | Removal condition |
| --- | --- | --- | --- | --- |
| None | N/A | N/A | N/A | N/A |
