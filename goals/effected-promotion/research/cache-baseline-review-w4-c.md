# Cache baseline review: wave 4, 4-C

Reviewed 2026-10-23 for PR 4-C of `goals/effected-promotion` (decision W4-d,
`@beep/cli-kit`).

`bun run beep quality cache-policy` reported 20 blocking findings and one
review-level source drift, all introduced by this branch:

- Unreviewed expansion for the new workspace `@beep/cli-kit`, eight task
  tuples (`#build`, `#check`, `#docgen`, `#lint`, `#lint:deprecated-apis`,
  `#lint:jsdoc`, `#lint:laws`, `#test`).
- Configuration drift on the two named importers W4-d moves onto
  `@beep/cli-kit`: `@beep/repo-cli` (`#build`, `#check`, `#doctest`,
  `#lint:deprecated-apis`, `#test`, `#test:property`) and
  `@beep/repo-ai-metrics` (`#build`, `#check`, `#lint:deprecated-apis`,
  `#test`, `#test:property`). Each drifted tuple follows from the new
  `@beep/cli-kit` workspace dependency in its manifest; no command, input,
  output or cache flag changed.
- Root (`//`) drift on `//#lint:policy-fingerprint`, with the matching
  `turbo.json` source drift. `bun run beep lint policy-fingerprint --write`
  added the `package.json` and `src/**` globs of `@beep/cli-kit` and
  `@beep/github-commands` to the task inputs and to
  `standards/policy-tools.fingerprint.json`, because both entered
  `@beep/repo-cli`'s dependency closure. No other root task changed.

`@beep/cli-kit` was scaffolded by `bun run beep create-package` in
foundation/capability. Its scripts block is the generated task set, and it
carries no `turbo.json`. Its runtime dependencies are `effect`,
`@beep/github-commands`, `@beep/identity`, `@beep/runtime-env`, `@beep/schema`,
`@beep/utils` and `@beep/walker`, all already in the graph. Its
devDependencies are `@beep/config-file`, `@beep/fc-runs`, `@beep/markdown`,
`@beep/memfs`, `@effect/platform-node`, `@effect/vitest`, `@types/node`,
`bun-types` and `string-width`. `string-width` gains an exact root catalog pin
at `8.3.0`, the version already hoisted in `bun.lock`; the lockfile re-hoists
`ansi-regex` entries and adds no new integrity hash.

## Turbo coupling, measured against current main

Workspace `dependencies` closures at `origin/main` (4dc0d2a97e) and at this
branch head:

| Package | Closure on main | Closure on this branch | Added |
| --- | --- | --- | --- |
| `@beep/repo-cli` | 54 | 56 | `@beep/cli-kit`, `@beep/github-commands` |
| `@beep/repo-ai-metrics` | 11 | 15 | `@beep/cli-kit`, `@beep/github-commands`, `@beep/glob`, `@beep/walker` |
| `@beep/cli-kit` (new) | - | 8 | `@beep/data`, `@beep/github-commands`, `@beep/glob`, `@beep/identity`, `@beep/runtime-env`, `@beep/schema`, `@beep/utils`, `@beep/walker` |

The transitive dependents of `@beep/cli-kit` are `@beep/repo-cli`,
`@beep/repo-ai-metrics`, `@beep/palantiri`, `@beep/infra` and
`@beep/scratchpad`. An edit to `@beep/cli-kit`'s `src/**` now invalidates
their `#build`, `#check` and `#test` entries, and for ai-metrics an edit to
`@beep/github-commands`, `@beep/glob` or `@beep/walker` does too. Both importers
use only `Fmt` (`Fmt.stripControls`, `Fmt.truncate`, `Fmt.width`), so the
coupling is the price of one sanitizer owner (W4-d). If the coupling is ever
the bottleneck, the fallback is a modeling-level `Fmt` leaf with no service
imports, not a second private copy.

## Not subjects

- `@beep/identity`'s `src/packages.ts` gains the `$CliKitId` composer that
  `create-package` registers. This is a source edit; the manifest and task
  configuration are unchanged.
- `@beep/scratchpad`'s manifest gains `@beep/cli-kit`, because the lab `./ui`
  half imports it. The policy does not report it, as in waves 2b-1, 2d-1 and
  3-3.
- The root `tsconfig.json`, `tsconfig.packages.json`,
  `vitest.aliases.generated.json`, `standards/fallow.boundaries.generated.jsonc`
  and `bun.lock` edits only add the `@beep/cli-kit` wiring and record the new
  workspace edges; the root `package.json` gains the `string-width` catalog pin.

Recording these subjects accepts the existing posture for the new workspace,
the dependency-only drift of the two importers, and the input-only growth of
the root policy-fingerprint task. No qualification is granted, and no other
subject changes.
