# Codex Safety Permissions Baseline

Adapted from `.claude/settings.json` permission intent.

## Allowed command families

- `bun:*`
- `git:*` (non-destructive by default)
- `turbo:*`
- `biome:*`
- `tsc:*`
- `npx:*`
- `docker:*`
- `docker-compose:*`

## Explicitly prohibited operations

- `rm -rf /`
- `rm -rf /*`
- `git push --force origin main`
- `git push --force origin master`

## Additional high-risk operations requiring explicit user intent

- `git reset --hard`
- `git checkout -- <path>`
- destructive database commands (`DROP DATABASE`, mass delete without transaction/backup)
- recursive deletion outside repository scope

## Manual enforcement checklist

Before executing a destructive or irreversible command:
1. Confirm exact target path/branch/database.
2. Confirm user intent is explicit and current-session scoped.
3. Record the command and rationale in the active report/handoff.
