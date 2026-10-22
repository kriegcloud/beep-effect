# Cache baseline review: repo-cli check compiles its tests (2026-10-22)

## Change

`packages/tooling/tool/cli/package.json` `beep:check` gains a third step,
`tsc-rs -p test/tsconfig.json`, so `check` type-checks repo-cli's own tests
(they were only compiled by the separate `quality test-tsgo` lane, and a
lane-local `check` stayed green while hosted Heavy / Check red, #1993 and
#2008). `packages/tooling/tool/cli/test/tsconfig.json` widens its `include`
from `./**/*.test.ts` to `./**/*.ts` (fixtures stay excluded) so the project
selects every test source, including `test/global-cleanup.ts` and
`test/support/*.ts`.

## Drifted tasks

`bun run beep cache audit` reports `configuration-drift` for exactly these ten
computations, all of subject `@beep/repo-cli`:

| Task | Input change |
| --- | --- |
| `@beep/repo-cli#build` | subject manifest bytes (`package.json` script word) |
| `@beep/repo-cli#check` | subject manifest bytes, and its command digest (the flattened `beep:check` gains `tsc-rs -p test/tsconfig.json`) |
| `@beep/repo-cli#docgen` | subject manifest bytes |
| `@beep/repo-cli#doctest` | subject manifest bytes |
| `@beep/repo-cli#lint` | subject manifest bytes |
| `@beep/repo-cli#lint:deprecated-apis` | subject manifest bytes |
| `@beep/repo-cli#lint:jsdoc` | subject manifest bytes |
| `@beep/repo-cli#lint:laws` | subject manifest bytes |
| `@beep/repo-cli#test` | subject manifest bytes |
| `@beep/repo-cli#test:property` | subject manifest bytes |

No other subject drifts. Task inputs, outputs, environment and the dependency
graph are unchanged; the only manifest edit is the `beep:check` script word.

## Verdict

Record the new settings for `@beep/repo-cli` without granting any
qualification. `check` keeps caching on the same inputs; its result now also
proves the test project type-checks.
