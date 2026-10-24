# Cache baseline review: wave 4, PR 4-X

Reviewed 2026-10-23 for PR 4-X of `goals/effected-promotion` (decision W4-c,
`@beep/xdg`).

`bun run beep quality cache-policy` reported 20 blocking findings and one
review-level source drift, all introduced by this branch:

- Unreviewed expansion for the new workspace `@beep/xdg`, eight task tuples
  (`#build`, `#check`, `#docgen`, `#lint`, `#lint:deprecated-apis`,
  `#lint:jsdoc`, `#lint:laws`, `#test`).
- Configuration drift on the two named importers W4-c moves onto `@beep/xdg`:
  `@beep/m365-mcp` (`#build`, `#check`, `#lint:deprecated-apis`, `#test`,
  `#test:property`) and `@beep/repo-cli` (the same five plus `#doctest`). Each
  drifted tuple follows from the new `@beep/xdg` workspace dependency in its
  manifest; no command, input, output or cache flag changed.
- Root (`//`) drift on `//#lint:policy-fingerprint`, with the matching
  `turbo.json` source drift. `bun run beep lint policy-fingerprint --write`
  added the `package.json` and `src/**` globs of `@beep/xdg` to the task inputs
  and to `standards/policy-tools.fingerprint.json`, because it entered
  `@beep/repo-cli`'s dependency closure. No other root task changed.

`@beep/xdg` was scaffolded by `bun run beep create-package` in
foundation/capability. Its scripts block is the generated task set, and it
carries no `turbo.json`, as the library scaffold emits none. Its runtime
dependencies are `effect`, `@beep/config-file`, `@beep/identity`,
`@beep/schema`, `@beep/utils` and `@beep/walker`, all already in the graph; its
devDependencies (`@beep/fc-runs`, `@beep/memfs`, `@effect/vitest`,
`@types/node`, `bun-types`) were installed before this branch, so nothing new
enters `bun.lock` beyond the workspace edges.

## Turbo coupling (W4-c, correction 3), measured against current main

Measured from the workspace `dependencies` closures at the lane base
`origin/main` 230b4a4101 and at this branch head (current `origin/main`
4dc0d2a97e gives the same closures):

| Importer | Closure on main | Closure on the branch | Added |
| --- | --- | --- | --- |
| `@beep/m365-mcp` | 6 | 13 | `@beep/xdg`, `@beep/config-file`, `@beep/walker`, `@beep/glob`, `@beep/jsonc`, `@beep/toml`, `@beep/yaml` |
| `@beep/repo-cli` | 54 | 55 | `@beep/xdg` (main already reaches config-file, walker and the grammars) |

The manifest carries `@beep/config-file` and `@beep/walker` for the
`@beep/xdg/XdgConfig` subpath, so `@beep/m365-mcp`'s turbo closure gains
config-file, its three grammars, walker and glob even though its one import
(`@beep/xdg/XdgBase`) never reaches them: an edit to any of their `src/**`
now invalidates m365-mcp's `#build`, `#check` and `#test` cache entries. This
is accepted (W4-c, correction 3). The runtime side is proven by
`packages/foundation/capability/xdg/test/rootClosure.test.ts`: the root barrel
and `XdgBase` never load `XdgConfig`, `@beep/config-file` or `@beep/walker`.

## Not subjects

- `@beep/identity`'s `src/packages.ts` gains the `$XdgId` composer that
  `create-package` registers. This is a source edit; the manifest and task
  configuration are unchanged.
- `@beep/scratchpad`'s manifest is unchanged: no lab module imports
  `@beep/xdg`, and the two lab test maps that name it are test sources.
- The root `tsconfig.json`, `tsconfig.packages.json`,
  `vitest.aliases.generated.json`, `standards/fallow.boundaries.generated.jsonc`
  and `bun.lock` edits only add the `@beep/xdg` wiring and record the new
  workspace edges.

Recording these subjects accepts the existing posture for the new workspace,
the dependency-only drift of the two importers, and the input-only growth of
the root policy-fingerprint task. No qualification is granted, and no other
subject changes.
