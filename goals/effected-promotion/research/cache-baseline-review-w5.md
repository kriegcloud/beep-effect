# Cache baseline review: wave 5

Reviewed 2026-10-24 for PR W5 of `goals/effected-promotion` (`@beep/github-actions`, wave-4 plan PR sequence row W5).

`bun run beep quality cache-policy` reported 15 blocking findings, all introduced by this branch, of three kinds:

- unreviewed expansion for the new workspace `@beep/github-actions`, on eight task tuples (`#build`, `#check`,
  `#docgen`, `#lint`, `#lint:deprecated-apis`, `#lint:jsdoc`, `#lint:laws`, `#test`);
- configuration drift on `@beep/repo-cli`, on six task tuples (`#build`, `#check`, `#doctest`,
  `#lint:deprecated-apis`, `#test`, `#test:property`);
- configuration drift on the root subject (`//`), on one tuple, `//#lint:policy-fingerprint`.

`@beep/github-actions` was scaffolded by `bun run beep create-package` in the drivers family. Its scripts block is the
generated task set (`bun run beep lint package-scripts` reports 0 drifting manifests). It carries no `turbo.json`, as
the library scaffold emits none. Its runtime dependencies are `effect`, `@effect/platform-node`, `@azure/storage-blob`
and the workspace packages it already imported in the lab (`@beep/github`, `@beep/github-commands`,
`@beep/github-reporting`, `@beep/glob`, `@beep/identity`, `@beep/npm-spec`, `@beep/sbom`, `@beep/schema`,
`@beep/utils`, `@beep/walker`). Its devDependencies are the test kit (`@beep/fc-runs`, `@beep/memfs`,
`@beep/test-utils`, `@effect/vitest`, `@types/node`, `@typescript/native`, `bun-types`) and the two Azure pipeline
packages its Azure-boundary tests construct (`@azure/core-http-compat`, `@azure/core-rest-pipeline`).

The root manifest (`//`) changed in two places. Its catalog gains three exact pins, `@azure/storage-blob` `12.34.0`
(the `bun.lock` version, not the lab's `^12.33.0`, per the wave-4 plan roadmap correction 8),
`@azure/core-http-compat` `2.5.0` and `@azure/core-rest-pipeline` `1.25.0`; all three were already in `bun.lock` at
those versions, and the branch adds no `sha512-` integrity hash to `bun.lock`. Its `workspaces` list gains
`packages/drivers/github-actions`, which `create-package` appends. The root `tsconfig.json`,
`tsconfig.packages.json` and `vitest.aliases.generated.json` edits only add the `@beep/github-actions` wiring.

The `@beep/repo-cli` drift is one manifest edit: `packages/tooling/tool/cli/package.json` gains the regular
dependencies `"@beep/github-actions": "workspace:^"` and `"@beep/github-commands": "workspace:^"`, because the CI
commands (`Ci/CiOperational.service.ts`, `Ci/Ci.command.ts`, `Ci/CiAdmission.ts`, `Ci/CiRerunRunnerLoss.ts` and the
new `Ci/CiRunnerOutputs.ts`) now write the runner files through `@beep/github-actions/ActionOutputs` and print the
runner-resources warning through `@beep/github-commands/WorkflowCommand`. The scripts block is unchanged.
`bun run beep tsconfig-sync` added the matching project references to the package `tsconfig.json` and
`tsconfig.check.json` and regenerated `standards/fallow.boundaries.generated.jsonc`; `bun.lock` records the new
workspace edges. No third-party dependency is added to repo-cli.

Turbo coupling, measured on this lane:

- `bunx turbo run build --filter=@beep/github-actions --dry=json` runs 25 tasks: the package, its runtime closure
  (`@beep/github`, `@beep/github-commands`, `@beep/github-reporting`, `@beep/managed-section`, `@beep/markdown`,
  `@beep/glob`, `@beep/identity`, `@beep/npm-spec`, `@beep/sbom`, `@beep/spdx`, `@beep/package-json`,
  `@beep/jsonc`, `@beep/semver`, `@beep/schema`, `@beep/toml`, `@beep/yaml`, `@beep/utils`, `@beep/data`,
  `@beep/walker`) and the test-kit builds (`@beep/fc-runs`, `@beep/memfs`, `@beep/test-runner`, `@beep/test-utils`,
  `@beep/types`).
- `bunx turbo run build check test --filter=@beep/repo-cli --dry=json`, with and without the two manifest lines (134
  tasks before, 138 after): added tasks `@beep/github-actions#build`, `@beep/github-actions#transit`,
  `@beep/sbom#build` and `@beep/sbom#transit` (`@beep/sbom` is the one github-actions runtime dependency repo-cli did
  not already reach); `@beep/repo-cli#build` and `#check` gain `@beep/github-actions#build` and
  `@beep/github-commands#build`; `#test` gains `@beep/github-actions#transit` and `@beep/github-commands#transit`;
  no task is removed.

The root drift on `//#lint:policy-fingerprint` is a consequence of the same edge: `bun run beep lint
policy-fingerprint --write` adds `packages/drivers/github-actions/{package.json,src/**}` and
`packages/foundation/modeling/sbom/{package.json,src/**}` to the fingerprinted policy-tool closure in
`standards/policy-tools.fingerprint.json` and to that task's `inputs` in `turbo.json`, because both packages are now
reachable from repo-cli. No other `turbo.json` key changes.

Two other inputs changed without a reported drift, and are not subjects:

- `@beep/identity`'s `src/packages.ts` gains the `$GithubActionsId` composer that `create-package` registers. This is
  a source edit; the manifest and task configuration are unchanged.
- `@beep/scratchpad`'s manifest drops `@azure/storage-blob`, because the lab `github-actions` module that imported it
  left with this promotion and no lab module imports it any more. The policy does not report it, and its recorded
  projection is unchanged, as in waves 2b-1, 2d-1, 3-4 and 4-S.

This request records the new workspace and re-records the baseline for the `@beep/repo-cli` and `//` subjects. No
qualification is granted, and no other subject changes.
