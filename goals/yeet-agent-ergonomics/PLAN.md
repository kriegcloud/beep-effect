# Yeet Agent Ergonomics Plan

One PR. One commit per implementation phase (P1, P2, P3); P0 grounding notes
ride with the P1 commit. Phase order respects the dependency chain:
E1 summarizer → E4 packet helper → E1/E2 refusals route through it; E5 verdict
before E6 (PR body uses the lane summary).

## P0 - Grounding

- Re-read `packages/tooling/tool/cli/src/commands/Yeet/internal/Handler.ts`,
  `Planner.ts`, `Closeout.ts`, `QualityIssueIndex.ts`, `Yeet.command.ts`,
  `Yeet.errors.ts`, and `Quality.command.ts` (changeset lanes ~L738-763 and
  pre-push composition ~L1051-1065).
- Verify the code map and line refs in `research/session-findings.md` against
  the current tree (they were verified 2026-06-11; drift is possible).
- Skim `packages/tooling/tool/cli/test/yeet.test.ts` for the pure-helper test
  style and the temp-git-repo integration pattern (~L406-439), and confirm the
  `@beep/repo-cli/test/Yeet` export surface.
- Record findings + any design corrections in `research/grounding.md`.

## P1 - Correctness (commit 1)

- E1: `--staged-only` flag; `YeetStashState` schema; `stashUnstagedWorktree` /
  `restoreStashedWorktree` (sha+marker lookup, `Effect.ensuring`, keep-on-
  conflict); partial-staging refusal; skip restage when staged-only; flag
  incompatibility guards; `summarizePublishPaths` used by ALL intent refusals.
- E4: `failPublishScopeWithPacket` helper; route all intent refusal sites
  through it; add `typos` needle to `knownSubLaneHints`.
- E2: `--allow-stale-base` flag; `YeetBaseFreshness` schema;
  `assessBaseFreshness` + pure `overlappingBasePaths`; warn/refuse wiring at
  the top of `runPublishMode` (all publish variants incl. `--push-only`).
- E3: `changeset` needle in `knownSubLaneHints`; dynamic-lane code comment.
- Tests: summarizer formatting; intersection refusal; temp-repo stash
  lifecycle + pop-conflict; overlap matrix; warn vs refuse integration;
  hint extraction (changeset, typos); packetized intent failure writes
  `quality-issue-index.json` + markdown packet.

## P2 - Flow completion (commit 2)

- E5: new `internal/Verdict.ts` (`yeet-verdict/v1`, `YeetVerdictLane`,
  `YeetVerdict`); step-result `Ref` threaded through `runPlanExecution`;
  written on every success/failure exit of all modes; skipped in `--plan`;
  `buildYeetVerdictForTesting`.
- E6: `--pr` flag; `findOpenPullRequest` (Option variant of
  `runGhPullRequestView`); `buildPrBody` → `pr-body.md` + `--body-file`;
  `ensurePullRequest` skip-if-OPEN; call sites after publish push and after
  early push; monitor pre-validation skip when `--pr`; plan step
  `publish:02-pr-create`.
- Tests: verdict builder (repair commands from hints, skipped/not-run lanes,
  schema round-trip); verdict written on verify success and forced failure;
  planner shows pr-create step in both positions; `prBodyFromCommits`
  formatting.

## P3 - QoL + docs (commit 3)

- E7: closeout flags (`--reply-thread`, `--reply-body`, `--resolve-thread`);
  `PrCloseoutWriteAction`; id validation against fetched threads; 16 KiB body
  cap; mutations via `ghOutput`; re-collect threads before gates; report
  `writeActions` with decode-compat default.
- E8: lock-staleness check in `acquireFullProofLock` (decode → pid liveness,
  EPERM=alive → replace stale / refuse live / refuse unreadable); pure
  `proofLockDispositionForTesting`.
- E9: `lockfileChangedSinceBase`; `forceTurbo` in `YeetRunPlanModeOptions`
  (constructor default false); `TURBO_FORCE=true` env on feedback + proof
  steps; log line.
- E10: `.claude/skills/yeet/SKILL.md` updates per SPEC.
- Tests: write-action token parsing + unknown-id refusal + argv construction;
  report decode compat; lock disposition matrix + temp-dir replace path;
  planner env assertions for forced lanes.
- Regenerate repo-exports catalog (new `*ForTesting` exports) last, after the
  tree is stable.

## P4 - Verify + publish

- Full local proof green (`bun run beep yeet verify`).
- Publish dogfooding the new surface: leave deliberate untracked residue in
  the worktree and run
  `bun run beep yeet publish --staged-only --pr --monitor --message "..."`
  for the final commit. Confirm the PR was created by Yeet, the stash was
  restored, and `verdict.json` exists for the run.

## P5 - Closeout

- `bun run beep yeet closeout --require-greptile-score 5/5
  --require-greptile-issues 0 --require-review-comments 0`.
- Address review findings via follow-up commits through the same publish path;
  reply/resolve addressed threads with the new write-back flags (E7
  dogfooding).
- Record the closeout artifact path and PR URL in `history/` and update
  `README.md` status + `ops/manifest.json` phase statuses.

## Current Blockers

None.
