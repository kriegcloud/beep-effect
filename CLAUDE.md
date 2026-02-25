# beep effect

Effect v4 monorepo with bun and turborepo.

Command first discovery:

- `bun run beep docs laws`
- `bun run beep docs skills`
- `bun run beep docs policies`
- `bun run beep docs find <topic>`

Quality gates:

1. Effect first implementation is mandatory.
2. Unsafe typing escapes are not allowed.
3. Native mutable runtime utilities in domain logic are disallowed except approved boundaries.
4. Exported APIs need jsdoc and docgen clean examples.
5. Exceptions require explicit allowlist metadata with accountable ownership.
6. Work is not complete until check, lint, test, and docgen pass.

Pathless config rule:

- Keep agent instruction surfaces pathless and lightweight.
- Use command names in guidance instead of file or module references.
- Run `bun run agents:pathless:check` after changing agent config text.

Hook command entrypoints:

- `bun run claude:hook:agent-init`
- `bun run claude:hook:subagent-init`
- `bun run claude:hook:pattern-detector`
- `bun run claude:hook:skill-suggester`
- `bun run claude:hook:stop`
