# Cache baseline review: wave 3, sub-wave 3-3

Reviewed 2026-10-23 for sub-wave 3-3 of `goals/effected-promotion` (decision
W3-e, `@beep/config-file`).

`bun run beep quality cache-policy` reported 20 blocking findings and one
review-level source drift, all introduced by this branch:

- Unreviewed expansion for the new workspace `@beep/config-file`, eight task
  tuples (`#build`, `#check`, `#docgen`, `#lint`, `#lint:deprecated-apis`,
  `#lint:jsdoc`, `#lint:laws`, `#test`).
- Configuration drift on the two named importers W3-e moves onto
  `@beep/config-file`: `@beep/repo-docgen` (`#build`, `#check`,
  `#lint:deprecated-apis`, `#test`, `#test:property`) and `@beep/repo-cli` (the
  same five plus `#doctest`). Each drifted tuple follows from the new
  `@beep/config-file` workspace dependency in its manifest, and for docgen
  from dropping `jsonc-parser`; no command, input, output or cache flag
  changed.
- Root (`//`) drift on `//#lint:policy-fingerprint`, with the matching
  `turbo.json` source drift. `bun run beep lint policy-fingerprint --write`
  added the `package.json` and `src/**` globs of `@beep/config-file`,
  `@beep/jsonc`, `@beep/toml` and `@beep/yaml` to the task inputs and to
  `standards/policy-tools.fingerprint.json`, because they entered
  `@beep/repo-cli`'s dependency closure on this lane's base. No other root task
  changed.

`@beep/config-file` was scaffolded by `bun run beep create-package` in
foundation/capability. Its scripts block is the generated task set, and it
carries no `turbo.json`, as the library scaffold emits none. Its runtime
dependencies are `effect`, `@beep/identity`, `@beep/jsonc`, `@beep/schema`,
`@beep/toml`, `@beep/utils`, `@beep/walker` and `@beep/yaml`, all already in the
graph. Its devDependencies add the three conformance oracles `jsonc-parser`,
`yaml` (both `catalog:`) and `smol-toml` (`^1.9.1`, the range `@beep/toml`
already uses); all three were installed before this branch, so nothing new
enters `bun.lock` beyond the edges.

## Turbo coupling (W3-8 / W3-e), measured against current main

Measured from the workspace `dependencies` closures at `origin/main`
6964eeb85b and at this branch head with main merged (the branch's own head
lacks main's `@beep/markdown` edge from #2114):

| Importer | Closure on main | Closure after merge | Added |
| --- | --- | --- | --- |
| `@beep/repo-docgen` | 11 | 15 | `@beep/config-file`, `@beep/jsonc`, `@beep/toml`, `@beep/yaml` |
| `@beep/repo-cli` | 51 | 52 | `@beep/config-file` (main already reaches jsonc, toml and yaml through `@beep/markdown`) |

`@beep/walker`, `@beep/schema` and `@beep/utils` were already in both closures.
So docgen's marginal coupling is the three grammars plus config-file: an edit
to any of their `src/**` now invalidates docgen's `#build`, `#check` and
`#test` cache entries, which it did not before. On this lane's base the
policy-fingerprint growth above is four packages; after merging main it is
`@beep/config-file` alone, because main's repo-cli closure already holds the
three grammars.

Trigger (W3-e): more than one grammar commit a week moves docgen's two reads
to `Jsonc.bind` with a different second importer. Measured on `origin/main`,
commits touching `packages/foundation/modeling/{yaml,toml,jsonc}/src` number 12
since the grammars were promoted on 2026-10-21. All but two are promotion
waves and repo-wide sweeps (identity annotations, effect-string waves, the
LiteralKit change); the two behaviour changes are the yaml fixes #2003 and
#2116. The window is three days of the promotion itself, so it does not decide
the trigger. The trigger is evaluated over the four weeks after wave 3 closes,
counting commits that change a grammar's behaviour; the reviewer of 3-A6 (the
next PR that edits `docgen/src/Configuration.ts`) records that count.

## Not subjects

- `@beep/identity`'s `src/packages.ts` gains the `$ConfigFileId` composer that
  `create-package` registers. This is a source edit; the manifest and task
  configuration are unchanged.
- `@beep/scratchpad`'s manifest gains `@beep/config-file`, because the lab
  `xdg` module and the lab `cli` tests import it. The policy does not report
  it, and its recorded projection is unchanged, as in waves 2b-1 and 2d-1.
- The root `tsconfig.json`, `tsconfig.packages.json`,
  `vitest.aliases.generated.json`, `standards/fallow.boundaries.generated.jsonc`
  and `bun.lock` edits only add the `@beep/config-file` wiring and record the
  new workspace edges.

Recording these subjects accepts the existing posture for the new workspace,
the dependency-only drift of the two importers, and the input-only growth of
the root policy-fingerprint task. No qualification is granted, and no other
subject changes.
