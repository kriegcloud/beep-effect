# Specification

## Objective

Reduce agent PR closeout latency without weakening canonical proof. Yeet should
cover the common loop from local fix to PR comment/check closeout, while making
the faster lanes explicit and bounded.

## Scope

- `@beep/repo-cli` Yeet command planner, handler, and tests.
- `@beep/repo-cli` quality GitHub-check command modes.
- Affected repo-export shard verification.
- `.claude/skills/yeet/SKILL.md`.
- This goal packet.

## Non-Goals

- Do not change hosted GitHub check names.
- Do not remove full pre-push, secrets, security, SAST, or Nix proof.
- Do not make `--fast` default.
- Do not auto-resolve review threads or post generic bot replies.
- Do not depend on paid or unavailable services for local proof.

## Requirements

- `bun run beep yeet verify --tier review-fix` plans/runs
  `quality github-checks review-fix`.
- `bun run beep quality github-checks review-fix` runs affected build, check,
  lint, unit/type tests, local docgen, and affected repo-export checks.
- `bun run beep yeet closeout` inspects current PR review threads and bot
  comments, writes a closeout artifact, and emits Yeet quality packets for
  blocking issues.
- `--require-greptile-score`, `--require-greptile-issues`, and
  `--require-review-comments` gate closeout.
- `--retrigger-greptile` is the only GitHub write path and posts an explicit
  Greptile rerun comment.
- `publish --amend --no-edit --reuse-verified` skips the full proof only when a
  durable state file proves an exact match to a prior full proof.
- Affected repo-export checks use package shards when safe and escalate to full
  catalog check for topology/generator/root changes.

## Acceptance

- Focused repo-cli tests pass.
- Relevant type checks pass.
- Repo catalog artifacts are current after exported CLI symbols change.
- Packet verification passes.
- PR proof uses Yeet commands and closeout gates.

## Follow-Up Optimization Backlog

These items are in-scope for follow-up commits on the same PR after the initial
ready-for-review branch is pushed:

- Repo-export invalidation narrows generator fingerprints and avoids broad shard
  churn from unrelated Quality command edits.
- Yeet can record and reuse composite pre-push sub-lane proofs when inputs are
  unchanged.
- Docgen check/generate/aggregate can share a run plan and expensive example
  typecheck results.
- Terse-effect reports distinguish strict blockers from informational findings
  and safe rewrites.
- Yeet failure packets expose known failed sub-lanes directly instead of only a
  broad command failure.
- Publish pushes use `git push -u origin HEAD` and warn when the branch tracks a
  differently named upstream.
- Verified clean commits have an explicit push-only reuse command.
- Quality scheduling is machine-aware and prevents competing full proof runs.
- Hardware profile detection/config can tune local concurrency for current,
  workstation, and CI environments.
- Closeout is represented as durable PR states for Greptile, CodeRabbit,
  ChatGPT, hosted checks, and unresolved review comments.
