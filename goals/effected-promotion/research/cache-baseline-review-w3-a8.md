# Cache baseline review: wave 3-A8 (repo-cli adopts `GitHubMarkdown.table`)

Reviewed 2026-10-23 for PR 3-A8 of `goals/effected-promotion` (wave-3 plan 3-A8, wave-4 plan PR sequence).

`bun run beep quality cache-policy` reported 6 blocking findings, all introduced by this branch and all of one kind:
configuration drift on `@beep/repo-cli`, on six task tuples (`#build`, `#check`, `#doctest`, `#lint:deprecated-apis`,
`#test`, `#test:property`).

The cause is one manifest edit: `packages/tooling/tool/cli/package.json` gains the regular dependency
`"@beep/github-reporting": "workspace:^"`, because `Ci/RunnerLossRerun.ts` and `Ci/CiOperational.service.ts` now
render their job-summary tables through `@beep/github-reporting/GitHubMarkdown`. The scripts block is unchanged.
`bun run beep tsconfig-sync --write` added the matching project reference to the package `tsconfig.json` and
`tsconfig.check.json` and regenerated `standards/fallow.boundaries.generated.jsonc`; `bun.lock` records the new
workspace edge. No third-party dependency is added.

Turbo coupling, measured with `bunx turbo run build check test --filter=@beep/repo-cli --dry=json` on this lane with
and without the manifest line (118 tasks before, 122 after):

- added tasks: `@beep/github-reporting#build`, `@beep/github-reporting#transit`, `@beep/managed-section#build`,
  `@beep/managed-section#transit` (both foundation/modeling packages; `@beep/managed-section` is the one
  github-reporting runtime dependency repo-cli did not already reach);
- `@beep/repo-cli#build` and `#check` gain `@beep/github-reporting#build`; `#test` gains
  `@beep/github-reporting#transit`;
- no task is removed.

The root subject (`//`) drifts on one tuple, `//#lint:policy-fingerprint`, as a consequence of the same edge:
`bun run beep lint policy-fingerprint --write` adds `packages/foundation/modeling/github-reporting/{package.json,src/**}`
and `packages/foundation/modeling/managed-section/{package.json,src/**}` to the fingerprinted policy-tool closure in
`standards/policy-tools.fingerprint.json` and to that task's `inputs` in `turbo.json`, because both packages are now
reachable from repo-cli. No other `turbo.json` key changes.

This request re-records the baseline for the `@beep/repo-cli` and `//` subjects only. No qualification is granted, and
no other subject changes.
