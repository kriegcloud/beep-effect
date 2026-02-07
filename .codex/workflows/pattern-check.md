# Pattern Check Workflow

Manual fallback for pattern-detector parity when runtime hooks are unavailable.

## Pre-execution checks

1. Command safety: reject prohibited commands in `.codex/safety/permissions.md`.
2. Destructive intent: verify explicit user authorization for irreversible actions.
3. Scope safety: ensure command/file targets are inside intended project scope.

## Post-edit checks

1. Scan edited content for banned patterns (`any`, `@ts-ignore`, unsafe casts, destructive git usage).
2. Re-check dangerous command patterns before running verification scripts.
3. Record any overridden risk with explicit rationale.
