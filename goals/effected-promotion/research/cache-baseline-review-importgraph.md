# Cache baseline review: import-graph test helper

Reviewed 2026-10-23 for the D-49 correction 8 follow-up of `goals/effected-promotion` (SPEC row W3-p): the shared
import-graph walker moves into `@beep/test-utils/ImportGraph`.

`bun run beep quality cache-policy` reported 8 blocking findings, all introduced by this branch and all of one kind:
configuration drift for `@beep/github-reporting` and `@beep/markdown`, on four task tuples each (`#build`, `#check`,
`#lint:deprecated-apis`, `#test`).

Both manifests gain one devDependency, `@beep/test-utils` (`workspace:^`), so their boundary tests can import
`@beep/test-utils/ImportGraph` in place of their package-local walker copies. `bun run beep tsconfig-sync` added the
matching `../../../tooling/test-kit/test-utils/tsconfig.json` reference to each package's `tsconfig.json` and
`tsconfig.check.json`. Neither scripts block changed (`bun run beep lint package-scripts --write` reports 0 drifting
manifests), and neither package gains a runtime dependency.

## Turbo coupling

Measured with `bunx turbo run <task> --filter=<package> --dry=json` against the pre-change manifest closure:

| Task | Before | After | Added node |
| --- | --- | --- | --- |
| `@beep/markdown#build` | 11 | 12 | `@beep/test-utils#build` |
| `@beep/markdown#check` | 12 | 13 | `@beep/test-utils#build` |
| `@beep/markdown#test` | 12 | 13 | `@beep/test-utils#transit` |
| `@beep/github-reporting#build` | 16 | 17 | `@beep/test-utils#build` |
| `@beep/github-reporting#check` | 17 | 18 | `@beep/test-utils#build` |
| `@beep/github-reporting#test` | 17 | 18 | `@beep/test-utils#transit` |

Every other workspace package `@beep/test-utils` depends on (`@beep/data`, `@beep/fc-runs`, `@beep/identity`,
`@beep/schema`, `@beep/test-runner`, `@beep/utils`) was already in both closures, so the only added work is one
`@beep/test-utils` build on a cold cache. The cost is cache invalidation: an edit under
`packages/tooling/test-kit/test-utils` now misses these six caches. On `main` that directory took 23 commits in the
30 days to 2026-10-23. Nine modeling packages (`@beep/md` among them) already depend on `@beep/test-utils`.
This is accepted. Reversal: inline `ImportGraph.ts` back into each package's `test/support/`, which re-creates the
fallow clone this change removes.

Other inputs that changed without a reported drift, and are not subjects:

- `@beep/md`'s test now imports `@beep/test-utils/ImportGraph`; its manifest already listed `@beep/test-utils`, so
  nothing in its task configuration changes.
- `bun.lock` and `standards/fallow.boundaries.generated.jsonc` only record the two new devDependency edges.

Recording these subjects accepts the existing posture for the two workspaces. No qualification is granted, and no
other subject changes.
