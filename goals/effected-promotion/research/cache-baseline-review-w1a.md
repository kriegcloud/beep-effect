# Cache baseline review: wave 1a

Reviewed 2026-10-21 for wave 1a of `goals/effected-promotion` (SPEC D-19 to D-22).

`bun run beep quality cache-policy` reported unreviewed expansions for the eight
new workspaces only: `@beep/jsonc`, `@beep/jsonl`, `@beep/semver`, `@beep/spdx`,
`@beep/schema-org`, `@beep/github-references`, `@beep/github-commands` and
`@beep/commands`, eight task tuples each (`#build`, `#check`, `#docgen`, `#lint`,
`#lint:deprecated-apis`, `#lint:jsdoc`, `#lint:laws`, `#test`). No root (`//`)
expansion was reported.

Each workspace was scaffolded by `bun run beep create-package` (foundation/modeling,
or drivers for `@beep/commands`). Its scripts block is the generated task set:
`bun run beep lint package-scripts` reports no drift after `--write` seeded the
`doctest` pair for `@beep/jsonl`. Commands, inputs, outputs and cache flags match
the sibling modeling packages such as `@beep/html`. None of the packages carries a
`turbo.json`, as the library scaffold emits none.

Recording these subjects accepts the existing posture for the eight new
workspaces only. No qualification is granted, and no other subject changes.
