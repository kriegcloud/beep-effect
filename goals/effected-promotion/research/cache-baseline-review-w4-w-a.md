# Cache baseline review: wave 4-W-a

Reviewed 2026-10-23 for wave 4-W-a of `goals/effected-promotion` (`@beep/repo-workspaces`, decision row W4-f of
`research/wave-4-plan-2026-10-23.md`).

`bun run beep quality cache-policy` reported 8 blocking findings, all introduced by this branch and all of one kind:
unreviewed expansion for the new workspace `@beep/repo-workspaces`, on eight task tuples (`#build`, `#check`,
`#docgen`, `#lint`, `#lint:deprecated-apis`, `#lint:jsdoc`, `#lint:laws`, `#test`).

`@beep/repo-workspaces` was scaffolded by `bun run beep create-package` in tooling/library. Its scripts block is the
generated task set (`bun run beep lint package-scripts` reports 0 drifting manifests) and it carries no `turbo.json`,
as the library scaffold emits none. Its package `test` script excludes `test/integration/**` (workspaces correction
7), and `test:integration` runs those suites; both are the generated keys. Its runtime dependencies are `effect`,
`@beep/identity`, `@beep/schema`, `@beep/utils`, `@beep/glob`, `@beep/lockfiles`, `@beep/npm-spec`,
`@beep/package-json`, `@beep/semver`, `@beep/yaml`, `@beep/walker`, the two operational-adapter drivers
`@beep/commands` and `@beep/git`, and the four `@pnpm/catalogs.*` packages. Its devDependencies are `@beep/fc-runs`,
`@beep/memfs`, `@effect/platform-node`, `@effect/vitest`, `@types/node` and `bun-types`.

## Turbo coupling

Measured with `bunx turbo run <task> --filter=@beep/repo-workspaces --dry=json`:

- `#test` (21 tasks) depends on `^transit` and reaches 20 `#transit` nodes: the package itself, its eleven workspace
  runtime dependencies, their transitive `@beep/jsonc` and `@beep/spdx`, `@beep/fc-runs`, `@beep/memfs`, and the
  test-kit closure `@beep/test-runner`, `@beep/data` and `@beep/types`. It schedules no build.
- `#build` (20 tasks) and `#check` (21 tasks) schedule the same 19 upstream `#build` nodes.

The two driver nodes, `@beep/commands` and `@beep/git` (`packages/drivers/`), are the declared operational-adapter
edges of SPEC W4-f; `test/reachability.test.ts` confines them to the modules that run git or a child process. Every
other node is a foundation package (`@beep/walker` is foundation/capability; the rest are modeling or primitive) or a
test-kit package that other promoted packages already build against. No app, slice or other tooling package is in any
of the three graphs. The fixtures under `test/fixtures/` are `#test` inputs only, and the unit suites read the
lockfile and oracle captures through `import.meta.glob`; the integration suites drive the host's git, pnpm and node
and stay out of the default `#test` (the live-repo comparison is the out-of-package
`ops/repo-workspaces-differential.ts`).

Other inputs that changed without a reported drift, and are not subjects:

- The root manifest gains the exact `@pnpm/catalogs.config`, `@pnpm/catalogs.protocol-parser`,
  `@pnpm/catalogs.resolver` and `@pnpm/catalogs.types` catalog pins (W4-f), resolving to the versions `bun.lock`
  already held. The policy does not report the root.
- `@beep/identity`'s `src/packages.ts` gains the `$RepoWorkspacesId` composer that `create-package` registers. This
  is a source edit; the manifest and task configuration are unchanged.
- `@beep/scratchpad`'s manifest gains `@beep/repo-workspaces`, which the lab `testing` cluster imports and the lab
  layering test resolves to the `workspaces` lab module. The policy does not report it, as in waves 2b-1, 2d-1,
  3-1 and 3-5.
- The root `tsconfig.json`, `tsconfig.packages.json`, `vitest.aliases.generated.json`, `bun.lock` and
  `standards/fallow.boundaries.generated.jsonc` edits only add the `@beep/repo-workspaces` wiring.

Recording this subject accepts the existing posture for the new workspace. No qualification is granted, and no other
subject changes.
