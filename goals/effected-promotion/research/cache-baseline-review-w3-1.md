# Cache baseline review: wave 3-1

Reviewed 2026-10-23 for wave 3-1 of `goals/effected-promotion` (`@beep/github-reporting`, decision row W3-b of
`research/wave-3-plan-2026-10-23.md`).

`bun run beep quality cache-policy` reported 8 blocking findings, all introduced by this branch and all of one kind:
unreviewed expansion for the new workspace `@beep/github-reporting`, on eight task tuples (`#build`, `#check`,
`#docgen`, `#lint`, `#lint:deprecated-apis`, `#lint:jsdoc`, `#lint:laws`, `#test`).

`@beep/github-reporting` was scaffolded by `bun run beep create-package` in foundation/modeling. Its scripts block is
the generated task set (`bun run beep lint package-scripts` reports 0 drifting manifests) and it carries no
`turbo.json`, as the library scaffold emits none. Its runtime dependencies are `effect`, `@beep/identity`,
`@beep/schema`, `@beep/utils`, `@beep/managed-section` and `@beep/markdown`, all already in the graph. Its
devDependencies are `@beep/fc-runs`, `@beep/github`, `@effect/vitest`, `@types/node`, `bun-types`, `micromark` and
`micromark-extension-gfm`; the two micromark entries resolve through root catalog pins that already existed, so the
root manifest (`//`) is unchanged and is not a subject.

## Turbo coupling of `@beep/github-reporting#test`

The plan asked for the coupling the `@beep/github` devDependency adds. Measured with
`bunx turbo run test --filter=@beep/github-reporting --dry=json`: `#test` depends on `^transit`, not `^build`, so the
devDependency schedules no build. The run holds 17 tasks; `#test` reaches 15 `#transit` nodes. Two of them are
reached only through `@beep/github`: `@beep/github#transit` and `@beep/semver#transit`. The cost is cache
invalidation, not work: an edit under `packages/drivers/github` or `packages/foundation/modeling/semver` now misses
the `@beep/github-reporting#test` cache. On `main` those directories took 2 and 4 commits in the 30 days to
2026-10-23. This is accepted: the edge exists for one test (the `CheckRunConclusion` wire-set pin against
`@beep/github/CheckRun`), and dropping it is the W3-b reversal (inline the seven conclusion literals).

`#build` and `#check` do gain driver work. turbo counts devDependencies for `^build`, and the package's
`tsconfig.json` and `tsconfig.check.json` reference `../../../drivers/github/tsconfig.json`. Measured with
`bunx turbo run build --filter=@beep/github-reporting --dry=json` (16 tasks) and `... run check ...` (17 tasks): both
schedule `@beep/github#build` and `@beep/semver#build` upstream of `@beep/github-reporting#build`. This is the first
modeling build graph that includes a driver build. The cost is one driver build (and its `semver` dependency) on a
cold cache, and a `#build`/`#check` cache miss on edits under those two directories. Reversal trigger: if a
`@beep/github` edit ever has to rebuild this package in a hot loop, or the driver's build grows a dependency on
anything heavier than `semver`, take the W3-b reversal and drop the devDependency.

Other inputs that changed without a reported drift, and are not subjects:

- `@beep/identity`'s `src/packages.ts` gains the `$GithubReportingId` composer that `create-package` registers. This
  is a source edit; the manifest and task configuration are unchanged.
- `@beep/scratchpad`'s manifest gains `@beep/github-reporting`, which the lab layering test resolves to fold the
  package into the `github-actions` lab module. The policy does not report it, as in waves 2b-1 and 2d-1.
- The root `tsconfig.json`, `tsconfig.packages.json`, `vitest.aliases.generated.json`, `bun.lock` and
  `standards/fallow.boundaries.generated.jsonc` edits only add the `@beep/github-reporting` wiring.

Recording this subject accepts the existing posture for the new workspace. No qualification is granted, and no other
subject changes.
