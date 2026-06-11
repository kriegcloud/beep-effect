# Operator-Session Findings and Implementation Designs

Freshness: 2026-06-11. Code map line refs verified against `main` at the merge
of PR #226 (`303bb88d4a`). Re-verify during P0 grounding; record drift in
`research/grounding.md`.

## Session evidence (why each enhancement exists)

Source: a real operator session (2026-06-11) driving a dependency-catalog
update through repair/verify/publish/closeout to merged PR #226.

| # | Enhancement | What happened |
|---|---|---|
| E1 | `--staged-only` + summarized refusals | Publish refused hundreds of untracked `graphify-out/wiki/*` paths; full enumeration scrolled the remedy away; operator hand-rolled `git stash push --keep-index --include-untracked`, which later produced pop conflicts because `--keep-index` also captures staged content. ~20 min lost. |
| E2 | Base-freshness gate | Branch merge-base was 57 commits behind `origin/main` with 3 overlapping files (incl. an identical `_typos.toml` fix landed by a sibling agent). Only git's non-fast-forward rejection (remote branch happened to exist) prevented a conflicted PR. Manual mid-flight rebase with conflicts followed. |
| E3 | Changeset parity | Hosted Repo Sanity failed on a missing changeset. NOTE: local pre-push already runs `changeset status --since=origin/main` — the session pushed `--no-verify` and never hit it. Real gap: no sub-lane hint, no skill docs. |
| E4 | Packetized intent failures + typos hint | Both commit-phase failures (untracked refusal, typos pre-commit hook) produced no failure packet; diagnosis required grep-mining raw output. `knownSubLaneHints` has `cspell` but not `typos`. |
| E5 | verdict.json | A 35k+ line verify log had to be grep-mined for the verdict; the end-of-run packet was good but only covers some failure classes and there is no machine-readable per-lane summary. |
| E6 | `publish --pr` | Flow ends at push; `gh pr create` was manual; `yeet monitor` errors without a PR. |
| E7 | Closeout write-backs | Closeout's pr-closeout.json was excellent for reading threads, but replying/resolving required raw `gh api graphql` mutations. |
| E8 | Lock staleness | Two killed runs left stale `.beep/yeet/quality-lock` files requiring manual `rm`, despite the lock already recording a pid. |
| E9 | Deps-change forcing | After the lockfile changed, plain `bun run check`/`test`/`lint` passed via turbo cache replays, masking dependency-induced breakage (`@beep/box` lint, oip-web build) that only yeet's force-executed lanes caught. |
| E10 | Skill text | Ground First lacks a freshness check; packet-coverage text overpromises; changeset requirement undocumented. |

## Verified code map

- Command/flags: `packages/tooling/tool/cli/src/commands/Yeet/Yeet.command.ts`
  (`yeetPublishCommand` L224, flag wiring L287-300).
- Publish pipeline: `internal/Planner.ts` `yeetPlanPhases` L576-594
  (prepare → feedback → commit → early-publish → full → publish → monitor);
  `commitStep` L317-337; `DEFAULT_YEET_PACKET_DIR` L34; `bunRunStep` env
  Option L156/L170.
- Intent validation: `internal/Handler.ts` `collectPublishIntent` L729-759,
  `publishScopeError` L389-394 (full enumeration via `formatPublishPaths`,
  bypasses packets), `publishPathsOutsideIntent` L352-360,
  `validatePublishIntentStillSafe` L761-791, `stageReviewedPublishIntent`
  L809-833 (re-runs `git add` — the partial-staging hazard for E1),
  `collectStagedPublishPaths` L681, `collectUnstagedTrackedPaths` L687,
  `collectUntrackedPaths` L693, `collectDiffFingerprint` L1169.
- Packets: `writeIssueArtifacts` L1375-1408, `failWithIssueArtifacts`
  L1512-1530 (wired for commit/feedback/full/publish phase step failures; NOT
  for intent validation).
- Hints: `internal/QualityIssueIndex.ts` `knownSubLaneHints` L435-491,
  `knownSubLaneHintFromOutput` L513-520 (last-16KiB scan; latest match wins
  L493-511), `labelCategoryForStep` L402-404 (maps a "changeset" label to
  `changeset-policy` — broad pre-push failures don't carry that label, hence
  the needle gap), `fallbackIssueFromResult` L792-828. `QualityIssue.subCategory`
  is a free string (L223) — no LiteralKit ripple for new subcategories.
- Lock: `acquireFullProofLock` L1204-1235; `YeetProofLockState` L263-275
  already records `pid` + `startedAt`; existence-checked only;
  `releaseProofLock` L1237-1240; acquire/release via `Effect.acquireUseRelease`
  in `runProofPhase` L1251-1260. Pid-liveness idiom to reuse:
  `Graphiti/internal/ProxyOps.ts` L985-992 (`process.kill(pid, 0)` in
  `Effect.sync` try/catch; treat `EPERM` as alive).
- Proof surfaces: `internal/repo-run/RepoRun.proofs.ts` L121-144
  (quality / review-fix / pre-push). Changeset lane ALREADY EXISTS:
  `Quality.command.ts` `githubCheckChangesetStatusLanes` L738-763 (lane
  `quality:changeset-status`, runs `bun run changeset:status:since-main`,
  skipped on main), composed in `runPrePushChecks` L1051-1065. The lane is
  appended dynamically — it is intentionally absent from the static lane list;
  add a code comment saying so.
- Base refresh: `refreshBaseRef` L654-671 (fetch only; plain refs supported via
  `rev-parse --verify` L668-670 — lets tests pass a local ref as `--base`).
  No merge-base/divergence logic exists anywhere in Yeet.
- Closeout: `internal/Closeout.ts` `PrCloseoutReport` L402-421 (`states`
  decode-compat default pattern at L413-416 — copy for `writeActions`);
  thread ids come from `reviewThreadsPageQuery` L442-463 (GraphQL node ids,
  already surfaced in the closeout artifact); only write today is the
  Greptile retrigger `gh pr comment` L1110-1112; `ghOutput` is the gh runner.
- Monitor: `runGhPullRequestView` L495-524 (fails when no PR);
  `validateOpenPullRequest` L526-546; `validateMonitorBranch` L481-493;
  monitor pre-validation call in `validateMonitorGuards` ~L639-641.
- Verdict path helper: `runOutputPathForContext` L1160 →
  `.beep/yeet/runs/<runId>/<file>`; `runId = safeArtifactName(branch)` L1142.
- Tests: `packages/tooling/tool/cli/test/yeet.test.ts` — pure-helper style via
  `@beep/repo-cli/test/Yeet` `*ForTesting` exports (imports L1-31); temp-git-
  repo integration pattern L406-439; hint-extraction test ~L1006.
  New `*ForTesting` exports require repo-exports catalog regen.
- Quality lanes spawn with `extendEnv: true` (`Quality.command.ts` L661) —
  step-level env vars (E9 `TURBO_FORCE`) propagate to transitive turbo runs.

## Per-enhancement designs

### E1 — `--staged-only` (auto-stash) + summarized refusals

Decision: stash AFTER commit, not before. Order: validate → commit reviewed
index (skip `stageReviewedPublishIntent` re-add) →
`git stash push --include-untracked -m yeet-staged-only/<runId>/<iso>` (stash
holds exactly the unstaged+untracked residue; `--keep-index` pitfall avoided)
→ proof on clean tree → push → restore.

- New schema `YeetStashState { marker, stashSha, createdAt }`.
- `stashUnstagedWorktree`: detect "No local changes" → `O.none()`; capture sha
  via `git rev-parse stash@{0}`.
- `restoreStashedWorktree`: verify `stash@{0}` sha matches, else locate by
  `git stash list --format=%H %gd %s` + marker; `git stash pop <ref>`; on
  failure return `{ restored: false, stashRef, marker }`, loud stderr warning,
  record in verdict — NEVER fail the run, NEVER drop the stash.
- Wrap proof-through-push in `Effect.ensuring(restore)` so WIP returns even on
  proof failure (incl. `--start-pr-early` post-push proof).
- Partial-staging guard: refuse `intersection(staged, unstaged)` non-empty
  (cannot split a partially staged file).
- Guards: refuse with `--push-only`, `--reuse-verified`, `--amend`.
- `--include-untracked` excludes ignored files by design (document; `--all`
  deliberately not used).
- Always-on summarizer `summarizePublishPaths(paths)`: total count, distinct
  top-level dirs (first segment, sorted), first 10 examples, remedy line
  ("stage the intended files, `git stash push --include-untracked` the rest,
  or rerun with `--staged-only`"). Replaces `formatPublishPaths` in refusal
  messages; full list goes to the packet (E4).

### E2 — Base-freshness gate

- `YeetBaseFreshness { mergeBase, behindCount, overlappingPaths }`.
- `assessBaseFreshness`: `git merge-base <base> HEAD`;
  `git rev-list --count <mergeBase>..<base>`; if >0, overlap = sorted
  intersection of `git diff --name-only -z <mergeBase>..HEAD` and
  `<mergeBase>..<base>` (reuse `runGitPathList`); pure
  `overlappingBasePaths(a, b)` exported ForTesting.
- Call at top of `runPublishMode` (after `hydrateYeetRunContext` has run
  `refreshBaseRef`), before `collectPublishIntent`; applies to all publish
  variants. Behind>0 → always warn. Overlap non-empty and not
  `--allow-stale-base` → refuse via E4 helper (subCategory `stale-base`,
  evidence = overlapping paths, remedy = `git fetch origin && git rebase
  origin/main`, then re-verify). Merge-base failure (unrelated histories) →
  refuse explicitly. Renames overlap by exact path only (documented).
- Record `YeetBaseFreshness` in the verdict when proceeding.

### E3 — Changeset hint (scope-reduced)

- Add to `knownSubLaneHints`: needle `changeset`, subCategory
  `changeset-status`, category `changeset-policy`, remediation naming
  `bun run changeset:status:since-main` and `bunx changeset add --empty` for
  version-neutral changes. Needle also matches `repo-sanity:changeset-graph`
  output — acceptable (same category; latest-match-wins favors the failing
  tail).
- Code comment on the dynamic lane composition; docs in E10.

### E4 — Packetized intent failures + typos needle

- `failPublishScopeWithPacket(context, { message, paths, subCategory,
  remediation })`: one synthetic `QualityIssue` (category `command-failure`,
  tool `yeet`, parser `yeet-publish-intent`, blocking, severity error,
  evidence = full sorted paths, message = E1 summary) →
  `buildQualityIssueIndex` → `writeIssueArtifacts` → fail `YeetCommandError`.
  Mirrors `failWithIssueArtifacts` without step results. Adds
  `FileSystem | Path` to callers' R — all real call sites already have it.
- Route through it: `collectPublishIntent`, `validatePublishIntentStillSafe`,
  `validatePostCommitProofDidNotChangeWorktree`, reuse-skip validation.
  Keep pure helpers (`publishPathsOutsideIntent` etc.) untouched.
- `typos` needle: tool-generic remediation (no root `typos` script exists; fix
  or whitelist in `_typos.toml`).

### E5 — verdict.json

New `internal/Verdict.ts`:

- `YeetLaneStatus = LiteralKit(["passed","failed","skipped","not-run"])`.
- `YeetVerdictLane { id, label, phase, status, exitCode?, repairCommand?,
  rawOutputRef? }` — repairCommand from `knownSubLaneHintFromOutput`
  remediation when matched, else the step's re-run command text.
- `YeetVerdict { schemaVersion: "yeet-verdict/v1", runId, mode, branch, base,
  head, outcome: success|failure, message, committed, pushed, lanes,
  packetPaths, indexPath?, stash?, baseFreshness?, createdAt }`.
- Recorder: `Ref<Array<{step, result}>>` created in `runPlanExecution`,
  threaded through `runPhase`/`executeStepWithArtifacts` (single-file
  refactor in Handler.ts). Failure writers (`failWithIssueArtifacts`,
  `failPublishScopeWithPacket`) and all success exits write the verdict;
  planned-but-not-run steps appear as `not-run`. Skip in `--plan` mode and
  for fallow/plan-contract subcommands. Path:
  `runOutputPathForContext(context, "verdict.json")`.
- `buildYeetVerdictForTesting` export.

### E6 — `publish --pr`

- `findOpenPullRequest`: Option variant of `runGhPullRequestView` (none on
  non-zero exit); skip-if-exists checks `state === "OPEN"` only (closed/merged
  PRs do not block creation).
- `buildPrBody`: commit log `git log --reverse --pretty=format:%s%n%n%b
  <mergeBase>..HEAD` + "Local proof" lane summary from the E5 recorder +
  verdict path; write `.beep/yeet/runs/<runId>/pr-body.md`; create via
  `gh pr create --title <head subject> --body-file <path>` (no `--draft`,
  argv array → no shell quoting risk; bodies are verbatim, markdown escaping
  not attempted). Optionally pin `--base` from `originBranchFromBase`.
- Call sites: default publish — after publish phase succeeds, before monitor;
  `--start-pr-early` — immediately after early push (hosted review overlaps
  local proof). Monitor pre-validation in `validateMonitorGuards` skipped when
  `--pr`. Refuse `--pr` outside publish mode.
- Plan visibility: `pr: S.Boolean` in `YeetRunPlanModeOptions`; step
  `publish:02-pr-create` (command `gh`, mutability `publish`); execution stays
  imperative (skip-if-exists is runtime state, mirroring imperative staging).

### E7 — Closeout write-backs

- Flags (default-empty strings, `botsFlag` style): `--reply-thread <id>` +
  `--reply-body <text>` (paired; one thread per invocation),
  `--resolve-thread <ids>` (comma-separated; reuse `normalizedTokens`).
  Id in both → reply then resolve.
- `PrCloseoutWriteAction { kind: reply|resolve, threadId, ok, detail, url? }`;
  `PrCloseoutReport.writeActions` with decode-compat default `[]` (copy the
  `states` pattern).
- `performCloseoutWriteActions` BEFORE gate computation; validate ids against
  fetched `reviewThreads` (refuse unknown); 16 KiB body cap (argv limits);
  mutations via `ghOutput`:
  - `gh api graphql -f query='mutation($threadId: ID!, $body: String!) {
    addPullRequestReviewThreadReply(input:{pullRequestReviewThreadId:$threadId,
    body:$body}) { comment { id url } } }' -f threadId=... -f body=...`
  - `gh api graphql -f query='mutation($threadId: ID!) {
    resolveReviewThread(input:{threadId:$threadId}) { thread { id isResolved }
    } }' -f threadId=...`
- Re-collect threads once post-write so gates reflect reality. Zero behavior
  change when flags absent.

### E8 — Lock staleness

- In `acquireFullProofLock`, when lock exists: decode `YeetProofLockState`
  (`S.fromJsonString`). Pure
  `proofLockDisposition(state: Option, isAlive: boolean)` →
  `replace-stale | refuse-active | refuse-unreadable` (ForTesting export).
  Dead pid → warn (`pid <n> not running, started <ts>`) → remove → proceed.
  Alive → current refusal + pid/startedAt in message. Undecodable → current
  manual-removal refusal (never auto-delete unknown content). `EPERM` from
  `process.kill(pid, 0)` counts as alive. Pid reuse is accepted best-effort.

### E9 — Deps-change forcing

- `lockfileChangedSinceBase`: `git diff --name-only -z <base>...<head> --
  bun.lock` non-empty; computed in `runYeet` after context hydration for
  repair/verify/publish; log `[yeet] bun.lock changed since <base>; forcing
  dependency-sensitive lanes (TURBO_FORCE=1)`.
- `YeetRunPlanModeOptions.forceTurbo: S.Boolean` with
  `S.withConstructorDefault(Effect.succeed(false))` (keeps existing `make`
  call sites valid). When true: `env: O.some({ TURBO_FORCE: "true" })` on the
  feedback steps and the proof step — propagates via `extendEnv: true` to all
  transitive turbo invocations. Per-lane `--force` argv threading was
  considered and rejected (new Quality plumbing for marginal benefit).
- Turbo nominally hashes the lockfile globally; this is defense-in-depth
  against remote-cache/filter-scoped replays. Cost: one fully-uncached proof
  after dependency changes. `--reuse-verified` untouched (`commitSha` +
  `diffFingerprint` pin exact trees).

### E10 — SKILL.md edits

- Ground First: add fetch + `git rev-list --count $(git merge-base HEAD
  origin/main)..origin/main`; describe warn/refuse-on-overlap +
  `--allow-stale-base` + rebase remedy.
- Canonical Commands: `publish --staged-only`, `publish --pr` (replaces the
  manual `gh pr create --draft --fill` step in Mergeable PR Workflow),
  closeout write-back flags.
- New Run Artifacts note: `.beep/yeet/runs/<branch>/verdict.json` always
  written; packets under `.beep/yeet/packets/`.
- Changeset: local pre-push includes `changeset status --since=origin/main`;
  remedy `bunx changeset add --empty`.
- Fix packet-coverage overpromise (~L188-191): enumerate exactly what
  packetizes (proof/commit/publish step failures, publish-intent refusals,
  stale-base refusals) and that refusals are summarized on stderr with full
  lists in the packet.
- Lock guidance (~L179-182): stale locks with dead pids self-heal; manual
  removal only for unreadable lock files.

## Test plan summary

- Pure: `summarizePublishPaths` (count/dirs/cap/remedy), partial-staging
  intersection, `overlappingBasePaths` matrix, hint extraction (changeset,
  typos), verdict builder (hint-derived repair commands, not-run lanes,
  schema round-trip), `prBodyFromCommits` formatting, write-action token
  parsing + unknown-id refusal + gh argv snapshots, `proofLockDisposition`
  matrix, planner: pr-create step placement (both modes), `TURBO_FORCE` env
  presence/absence.
- Temp-git-repo integration (pattern at yeet.test.ts L406-439): stash
  lifecycle incl. pop-conflict keep+report; staged-only commit excludes
  unstaged hunks; base-freshness warn vs refuse (local ref as `--base`);
  packetized intent failure writes index + markdown; lock replace path
  (inject liveness; fs assertions).

## Sequencing

E1 summarizer → E4 helper → E1/E2 refusal rewiring; E5 before E6 (body lane
summary; E6 degrades to commits-only body if built first); E3/E8/E9/E10
independent; catalog regen last (after P3); skill text (E10) documents shipped
behavior, so it lands in the P3 commit.
