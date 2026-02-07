# Spec Status Folder Migration Research (2026-02-07)

## Goal

Define a robust structure and process for spec lifecycle folders:
- `pending`
- `completed`
- `archived`

## External Research

1. Git hooks are the right native enforcement surface for repository policy checks.
   - Source: `githooks(5)` official man page (`core.hooksPath`, hook execution model)
   - https://git-scm.com/docs/githooks
2. Husky is a practical, lightweight way to standardize hook execution in JS/Bun repos.
   - Source: Husky docs (`husky init`, `prepare`, pre-commit flow)
   - https://typicode.github.io/husky/get-started.html
3. Hooks are local by default, so team-level policy should be versioned in-repo and kept simple.
   - Source: Atlassian Git hooks tutorial (team maintenance implications)
   - https://www.atlassian.com/git/tutorials/git-hooks

## Recommended Model

1. Create only under `specs/pending/`.
2. Move to `specs/completed/` when done.
3. Move to `specs/archived/` when deferred.
4. Enforce with a pre-commit check that fails if a pending spec declares complete/archived status.
5. Provide a single move command/script to avoid manual `mv` drift.

## Why This Model

- Keeps active work discoverable and uncluttered.
- Preserves historical/spec artifacts without implying active execution.
- Prevents “done but still pending” decay.
- Works with existing handoff workflows and simple shell tooling.

## Repo Impact Areas (must be updated)

- Main spec index (`specs/README.md`)
- Status policy (`specs/SPEC_STATUS_POLICY.md`)
- Spec guide and handoff standards (`specs/_guide/README.md`, `specs/_guide/HANDOFF_STANDARDS.md`)
- AI entry-point docs (`AGENTS.md`, `CLAUDE.md`, `README.md`)
- Tooling workflows (`.codex/*`, `.cursor/*`, `.claude/commands/new-spec.md`)
- Scaffolding command path (`bootstrap-spec` in `tooling/cli`)
- Hook enforcement (`.husky/pre-commit`)

