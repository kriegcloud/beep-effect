# Status
fixed on current branch

## Outcome
KG context generation now XML-escapes dynamic filename-derived attribute values before emitting `<symbol>` and `<relationship>` tags, preventing tag/attribute injection through snapshot paths.

## Evidence
- Code: `.claude/hooks/skill-suggester/index.ts`
- Tests: `.claude/hooks/skill-suggester/index.test.ts`
- Verification: `bun run --cwd .claude check`
