# Cache baseline review: wave 2c

Reviewed 2026-10-21 for wave 2c of `goals/effected-promotion` (SPEC D-37).

`bun run beep quality cache-policy` reported 11 blocking findings, all
introduced by this branch and all of one kind:

- Configuration drift on `@beep/repo-utils` (`#build`, `#check`,
  `#lint:deprecated-apis`, `#test`, `#test:property`). Its manifest gains the
  `@beep/glob` workspace dependency, because `FsUtils.globFiles` now compiles
  its ignore patterns with `@beep/glob/GlobPattern` and expands includes with
  `@beep/walker/Expand`.
- Configuration drift on `@beep/repo-cli` (the same five tasks plus
  `#doctest`). Its manifest gains `@beep/glob`, because RegistrationGeometry
  validates its glob fields with `@beep/glob/GlobString` instead of the retired
  `@beep/schema/Glob`.

No command, input, output or cache flag changed on either package. Each
drifted tuple follows from the new workspace dependency.

Two more manifests changed without a reported drift, and are recorded so the
baseline matches them:

- `@beep/schema` drops the `./Glob` and `./Glob/*` export entries (source and
  `dist` maps) with the deleted `src/Glob` module.
- `@beep/utils` drops `picomatch` and `@types/picomatch` with the deleted
  `src/Glob.ts`.

The root manifest (`//`) changed too, without a reported drift: its
`devDependencies` gain `@types/picomatch` (`catalog:`). The root
`vitest.setup.ts` imports `picomatch` and is type-checked by
`tsconfig.configs.json`; until now its types came from `@beep/utils`'
dependency, and the root catalog entry would otherwise have no consumer
(`bun run beep quality catalog-usage` reports zero findings with the edit).
`bun run beep lint policy-fingerprint --check` reports the fingerprint
current, and the root `tsconfig.json`, `vitest.aliases.generated.json` and
`bun.lock` edits only drop the `@beep/schema/Glob` wiring and record the new
workspace edges.

Recording these subjects accepts the dependency-only drift of the two adopters,
the export and dependency removals of the two retiring packages, and the root
type-dependency move. No qualification is granted, and no other subject
changes.
