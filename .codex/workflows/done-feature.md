# Feature Completion Workflow (Codex Adaptation)

Adapted from `.claude/commands/done-feature.md` with tool-branding removed.

## Validation sequence

1. `bun run lint` (or package-scoped equivalent)
2. `bun run check`
3. `bun run test` (or scoped tests)
4. `bun run build` when relevant

If full execution is skipped, record exact reason and partial verification run.

## Documentation and spec updates

- Update active spec plan/checklists
- Document implementation deviations and rationale
- Update related docs/handoffs

## Git hygiene

- Stage only relevant changes
- Use structured commit message with validation evidence
- Avoid destructive history rewrites unless explicitly requested

## Completion output

Provide:
- Summary of implemented behavior
- Validation evidence
- Remaining risks or follow-ups
