# Cache baseline review: wave 4-S

Reviewed 2026-10-23 for wave 4-S of `goals/effected-promotion` (`@beep/sbom`, plan decision W4-b).

`bun run beep quality cache-policy` reported 8 blocking findings, all
introduced by this branch and all of one kind: unreviewed expansion for the
new workspace `@beep/sbom`, on eight task tuples (`#build`, `#check`,
`#docgen`, `#lint`, `#lint:deprecated-apis`, `#lint:jsdoc`, `#lint:laws`,
`#test`).

`@beep/sbom` was scaffolded by `bun run beep create-package` in
foundation/modeling. Its scripts block is the generated task set
(`bun run beep lint package-scripts` reports 0 drifting manifests). It carries
no `turbo.json`, as the library scaffold emits none. Its runtime dependencies
are `effect`, `@beep/identity`, `@beep/schema`, `@beep/spdx` and
`@beep/package-json` (imported type-only from its `Package` and `Person`
leaves), all already in the graph; it adds no third-party runtime dependency.
Its devDependencies are the test kit (`@beep/fc-runs`, `@beep/memfs`,
`@effect/vitest`, `@types/node`, `bun-types`) plus the `ajv` and
`ajv-formats` full-schema oracle.

The root manifest (`//`) changed too, without a reported drift: its catalog
gains two exact pins, `ajv` `8.20.0` and `ajv-formats` `3.0.1`. Both were
already in `bun.lock` at those versions (ajv 8.20.0 nested under
`@commitlint/config-validator`, `@modelcontextprotocol/sdk`, `ajv-formats` and
`conf`; ajv-formats 3.0.1 top-level). The `bun.lock` edit re-hoists ajv 8.20.0
to the top level and nests 8.18.0 under `@microsoft/tsdoc-config` (its
`~8.18.0` range), and adds no new integrity hash: the set of `sha512-` hashes
is identical before and after `bun install`. `bun run beep quality
catalog-usage` reports zero findings, and `bun run beep lint
policy-fingerprint --check` reports the fingerprint current: this sub-wave
adopts nothing in repo-cli, docgen or repo-utils. The root `tsconfig.json`,
`tsconfig.packages.json` and `vitest.aliases.generated.json` edits only add
the `@beep/sbom` wiring.

Turbo coupling: `@beep/sbom#build` runs 14 tasks
(`bunx turbo run build --filter=@beep/sbom --dry-run=json`): the package, its
runtime closure `@beep/identity`, `@beep/schema`, `@beep/spdx`,
`@beep/package-json` (and through it `@beep/jsonc`, `@beep/npm-spec`,
`@beep/semver`), and the test-kit builds `@beep/fc-runs`, `@beep/memfs`,
`@beep/test-runner`, `@beep/types`, `@beep/utils` and `@beep/data`. The
`@beep/package-json` edge is type-only in `src`, but turbo's `^build` follows
the manifest, so a package-json change rebuilds sbom; that is the accepted
cost of declaring the edge a regular dependency (its `Package` type is on the
public d.ts surface). No existing workspace other than `@beep/scratchpad`
gains `@beep/sbom` as a dependency, so no other task's `^build` closure grows.

Two other inputs changed without a reported drift, and are not subjects:

- `@beep/identity`'s `src/packages.ts` gains the `$SbomId` composer that
  `create-package` registers. This is a source edit; the manifest and task
  configuration are unchanged.
- `@beep/scratchpad`'s manifest gains `@beep/sbom`, because its lab importers
  (the sbom `SigstoreSigner` and its tests, the github-actions
  `ActionsIdentityToken` and `ActionsProvenance` and their tests) now import
  it. The policy does not report it, and its recorded projection is unchanged,
  as in waves 2b-1, 2d-1 and 3-4.

Recording these subjects accepts the existing posture for the new workspace
and the root catalog entries. No qualification is granted, and no other
subject changes.
