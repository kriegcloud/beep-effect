# Cache baseline review: wave 3-2

Reviewed 2026-10-23 for wave 3-2 of `goals/effected-promotion` (decision rows W3-c, W3-h and W3-j).

`bun run beep quality cache-policy` reported 14 blocking findings, all introduced by this branch, of two
kinds:

- Unreviewed expansion for the new workspace `@beep/repo-tsconfig`, on eight task tuples (`#build`,
  `#check`, `#docgen`, `#lint`, `#lint:deprecated-apis`, `#lint:jsdoc`, `#lint:laws`, `#test`).
- Configuration drift for `@beep/repo-cli`, on six task tuples (`#build`, `#check`, `#doctest`,
  `#lint:deprecated-apis`, `#test`, `#test:property`).

`@beep/repo-tsconfig` was scaffolded by `bun run beep create-package` in tooling/library. Its scripts block
is the generated task set (`bun run beep lint package-scripts` reports 0 drifting manifests). It carries no
`turbo.json`, as the library scaffold emits none. Its dependencies are `effect`, `@beep/identity`,
`@beep/jsonc`, `@beep/schema`, `@beep/tsconfig` and `@beep/walker`, all already in the graph, and it adds no
third-party runtime dependency.

The `@beep/repo-cli` drift is a dependency edit, not a task edit: the manifest drops `get-tsconfig` and gains
`@beep/repo-tsconfig`, because `EffectDiagnostics` and `TestTypecheckCoverage` now resolve tsconfig chains
through `TsconfigLoader`. The scripts block and the package's task configuration are unchanged. The turbo
coupling this adds is one workspace edge: a `@beep/repo-tsconfig` source change now invalidates the
repo-cli tasks above, as any workspace dependency does. The package is small (5 source files) and changes
rarely once promoted, so the coupling is accepted.

The root manifest (`//`) changed too, without a reported drift: its catalog drops `get-tsconfig` 4.14.3.
`bun.lock` keeps a `get-tsconfig@4.14.3` package entry as a transitive dependency of `drizzle-kit`. The root
`tsconfig.json`, `tsconfig.packages.json`, `vitest.aliases.generated.json` and `bun.lock` edits only add the
`@beep/repo-tsconfig` wiring and record the new and removed workspace edges.

After the first record, `bun run beep lint policy-fingerprint --write` widened the `//#lint:policy-fingerprint`
inputs in `turbo.json` and `standards/policy-tools.fingerprint.json`: repo-cli's fingerprinted closure now
reaches `@beep/repo-tsconfig` and, through it, `@beep/jsonc` and `@beep/tsconfig`, so their `package.json` and
`src/**` join the inputs. That is the one remaining configuration drift (`//#lint:policy-fingerprint`, with
`turbo.json` as its source), and the `//` subject covers it. The task's command is unchanged.

Two other inputs changed without a reported drift, and are not subjects:

- `@beep/identity`'s `src/packages.ts` gains the `$RepoTsconfigId` composer that `create-package`
  registers. This is a source edit; the manifest and task configuration are unchanged.
- `@beep/scratchpad`'s manifest gains `@beep/repo-tsconfig`, so the layering test's `promotedRoot` can
  resolve the package. The policy does not report it, and its recorded projection is unchanged, as in
  wave 2d-1.

Recording these subjects accepts the existing posture for the new workspace, the repo-cli dependency edit
and the root catalog removal. No qualification is granted, and no other subject changes.
