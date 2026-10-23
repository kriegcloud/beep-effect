# Cache baseline review: 3-A1

Reviewed 2026-10-23 for adoption PR 3-A1 of `goals/effected-promotion` (lockfiles adoption, SPEC W3-g (3-A1 part)
and W4-h (3-A1 part); `research/wave-4-plan-2026-10-23.md` row 3-A1).

`bun run beep quality cache-policy` reported 7 blocking findings and one review finding. All of them are introduced by
this branch, and all are configuration drift from one manifest edit plus its generated projections:

- `@beep/repo-cli` (`#build`, `#check`, `#doctest`, `#lint:deprecated-apis`, `#test`, `#test:property`):
  `package.json` gains the dependency `"@beep/lockfiles": "workspace:^"`, because `Quality/CatalogUsage.ts` and
  `VersionSync/internal/resolvers/RootCatalog.ts` now import `@beep/lockfiles/Lockfile`. `tsconfig.json` and
  `tsconfig.check.json` gain the matching project reference through `bun run beep tsconfig-sync`.
- `//#lint:policy-fingerprint` and the `turbo.json` review finding: `bun run beep lint policy-fingerprint --write` adds
  `packages/foundation/modeling/{lockfiles,npm-spec}/{package.json,src/**}` to the policy-tool input set in
  `standards/policy-tools.fingerprint.json` and the task's `inputs` in `turbo.json`. repo-cli is a policy tool, and
  `@beep/lockfiles` with its one dependency not already in repo-cli's closure, `@beep/npm-spec`, is now in its runtime
  closure.

## Turbo coupling

Measured with `bunx turbo run <task> --filter=@beep/repo-cli --dry=json` and the workspace dependency closure:
repo-cli's transitive workspace closure grows from 55 to 57 packages, and the two new nodes are `@beep/lockfiles` and
`@beep/npm-spec`, both foundation modeling packages. Every other `@beep/lockfiles` dependency (`@beep/identity`,
`@beep/jsonc`, `@beep/schema`, `@beep/semver`, `@beep/utils`, `@beep/yaml`) was already in the closure. `#test` (61
tasks) reaches them as `#transit` nodes and `#check` (61 tasks) as `#build` nodes. There is no driver, capability or
tooling package among the new nodes.

No script word changes (`bun run beep lint package-scripts` reports 0 drifting manifests), no third-party dependency is
added, and the new edge points at a workspace package already in the graph. `bun.lock` and
`standards/fallow.boundaries.generated.jsonc` only record the new edge. The `@beep/lockfiles` source edits (the
`alias` field, the `installName` getter and `Lockfile#rootPackage`) change no manifest or task configuration.

Recording these subjects accepts the existing posture for the changed task identities. No qualification is granted,
and no other subject changes.
