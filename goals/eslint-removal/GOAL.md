# TS7 exit B2: remove ESLint

Remove ESLint after verifying both documentation and deprecated-API lint execute
oxlint. Preserve repository governance behavior while moving its retained helpers
from `eslint/` to `laws/` under `@beep/repo-configs`.

Read SPEC.md, PLAN.md, README.md and ops/manifest.json for scope and evidence.
The implementation lane owns this worktree only. The Claude orchestrator owns
all git staging, commits, publication, merge and post-merge packet closure.
Keep this packet active until the orchestrator closes it after merge.

Acceptance: ESLint-only config, rule, parser and plugins removed; law consumers
and declared inputs moved; required gates run and attributable failures recorded.
Raw logs belong in the workstation cache, not the repository.
