# Batch 2: Repo CLI Orchestration

Status: `complete`

Read-only agent lane. The agent returned this report; the orchestrator persisted
it.

## Hotspots

1. Yeet duplicate feedback before full proof is the main current-PR win. Current
   `turbo run build check lint test --affected --dry-run=json` reports `348`
   tasks: `87` each for build/check/lint/test, `107` misses.
   `turbo query affected --tasks build check lint test` reports all `348` as
   `TaskGlobalDepsChanged`.
2. Yeet plan construction emitted `feedback:build/check/lint/test` before
   `full:pre-push` for `verify`, and before
   `commit -> full:pre-push -> push` for `publish`.
3. RepoRun has planning models, output capture, raw log refs, and resume flags,
   but no timing fields or runtime resume skip. Existing tests intentionally
   assert feedback resume is disabled until runtime skip exists.
4. `quality github-checks pre-push` is a monolithic sequential command:
   quality, secrets, security, SAST, Nix. It preserves proof, but local users
   cannot get a cheap structured plan/timing explanation before paying the full
   wait.
5. Resource governance is local-process-only. Turbo concurrency is bounded in
   several places, but there is no repo-owned cross-agent queue/lock to prevent
   multiple all-up quality/Yeet runs from saturating the workstation.

## Source Evidence

- Root scripts route `build`, `check`, `test`, `lint`, and `audit` through
  `beep-cli`; `coverage` remains a separate Turbo script:
  `package.json`.
- Yeet remains proof-mode, not canonical replacement: `AGENTS.md`.
- Yeet feedback tasks are `build/check/lint/test`, with `--concurrency=3`,
  `--summarize`, and stream UI:
  `packages/tooling/tool/cli/src/commands/Yeet/internal/Planner.ts`.
- Yeet mode steps included feedback before full proof for `verify`/`publish`:
  `packages/tooling/tool/cli/src/commands/Yeet/internal/Planner.ts`.
- Turbo plan hydration already uses `turbo query affected` plus
  `turbo query ls`:
  `packages/tooling/tool/cli/src/commands/Yeet/internal/Handler.ts`.
- Yeet phases execute serially at `concurrency: 1`:
  `packages/tooling/tool/cli/src/commands/Yeet/internal/Handler.ts`.
- RepoRun captured results lack elapsed time/status timing fields:
  `packages/tooling/tool/cli/src/internal/repo-run/RepoRun.models.ts`.
- Resume exists in the model, but conservative resume is not active for
  repo-scoped feedback:
  `packages/tooling/tool/cli/src/internal/repo-run/RepoRun.models.ts` and
  `packages/tooling/tool/cli/test/yeet.test.ts`.
- `quality` and `pre-push` are sequential full proof surfaces:
  `packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts`.
- PR Check has split lanes, while build is push-only:
  `.github/workflows/check.yml`.

## Duplicate Or Stale Findings Avoided

- Did not re-file Yeet reviewed-staged publish safety. Handler already rejects
  untracked/unstaged drift and restages only reviewed paths.
- Did not re-file workspace package catalog hydration. `TurboPlanSnapshot`
  packages are already populated from `turbo query ls`.
- Did not rank `bunx turbo` launcher replacement. Batch 1 found it low-impact.
- Did not propose caching `lint:fix`; it is intentionally non-cacheable.
- Did not propose making Yeet canonical before proof-mode gates pass.

## Candidate Implementation Tasks

| Rank | Task | Write Scope | Expected Impact | Risk | Proof | Rollback |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Add Yeet `skipFeedbackWhenFullProofIsGuaranteed` behavior for `verify`/`publish`, keeping repair feedback intact. | Yeet planner/handler/tests | High on global-input branches: removes up to 348 affected feedback tasks before full `pre-push`. | Medium | `bun run beep yeet verify --plan --json`; `bun run test -- --filter=@beep/repo-cli`; `bun run audit:github pre-push`; PR checks. | Revert task commit; verify plan again includes feedback; rerun repo-cli tests. |
| 2 | Add RepoRun execution/timing summary fields: `startedAt`, `endedAt`, `elapsedMs`, phase totals, first failure, raw log refs. | `src/internal/repo-run`, Yeet artifacts/tests | Medium diagnostic unlock; makes before/after matrix and failure aggregation cheap. | Low | Focused repo-cli tests; `bun run beep yeet verify --plan --json`; failing-step fixture test for issue index/artifacts. | Revert schema/result additions; keep existing raw log capture path. |
| 3 | Add `quality github-checks <mode> --plan --json` for proof-surface hydration without execution. | `Quality.command.ts`, `RepoRun.proofs.ts`, tests | Medium safety unlock; lets Yeet and humans prove fallback coverage before removing waits. | Low-medium | `bun run beep quality github-checks pre-push --plan --json`; tests assert quality/pre-push sequence parity. | Revert command flags; canonical `bun run audit:github quality/pre-push` remains unchanged. |
| 4 | Shadow-only conservative resume metadata for readonly feedback: record fingerprints/cache states, but do not skip until full proof parity is proven. | `internal/repo-run`, `.beep/yeet` artifacts, Yeet tests | Medium future win; avoids redoing successful feedback after interruption. | Medium-high | Two-run Yeet fixture; assert no skip without matching fingerprint and required full proof. | Disable resume reader; leave writer artifacts ignored. |
| 5 | Add a repo-owned quality-run guard/queue in report-only or opt-in mode to detect simultaneous all-up quality/Yeet runs. | `internal/repo-run` or new Quality helper | Resource-safety win on multi-agent workstation. | Medium | Unit tests around lock/queue behavior; manual `ps` probe; no default blocking until proven. | Remove guard command or default it off. |

## Resource Risks

- `--summarize` writes Turbo run artifacts during execution; keep read-only
  research on `--dry-run=json`.
- Yeet plan hydration currently fetches base refs; dry-run planning is not
  completely `.git`-immutable.
- Full `pre-push` invokes Docker OSV/Semgrep and Nix; do not run casually in
  research.
- Cross-agent saturation is real: local Turbo concurrency is bounded, but
  multiple agents can each launch bounded runs.

## Do Not Do

- Do not remove `pre-push`, secrets, security, SAST, Nix, or PR checks.
- Do not make Yeet canonical until its proof PR is green and the Yeet skill
  exists.
- Do not implement resume skipping before shadow proof and fallback proof
  parity.
- Do not hand-edit generated metadata or write Batch 2 files from a read-only
  agent.
- Do not use `turbo query affected --output json`; this installed Turbo
  rejected that flag. Use default JSON extraction or supported dry-run JSON
  shapes.
