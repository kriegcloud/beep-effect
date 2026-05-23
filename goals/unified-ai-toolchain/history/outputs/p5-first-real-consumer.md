# P5 First Real Consumer

## Status

Complete.

## Implementation

`@beep/ai-sync` dogfoods this repo's real `.codex/config.toml` as the mandatory
V1 consumer. The package-local `check` command runs:

- generated artifact validation
- `.codex/config.toml` validation through the `CodexConfig` schema

Because the package participates in the monorepo check pipeline, root
`bun run check` validates the same real config as part of normal repo quality.

The package also supports explicit validation:

```bash
bun run --cwd packages/tooling/library/ai-sync validate -- --repo-root ../../../.. --config .codex/config.toml
```

## Evidence

- `bun run --cwd packages/tooling/library/ai-sync check`
  - printed `Validated .codex/config.toml with codex-config.`
- `bun run check`
  - completed successfully after adding the package and fixing exposed repo
    check diagnostics
- `bun run --cwd packages/tooling/library/ai-sync test`
  - deliberate invalid fixture sets
    `skills.include_instructions = "definitely"`
  - validation fails with typed `AiSyncError`
  - rendered Effect Schema cause includes
    `["skills"]["include_instructions"]`

## Notes

The first required consumer is intentionally `.codex/config.toml` because Codex
has the strongest Tier-1 schema source. `.mcp.json`, `.claude/settings.json`,
`AGENTS.md`, and `CLAUDE.md` remain registered validation candidates for later
dogfooding broadening.
