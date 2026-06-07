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

- Commit reviewed staged changes, run the full local pre-push proof, then push:

```bash
bun run beep yeet publish --message "type(scope): summary"
```

- Monitor hosted PR checks for the current branch:

```bash
bun run beep yeet monitor
```

Use plan mode before long or risky runs when you need to inspect the shape:

```bash
bun run beep yeet repair --plan --json
bun run beep yeet verify --plan --json
bun run beep yeet publish --message "type(scope): summary" --plan --json
```

## Mergeable PR Workflow

1. Run `bun run beep yeet repair` when local changes need deterministic fixers,
   docgen, repo-export catalog repair, or affected feedback.
2. Stage the reviewed files explicitly.
3. Run `bun run beep yeet publish --message "type(scope): summary"`.
4. If no pull request exists for the pushed branch, create a draft PR with
   `gh pr create --draft --fill`.
5. Run `bun run beep yeet monitor` and inspect PR checks, mergeability, and
   review threads.
6. Address failed checks or actionable review comments with follow-up commits
   through the same Yeet publish path.
7. Mark the PR ready only when checks are green, there are no unresolved
   actionable review threads, and GitHub reports the branch as mergeable or not
   conflicted.

## Fast Plus Monitor

`bun run beep yeet publish --fast --monitor --message "..."` is opt-in only. Use
it only on an existing PR branch when the user explicitly accepts replacing the
local full pre-push wait with hosted PR-check monitoring. It must remain paired
with `--monitor`; Yeet rejects `--fast` without it.

`bun run audit:github pre-push` remains the named full local fallback for
secrets, security, SAST, Nix, and any lane that must be proven outside Yeet.

## Failure Handling

- If Yeet fails after creating a local commit but before pushing, fix the issue,
  then amend or reset the unpushed commit before retrying.
- If Yeet refuses untracked, unstaged, or newly generated paths, inspect the
  paths and decide whether they belong in the reviewed publish intent.
- If there is no open PR for `yeet monitor`, create the draft PR first or run
  `bun run audit:github pre-push` as the full local fallback.
- Do not weaken GitHub check names, hosted PR checks, or manual fallback lanes
  to make a branch appear green faster.
