# Batch 2: Check Test Coverage

Status: `complete`

Read-only agent lane. The agent returned this report; the orchestrator persisted
it. No full test/coverage/integration/formatter/codegen lanes were run by the
agent. Graphiti MCP was unavailable in this tool surface, so the reviewer used
repo files, dry-run evidence, and local memory fallback.

## Classification

Coverage should be classified as `full-only` or `scheduled/report-only`, not
common End-to-End Green yet.

Evidence: root coverage is a direct Turbo lane in `package.json`, but it is
absent from PR Check and `audit:github quality` in `.github/workflows/check.yml`
and `packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts`. It is
non-cacheable, depends on upstream builds in `turbo.json`, and root coverage
sets `VITEST_COVERAGE_REPORT_ONLY=1`, which relaxes thresholds to zero in
`vitest.shared.ts`.

Integration should stay in common End-to-End Green, because PR Check has
`Test Integration` and local root `bun run test` includes integration by
default. Participation is incomplete: packages with `test/integration/*.test.ts`
but no `test:integration` script are currently missed by the integration lane.

## Dry-Run Evidence

Commands used were Turbo/source-inspection only, without `--summarize`.

| Lane | Dry-run result |
| --- | --- |
| `check test type-test test:integration coverage` | 489 tasks, 87 packages, 173 hits / 316 misses |
| `check test type-test` | 261 tasks, 87 packages, 173 hits / 88 misses |
| `test:integration coverage` | 228 tasks, all misses |
| `type-test` | 87 tasks, only 13 real commands, 74 `<NONEXISTENT>` |
| `test:integration` | 141 tasks: 45 real integration, 42 nonexistent, 54 build deps |
| `coverage` | 141 tasks: 86 real coverage, 1 nonexistent, 54 build deps |
| filtered real `test:integration` owners | 76 tasks: 45 real integration, 0 nonexistent, 31 build deps |
| filtered real `type-test` owners | 32 tasks: 13 real commands, 19 nonexistent |
| filtered coverage owners | 140 tasks, only one task less than unfiltered |

Remote Turbo cache was unavailable locally: `Authentication failed`. Also,
`bun.lock`, `package.json`, and `tsconfig.base.json` differ from `origin/main`,
so current `--affected` is globally broad.

## Candidate Tasks

| Rank | Task | Expected impact | Proof command | Rollback |
| --- | --- | --- | --- | --- |
| 1 | Add/fix integration-lane participation for packages with integration files. | Correctness for End-to-End Green. | `turbo run test:integration --affected --dry-run=json`; then one controlled integration lane. | Revert package script changes. |
| 2 | Exclude `test/integration/**` from unit `beep:test` where missing. | Removes unit/integration leakage. | `turbo run test --filter=<pkg> --dry-run=json`; focused package smoke if approved. | Revert package scripts. |
| 3 | Filter root integration Turbo invocation to packages with `test:integration`. | Cuts no-op integration graph from 141 to 76 dry-run tasks. | Compare dry-run JSON before/after. | Restore unfiltered Turbo command. |
| 4 | Add integration manifest lint/check. | Prevents silent future misses. | Unit test manifest scanner; dry-run no full integration needed. | Remove lint/check. |
| 5 | Separate SQL resource timing from child Turbo execution. | Makes integration bottlenecks diagnosable. | Repo-cli unit test with fake resource/child process. | Remove instrumentation. |
| 6 | Filter `type-test` to real script owners. | Smaller graph; likely modest wall-clock gain. | Compare dry-run JSON before/after and repo-cli tests. | Restore unfiltered `type-test`. |
| 7 | Keep coverage out of common green lane unless policy changes. | Avoids adding slow/report-only proof to fast gate. | Document classification; optional scheduled CI evidence. | Reclassify by reverting docs/config. |

## Specific Hotspots

- `@beep/postgres` and `@beep/drizzle` have integration tests but no
  `test:integration` script, so they are not participating in the integration
  lane.
- `@beep/db-admin` has `test:integration`, but unit `beep:test` does not exclude
  integration files, so its integration test leaks into unit discovery.
- Integration resource setup is centralized and serial: root test runs
  `test:integration --concurrency=1` after acquiring a SQL resource in
  `packages/tooling/tool/cli/src/commands/Quality/Tasks.ts`. The fallback can
  start Testcontainers when no external DB URL exists, documented in
  `packages/tooling/test-kit/test-utils/src/SqlTest.ts`.
- Coverage has resource risk because some package coverage scripts do not
  exclude integration. `@beep/test-utils` coverage can touch integration setup
  with a Testcontainers availability probe in
  `packages/tooling/test-kit/test-utils/test/integration/SqlTest.pglite.test.ts`.

## Resource Risks

Do not run full integration/coverage in parallel with other heavy lanes.
Integration may allocate a shared SQL resource or fall back to
Docker/Testcontainers; shared PGLite is explicitly constrained to one
connection. Coverage is non-cacheable, pulls build dependencies, and may discover
integration files in a few packages.

## Do Not Do

- Do not add coverage to PR Check or `audit:github quality` as a throughput fix.
- Do not treat package-local coverage as equivalent to root coverage.
- Do not remove integration from End-to-End Green; fix participation instead.
