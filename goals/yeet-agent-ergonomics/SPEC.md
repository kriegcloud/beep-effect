# Yeet Agent Ergonomics Spec

## Objective

`bun run beep yeet` supports an autonomous agent end-to-end: publish works from
a dirty worktree without manual stashing (`--staged-only`), refuses stale-base
pushes that would produce conflicted PRs, writes a machine-readable verdict for
every run, creates the PR itself (`--pr`), and can reply to and resolve review
threads behind explicit flags — all without weakening any existing proof lane.

## Non-Goals

- No weakening of the full local proof, hosted check names, or manual fallback
  lanes (`bun run audit:github pre-push` stays the named fallback).
- No automatic review-thread replies or resolutions. Write-backs run only when
  the operator passes explicit per-thread flags. (This supersedes the blanket
  "do not auto-resolve" non-goal in `goals/yeet-pr-closeout-loop/SPEC.md`:
  explicit operator flags are not "auto".)
- No auto-dropping of operator work: stash restore failures must keep the stash
  and report its ref; locks with live owners are never removed.
- No new package; all code lands in `packages/tooling/tool/cli`.

## Source Hierarchy

1. User objective (operator-session findings, 2026-06-11).
2. `AGENTS.md`, `CLAUDE.md`, and required skills.
3. Governing architecture/package standards.
4. This `SPEC.md`.
5. `PLAN.md`.
6. `GOAL.md`.
7. Supporting `research/`, `ops/`, and `history/` files.

## Target Surfaces

- `packages/tooling/tool/cli/src/commands/Yeet/**` (Handler, Planner, Closeout,
  QualityIssueIndex, Yeet.command, new `internal/Verdict.ts`).
- `packages/tooling/tool/cli/test/yeet.test.ts` and
  `test/quality-tasks.test.ts`.
- `.claude/skills/yeet/SKILL.md`.
- Repo-exports catalog artifacts (regenerated after new `*ForTesting` exports).

## Requirements

### E1 - `publish --staged-only` (auto-stash) + summarized refusals

- New publish flag `--staged-only`. Order of operations: validate intent →
  commit the reviewed index exactly (skip the restage `git add`) →
  `git stash push --include-untracked -m yeet-staged-only/<runId>/<iso>` (the
  stash then holds only unstaged/untracked residue; the `--keep-index`
  duplicate-content pitfall is avoided by stashing after the commit) → full
  proof on the clean tree → push → restore the stash via `Effect.ensuring`.
- Restore locates the stash by recorded sha + marker (concurrent-stash safe).
  On pop failure: do not fail the run, keep the stash, report ref + marker in
  the verdict and on stderr.
- Files staged AND carrying unstaged hunks are refused (cannot split a
  partially staged file); remedy text names the options.
- `--staged-only` is incompatible with `--push-only`, `--reuse-verified`, and
  `--amend`; compatible with default publish and `--start-pr-early`.
- Always (flag-independent): publish-intent refusals print a summary — total
  count, distinct top-level dirs, first 10 example paths, remedy — never the
  full enumeration. Full path list goes in the failure packet (E4).

### E2 - Base-freshness gate

- After `refreshBaseRef`, publish computes merge-base, behind-count
  (`git rev-list --count <mergeBase>..<base>`), and the intersection of
  branch-changed and base-changed-since-merge-base paths.
- Behind > 0: always warn with the count. Overlap non-empty: refuse with a
  packetized issue (subCategory `stale-base`, evidence = overlapping paths,
  remedy = fetch + rebase + re-verify) unless `--allow-stale-base` is passed.
- Merge-base failure (unrelated histories) refuses with an explicit message.

### E3 - Changeset parity hint

- The local pre-push proof already runs `changeset status --since=origin/main`
  (`Quality.command.ts` `githubCheckChangesetStatusLanes`). Add a `changeset`
  needle to `knownSubLaneHints` with remedy text naming
  `bunx changeset add --empty` for version-neutral changes, and document the
  lane in the Yeet skill (E10). Add a code comment noting the lane is appended
  dynamically so it is not "fixed" out of the static lane list.

### E4 - Packetized publish-intent failures + `typos` hint

- New `failPublishScopeWithPacket` helper builds a synthetic `QualityIssue`
  (category `command-failure`, free-string subCategory such as
  `publish-intent` / `stale-base`, full sorted path list as evidence,
  summarized message, remediation) and routes through
  `buildQualityIssueIndex` → `writeIssueArtifacts` before failing.
- All publish-intent refusal sites route through it (`collectPublishIntent`,
  `validatePublishIntentStillSafe`,
  `validatePostCommitProofDidNotChangeWorktree`, reuse-skip validation).
- Add a `typos` needle to `knownSubLaneHints` (tool-generic remedy).

### E5 - Always-written run verdict

- New `internal/Verdict.ts`: schema `yeet-verdict/v1` with run identity, mode,
  outcome, committed/pushed booleans, per-lane status
  (`passed | failed | skipped | not-run`), failed-lane `repairCommand`
  (sub-lane hint remediation when matched, else the re-run command), packet
  paths, optional stash state (E1) and base-freshness record (E2).
- Written to `.beep/yeet/runs/<runId>/verdict.json` on every success AND every
  failure of repair/verify/publish/monitor/closeout (skipped in `--plan` mode).
- Executed-step results are recorded via a `Ref` threaded through
  `runPlanExecution`; planned-but-not-run steps appear as `not-run`.

### E6 - `publish --pr`

- New publish flag `--pr`: after the push phase succeeds (after the early push
  with `--start-pr-early`), create a READY (non-draft) PR. Title = head commit
  subject. Body = commit log since merge-base + local-proof lane summary,
  written to `.beep/yeet/runs/<runId>/pr-body.md` and passed via
  `gh pr create --body-file` (no argv quoting risk).
- Skip with a log line when an OPEN PR already exists for the branch; closed or
  merged PRs do not block creation. Monitor pre-validation is skipped when
  `--pr` is set (the PR exists by monitor time). `--pr` is refused outside
  publish mode.
- The publish plan (`--plan --json`) shows the create step.

### E7 - Closeout write-backs

- New closeout flags: `--reply-thread <id>` + `--reply-body <text>` (must be
  paired; one thread per invocation) and `--resolve-thread <ids>`
  (comma-separated). An id in both gets reply-then-resolve.
- Mutations via `gh api graphql` (`addPullRequestReviewThreadReply`,
  `resolveReviewThread`) using the existing `ghOutput` helper. Unknown thread
  ids are refused before any write. Reply bodies over 16 KiB are refused.
- Writes happen before gate computation; review threads are re-collected once
  so the report reflects post-write reality. `PrCloseoutReport` gains
  `writeActions` (decode-compat default `[]`). Zero behavior change when the
  flags are absent.

### E8 - Proof-lock staleness self-heal

- On acquire with an existing lock: decode `YeetProofLockState`; if the
  recorded pid is dead (`process.kill(pid, 0)` idiom, `EPERM` counts as
  alive), warn, remove, and proceed. Live pid keeps the current refusal (now
  including pid and startedAt). Undecodable lock files keep the current
  manual-removal refusal.

### E9 - Dependency-change cache forcing

- When `bun.lock` changed in `<base>...<head>`, repair/verify/publish set
  `TURBO_FORCE=true` on the feedback and proof steps (existing `bunRunStep`
  env Option; lanes spawn with `extendEnv: true`), logging the reason.
  Defense-in-depth against cache replays masking dependency-induced breakage.
- `--reuse-verified` is untouched (`commitSha` + `diffFingerprint` already pin
  exact trees).

### E10 - Skill text honesty (`.claude/skills/yeet/SKILL.md`)

- Ground First gains the base-freshness check and rebase-first guidance.
- Document `--staged-only`, `--pr` (replacing the manual
  `gh pr create --draft --fill` step in the Mergeable PR Workflow),
  `--allow-stale-base`, closeout write-back flags, the changeset lane and
  `changeset add --empty` remedy, `verdict.json`, and lock self-healing.
- Fix the packet-coverage overpromise: enumerate exactly which failure classes
  packetize.

## Constraints

- Effect-first and schema-first per repo law; new models are `S.Class` /
  `LiteralKit`; new helpers exported for tests via the existing
  `@beep/repo-cli/test/Yeet` surface as `*ForTesting`.
- Minimal-change bias: reuse `runGitOutput`, `runGitPathList`,
  `buildQualityIssueIndex`, `writeIssueArtifacts`, `knownSubLaneHintFromOutput`,
  `runOutputPathForContext`, `ghOutput`, and the ProxyOps pid-liveness idiom.
- Regenerate repo-exports catalog after exported-symbol changes.
- JSDoc requirements apply to all new exports (docgen must stay green).

## Acceptance Criteria

- [ ] All ten requirement sections implemented with focused tests in
      `yeet.test.ts` (pure helpers) plus temp-git-repo integration tests for
      E1 stash/restore/conflict, E2 warn/refuse, E4 packet write, E8 stale
      replace.
- [ ] `bun run beep yeet publish --staged-only --pr --plan --json` and
      `bun run beep yeet verify --plan --json` produce valid plans.
- [ ] Implementation PR is published with `yeet publish --pr` from a worktree
      with deliberate untracked residue (`--staged-only`), and closeout uses
      the new write-back flags — dogfooding E1, E6, E7.
- [ ] Full quality gates in `ops/manifest.json` pass; hosted checks green;
      Greptile 5/5 with 0 issues; 0 unresolved actionable threads.
- [ ] No unrelated refactors or formatting churn.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Focused tests | `bunx --bun vitest run packages/tooling/tool/cli/test/yeet.test.ts packages/tooling/tool/cli/test/quality-tasks.test.ts` | Passes |
| Plan validity | `bun run beep yeet publish --staged-only --pr --plan --json` | Valid plan JSON |
| Catalog | `bun run repo-exports:catalog && bun run repo-exports:catalog:check` | Passes |
| Packet launcher size | `test "$(wc -m < goals/yeet-agent-ergonomics/GOAL.md)" -le 4000` | Passes |
| Manifest JSON | `jq . goals/yeet-agent-ergonomics/ops/manifest.json` | Passes |
| Whitespace | `git diff --check -- goals/yeet-agent-ergonomics` | Passes |

## Stop Conditions

- Required source files are missing or materially contradictory.
- The implementation would exceed named scope.
- A change would weaken the full proof, hosted check names, or the read-first
  closeout default.
- Stash-restore semantics would ever auto-drop operator work.
- Verification requires credentials, cost, destructive side effects, or policy
  approval not named in this spec.
- The same blocker repeats after reasonable investigation.

## Exception Ledger

| Exception | Scope | Owner | Rationale | Removal condition |
| --- | --- | --- | --- | --- |
| None | N/A | N/A | N/A | N/A |
