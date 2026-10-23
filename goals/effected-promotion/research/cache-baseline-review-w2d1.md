# Cache baseline review: wave 2d-1

Reviewed 2026-10-22 for wave 2d-1 of `goals/effected-promotion` (SPEC D-38
to D-46).

`bun run beep quality cache-policy` reported 8 blocking findings, all
introduced by this branch and all of one kind: unreviewed expansion for the
new workspace `@beep/markdown`, on eight task tuples (`#build`, `#check`,
`#docgen`, `#lint`, `#lint:deprecated-apis`, `#lint:jsdoc`, `#lint:laws`,
`#test`).

`@beep/markdown` was scaffolded by `bun run beep create-package` in
foundation/modeling. Its scripts block is the generated task set
(`bun run beep lint package-scripts` reports 0 drifting manifests) plus the
package-local `generate:entities` maintenance script, which no Turbo task
runs. It carries no `turbo.json`, as the library scaffold emits none. Its
dependencies are `effect`, `@beep/identity`, `@beep/schema`, `@beep/utils`,
`@beep/yaml`, `@beep/toml` and `@beep/jsonc`, all already in the graph, and
it adds no third-party runtime dependency.

The root manifest (`//`) changed too, without a reported drift: its catalog
gains `commonmark` at the exact pin `0.31.2`, which moves from
`scratchpad/package.json` to the new package's devDependencies (the
commonmark.js test oracle). `bun run beep quality catalog-usage` reports zero
findings, and `bun run beep lint policy-fingerprint --check` reports the
fingerprint current. The root `tsconfig.json`, `tsconfig.packages.json`,
`vitest.aliases.generated.json` and `bun.lock` edits only add the
`@beep/markdown` wiring and record the new workspace edges.

Two other inputs changed without a reported drift, and are not subjects:

- `@beep/identity`'s `src/packages.ts` gains the `$MarkdownId` composer that
  `create-package` registers. This is a source edit; the manifest and task
  configuration are unchanged.
- `@beep/scratchpad`'s manifest gains `@beep/markdown` and drops `commonmark`,
  because its lab importers (github-actions `GitHubMarkdown`, the cli tests)
  now import `@beep/markdown/<Module>` leaves. The policy does not report it,
  and its recorded projection is unchanged, as in wave 2b-1.

Recording these subjects accepts the existing posture for the new workspace
and the root catalog entry. No qualification is granted, and no other subject
changes.
