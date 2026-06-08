---
name: yeet
description: Canonical repo-quality operator workflow for beep-effect. Use when repairing local changes, proving quality, committing, pushing, opening or monitoring a PR, or moving a branch toward mergeable GitHub state with `bun run beep yeet`.
---

# Yeet Quality Path

Use this skill when a user asks to repair, verify, publish, push, open a PR, or
make a branch mergeable in this repository. Yeet is the canonical operator path
for End-to-End Green: deterministic local repair, full local proof, reviewed
commit, push, PR checks, review closeout, and merge readiness.

## Ground First

1. Inspect the current branch and worktree:

```bash
git status --short --branch
git diff --name-status
```

2. If the checkout is on `main` or another protected/default branch, create a
   feature branch from the intended base before editing or publishing.
3. If the worktree contains unrelated changes, stage only the intended files.
   Never publish unrelated paths silently.
4. Check for already-running heavyweight quality commands before starting a
   Yeet lane:

```bash
ps -eo pid,ppid,stat,etime,cmd | rg 'bun run|beep yeet|audit:github|turbo|gh pr|git ' | rg -v 'rg|ps -eo' || true
```

## Canonical Commands

- Repair local work:

```bash
bun run beep yeet repair
```

- Prove the branch without committing or pushing:

```bash
bun run beep yeet verify
```

- Run the targeted review-fix proof while iterating on PR comments:

```bash
bun run beep yeet verify --tier review-fix
```

- Commit reviewed staged changes, run the full local pre-push proof, then push:

```bash
bun run beep yeet publish --message "type(scope): summary"
```

- Retry after a separately verified amend without creating a new commit:

```bash
bun run beep yeet publish --amend --no-edit --reuse-verified
```

- Push an already-verified clean commit without committing or rerunning local
  proof:

```bash
bun run beep yeet publish --push-only --reuse-verified
```

- Monitor hosted PR checks for the current branch:

```bash
bun run beep yeet monitor
```

- Inspect hosted review/bot closeout gates for the current branch PR:

```bash
bun run beep yeet closeout --require-greptile-score 5/5 --require-greptile-issues 0 --require-review-comments 0
```

Use plan mode before long or risky runs when you need to inspect the shape:

```bash
bun run beep yeet repair --plan --json
bun run beep yeet verify --plan --json
bun run beep yeet verify --tier review-fix --plan --json
bun run beep yeet publish --message "type(scope): summary" --plan --json
bun run beep yeet closeout --plan --json
```

## Mergeable PR Workflow

1. Run `bun run beep yeet repair` when local changes need deterministic fixers,
   docgen, repo-export catalog repair, or affected feedback.
2. Stage the reviewed files explicitly.
3. Run `bun run beep yeet publish --message "type(scope): summary"`.
4. If no pull request exists for the pushed branch, create a draft PR with
   `gh pr create --draft --fill`.
5. Run `bun run beep yeet monitor` for hosted checks.
6. Run `bun run beep yeet closeout --require-greptile-score 5/5 --require-greptile-issues 0 --require-review-comments 0`
   to inspect unresolved actionable review threads and review-bot gates.
7. Use `bun run beep yeet verify --tier review-fix` while fixing PR comments,
   then use normal Yeet publish or the exact-match amend retry when appropriate.
8. Address failed checks or actionable review comments with follow-up commits
   through the same Yeet publish path.
9. Mark the PR ready only when checks are green, there are no unresolved
   actionable review threads, and GitHub reports the branch as mergeable or not
   conflicted.

`yeet closeout` is read-first. It classifies review threads and bot findings and
writes Yeet artifacts locally. It posts a Greptile rerun comment only when
`--retrigger-greptile` is explicit, and it does not auto-resolve or auto-reply to
review threads.

## Fast Plus Monitor

`bun run beep yeet publish --fast --monitor --message "..."` is opt-in only. Use
it only on an existing PR branch when the user explicitly accepts replacing the
local full pre-push wait with hosted PR-check monitoring. It must remain paired
with `--monitor`; Yeet rejects `--fast` without it.

`bun run audit:github pre-push` remains the named full local fallback for
secrets, security, SAST, Nix, and any lane that must be proven outside Yeet.

## Failure Handling

- If Yeet fails after creating a local commit but before pushing, fix the issue.
  When you prove the exact current worktree with `bun run beep yeet verify`, you
  may retry with `bun run beep yeet publish --amend --no-edit --reuse-verified`.
  Yeet reuses only exact matching full-proof state; if the state is stale, rerun
  full proof or publish normally.
- If the current clean commit was already verified and only the push was blocked
  or skipped, prefer `bun run beep yeet publish --push-only --reuse-verified`.
  Yeet still requires exact reusable proof state and a clean worktree, and it
  pushes with `git push -u origin HEAD` so upstream branch naming cannot block
  agent-created feature branches.
- Yeet publish marks its `git push` with an exact-proof reuse hint for the
  pre-push hook. The hook reuses only matching full-proof state for the pushed
  SHA and falls back to its normal repo-export catalog validation when state is
  absent, stale, dirty, or ambiguous. Treat this as duplicate-proof reuse, not a
  hook bypass.
- If Yeet refuses untracked, unstaged, or newly generated paths, inspect the
  paths and decide whether they belong in the reviewed publish intent.
- Full pre-push proof streams a conservative collector for independent GitHub
  check lanes. A failed proof may report multiple sibling failures at once
  (for example check, lint, repo-export, tests, SAST, or Nix). Fix all reported
  actionable lanes before retrying instead of assuming the first item is the
  only blocker.
- Root composite lanes prefer streaming accumulation where child commands are
  independent. For example, root `lint` streams the Turbo/Biome aggregate and
  then still runs repo-law policy lints, so one lint-family failure does not
  hide sibling lint findings.
- If there is no open PR for `yeet monitor`, create the draft PR first or run
  `bun run audit:github pre-push` as the full local fallback.
- If `yeet closeout` reports Greptile score/issues as unknown, inspect the PR
  comments and rerun Greptile explicitly with `--retrigger-greptile` only when
  the user wants that GitHub write.
- Do not weaken GitHub check names, hosted PR checks, or manual fallback lanes
  to make a branch appear green faster.
