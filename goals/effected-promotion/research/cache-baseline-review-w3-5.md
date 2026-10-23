# Cache baseline review: wave 3-5

Reviewed 2026-10-23 for wave 3-5 of `goals/effected-promotion` (`@beep/lockfiles`, decision row W3-g of
`research/wave-3-plan-2026-10-23.md`).

`bun run beep quality cache-policy` reported 8 blocking findings, all introduced by this branch and all of one kind:
unreviewed expansion for the new workspace `@beep/lockfiles`, on eight task tuples (`#build`, `#check`, `#docgen`,
`#lint`, `#lint:deprecated-apis`, `#lint:jsdoc`, `#lint:laws`, `#test`).

`@beep/lockfiles` was scaffolded by `bun run beep create-package` in foundation/modeling. Its scripts block is the
generated task set (`bun run beep lint package-scripts` reports 0 drifting manifests) and it carries no `turbo.json`,
as the library scaffold emits none. Its runtime dependencies are `effect`, `@beep/identity`, `@beep/jsonc`,
`@beep/npm-spec`, `@beep/schema`, `@beep/semver`, `@beep/utils` and `@beep/yaml`, all already in the graph. Its
devDependencies are `@beep/fc-runs`, `@effect/vitest`, `@types/node` and `bun-types`. No catalog pin was added, so the
root manifest (`//`) is unchanged and is not a subject.

## Turbo coupling

Measured with `bunx turbo run <task> --filter=@beep/lockfiles --dry=json`:

- `#test` (13 tasks) depends on `^transit` and reaches 12 `#transit` nodes: the package itself, its seven runtime
  workspace dependencies, `@beep/fc-runs`, and the test-kit closure `@beep/test-runner`, `@beep/data` and
  `@beep/types`. It schedules no build.
- `#build` (12 tasks) and `#check` (13 tasks) schedule the same 11 upstream `#build` nodes. Every one is a foundation
  modeling or test-kit package that other promoted modeling packages already build against.

There is no driver, capability or tooling package in any of the three graphs, so this package adds no coupling beyond
its declared modeling edges. The fixtures under `test/fixtures/` (266 KB) are `#test` inputs only; the suites read
them through `import.meta.glob`, so the package reads no repo-root file (the root `bun.lock` comparison is the
out-of-package `ops/lockfiles-oracle.ts`).

Other inputs that changed without a reported drift, and are not subjects:

- `@beep/identity`'s `src/packages.ts` gains the `$LockfilesId` composer that `create-package` registers. This is a
  source edit; the manifest and task configuration are unchanged.
- `@beep/scratchpad`'s manifest gains `@beep/lockfiles`, which the lab `workspaces` module imports and the lab
  layering test resolves to the `lockfiles` lab module. The policy does not report it, as in waves 2b-1, 2d-1 and
  3-1.
- The root `tsconfig.json`, `tsconfig.packages.json`, `vitest.aliases.generated.json`, `bun.lock` and
  `standards/fallow.boundaries.generated.jsonc` edits only add the `@beep/lockfiles` wiring.

Recording this subject accepts the existing posture for the new workspace. No qualification is granted, and no other
subject changes.
