# CSF-018: Tests may target production DATABASE_URL

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | ff5d74f |
| Reported age | 2w ago |
| Capture method | dom-fallback |
| Owner area | packages/tooling/test-kit/test-utils |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

An introduced bug was found: generic application database environment variables are now treated as acceptable integration-test database URLs, creating a footgun that can mutate live databases during local or CI quality runs.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: SQL integration quality tests no longer fall back to production-like DATABASE_URL values. The branch requires the explicit BEEP_TEST_DATABASE_URL variable for SQL integration execution.
- Remediation status: `fixed-in-branch`
- Verification command: `bun test packages/tooling/tool/cli/test/quality-tasks.test.ts`
- Changed files:
  - packages/tooling/tool/cli/src/commands/Quality/Tasks.ts
  - packages/tooling/tool/cli/test/quality-tasks.test.ts
- Verification notes:
  - The quality task tests pass and now cover the explicit test database URL requirement.

## Evidence Paths

- packages/tooling/test-kit/test-utils/src/SqlTest.ts
- packages/tooling/tool/cli/src/commands/Quality/Tasks.ts

## Validation Notes From Codex

- Confirm the checked-out commit and identify whether the suspected behavior was introduced by this commit.
- Verify the SQL integration resolver accepts generic DATABASE_URL / DATABASE_URL_UNPOOLED when explicit BEEP_TEST_DATABASE_URL is absent.
- Verify the default quality integration lane uses an environment-derived URI as an external database rather than always provisioning isolated Testcontainers.
- Verify the selected URI is forwarded to child tests as BEEP_TEST_DATABASE_URL with pg-external and schema isolation enabled.
- Verify the downstream external PostgreSQL harness performs mutating/destructive DDL (CREATE SCHEMA, DROP SCHEMA ... CASCADE) on the selected database; full live PostgreSQL mutation was not performed due missing dependencies/database services.

## Sanitized Finding Content

```text
Finding
Tests may target production DATABASE_URL
Report
Chat
Severity
Medium
Adjust to improve accuracy in future scans
Commit
ff5d74f
4:40 PM May 5, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
An introduced bug was found: generic application database environment variables are now treated as acceptable integration-test database URLs, creating a footgun that can mutate live databases during local or CI quality runs.
This commit changes the SQL integration resource selection so that, when BEEP_TEST_DATABASE_URL is not set, the quality command will use DATABASE_URL or DATABASE_URL_UNPOOLED. Those names commonly hold production or staging database credentials in developer shells and CI environments. The selected URI is then exported to the child test process as BEEP_TEST_DATABASE_URL with the pg-external driver enabled. The external PostgreSQL test harness creates a schema and later drops it with CASCADE on the selected database. Although schema isolation reduces the blast radius, this still performs writes and destructive cleanup against whatever database DATABASE_URL points to, without an explicit test-only opt-in or validation that the target is safe. A safer behavior would require only BEEP_TEST_DATABASE_URL for external integration databases, or require an explicit opt-in flag and validate that the database/host/name is test-scoped.
Validation
Confirm the checked-out commit and identify whether the suspected behavior was introduced by this commit.
Verify the SQL integration resolver accepts generic DATABASE_URL / DATABASE_URL_UNPOOLED when explicit BEEP_TEST_DATABASE_URL is absent.
Verify the default quality integration lane uses an environment-derived URI as an external database rather than always provisioning isolated Testcontainers.
Verify the selected URI is forwarded to child tests as BEEP_TEST_DATABASE_URL with pg-external and schema isolation enabled.
Verify the downstream external PostgreSQL harness performs mutating/destructive DDL (CREATE SCHEMA, DROP SCHEMA ... CASCADE) on the selected database; full live PostgreSQL mutation was not performed due missing dependencies/database services.
Validation artifact
Evidence
packages/tooling/test-kit/test-utils/src/SqlTest.ts
748
const createPgExternalSchema = Effect.fn("SqlTest.PgExternalTestDriver.createSchema")(function* (
749
sql: SqlClient.SqlClient,
750
schemaName: string
751
) {
752
yield* sql`CREATE SCHEMA ${sql(schemaName)}`.pipe(
753
Effect.mapError((cause) =>
754
toHarnessError("pg-external", "provision", "Failed to create external PostgreSQL test schema.", cause)
755
)
756
);
757
yield* sql`SET search_path TO ${sql(schemaName)}, public`.pipe(
758
Effect.mapError((cause) =>
759
toHarnessError("pg-external", "provision", "Failed to set external PostgreSQL test schema search path.", cause)
760
)
761
);
762
});
763
764
const dropPgExternalSchema = Effect.fn("SqlTest.PgExternalTestDriver.dropSchema")(function* (
765
sql: SqlClient.SqlClient,
766
schemaName: string
767
) {
768
yield* sql`DROP SCHEMA IF EXISTS ${sql(schemaName)} CASCADE`.pipe(
packages/tooling/tool/cli/src/commands/Quality/Tasks.ts
445
const sqlIntegrationConnectionUriFromEnv = (env: Record<string, string | undefined>): O.Option<string> =>
446
pipe(
447
usableSqlConnectionUri(env.BEEP_TEST_DATABASE_URL),
448
O.orElse(() => usableSqlConnectionUri(env.DATABASE_URL)),
449
O.orElse(() => usableSqlConnectionUri(env.DATABASE_URL_UNPOOLED))
450
);
595
const sqlIntegrationEnv = (connectionUri: string): Record<string, string> => ({
596
BEEP_TEST_DATABASE_CONNECT_TIMEOUT_MS: "5000",
597
BEEP_TEST_DATABASE_DRIVER: "pg-external",
598
BEEP_TEST_DATABASE_ISOLATION: "schema",
599
BEEP_TEST_DATABASE_MAX_CONNECTIONS: "1",
600
BEEP_TEST_DATABASE_SCHEMA_PREFIX: "beep_test",
601
BEEP_TEST_DATABASE_SSL: "false",
602
BEEP_TEST_DATABASE_URL: connectionUri,
603
});
658
const acquireDefaultSqlIntegrationResource = Effect.suspend(() =>
659
pipe(
660
sqlIntegrationConnectionUriFromEnv(process.env),
661
O.match({
662
onNone: () => acquireTestcontainersSqlIntegrationResource,
663
onSome: acquireExternalSqlIntegrationResource,
664
})
Attack-path analysis
The original medium rating is supported but should not be raised. Static evidence confirms the code path and CI reachability: generic DATABASE_URL/DATABASE_URL_UNPOOLED secrets are available in the check workflow, the integration lane invokes the quality task, the resolver selects those generic URLs when BEEP_TEST_DATABASE_URL is absent, and the pg-external harness performs mutating/destructive schema DDL. The issue is not high/critical because it is a build/developer tooling hazard rather than a public service, requires environment/CI secret misconfiguration or same-repository CI access, external fork PRs normally do not receive secrets, and schema isolation limits the expected blast radius.
Path
GitHub Actions/local root test command --CI/job environment provides generic DB secrets--> Generic DATABASE_URL or DATABASE_URL_UNPOOLED environment --fallback chooses generic DB URL--> Quality task SQL URI resolver --forwards as BEEP_TEST_DATABASE_URL--> Child test process with pg-external BEEP_TEST_DATABASE_URL --pg-external driver connects--> External PostgreSQL test harness --CREATE SCHEMA and DROP SCHEMA CASCADE--> Selected database schema writes and DROP SCHEMA CASCADE
The finding is real in code: the quality task now resolves SQL integration URLs by trying BEEP_TEST_DATABASE_URL, then generic DATABASE_URL and DATABASE_URL_UNPOOLED. When a value is found, the default resource uses an external PostgreSQL connection instead of Testcontainers and forwards that URI to child integration tests with pg-external and schema isolation. The downstream harness connects and performs CREATE SCHEMA plus DROP SCHEMA IF EXISTS ... CASCADE. Repository CI strengthens reachability because the check workflow exports DATABASE_URL and DATABASE_URL_UNPOOLED from secrets and runs `bun run test -- --integration`. Severity remains medium rather than high because there is no public ingress, fork PR secret exposure is normally blocked by GitHub, exploitation requires sensitive/non-test DB secrets and DB privileges, and schema isolation limits blast radius to a generated test schema unless tests explicitly touch shared objects.
Likelihood
Medium - The repository CI demonstrably exports generic database secrets and runs the integration lane, and local `bun run test` reaches the same code path. However, exploitation is not public; it depends on non-test DB secrets being configured, BEEP_TEST_DATABASE_URL being absent, DB privileges being sufficient, and GitHub's usual fork-secret restrictions limiting untrusted PR reach.
Impact
Medium - If the generic database secret points to production or staging, normal integration tests can create schemas, run writes, and issue DROP SCHEMA CASCADE on that database. Schema isolation reduces but does not eliminate integrity and availability risk.
Assumptions
The actual values and safety of secrets.DATABASE_URL and secrets.DATABASE_URL_UNPOOLED are unknown from repository artifacts.
GitHub Actions secrets are normally not exposed to pull_request workflows from forks, but are available on push to main and generally on same-repository pull requests.
Database impact requires the selected PostgreSQL credential to have enough privilege to connect and create/drop schemas in the target database.
No cloud APIs or live databases were queried; this assessment is static-only.
A root quality/test integration lane is run locally or in CI.
BEEP_TEST_DATABASE_URL is absent or empty.
DATABASE_URL or DATABASE_URL_UNPOOLED is present and resolves to a non-test PostgreSQL database.
The database principal permits schema creation and cleanup.
Controls
GitHub Actions secrets are normally withheld from pull_request workflows originating from forks.
The harness uses generated schema names with the `beep_test` prefix and schema isolation.
If no usable SQL URL is found, the code falls back to an isolated Testcontainers resource.
Unresolved `op://` secret references are filtered and not treated as usable connection URIs.
Workflow token permissions are limited to contents:read and pull-requests:write.
Blindspots
Actual GitHub secret values, database hostnames, database names, and database privileges are not visible in repository artifacts.
No live PostgreSQL target was used, so real data mutation was not demonstrated.
Dependency installation in the provided environment was not sufficient to run the repository's focused Bun tests end-to-end.
Repository artifacts do not prove whether DATABASE_URL is production, staging, or already a disposable test database.
GitHub organization/repository settings could alter pull_request secret behavior, but those settings are outside static repository scope.
Finding content copied
Finding content copied
```
