# CSF-058: PGLite test DB exposed with default credentials

## Metadata

| Field | Value |
|---|---|
| Severity | Informational |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 1dbf931 |
| Reported age | 3w ago |
| Capture method | dom-fallback |
| Owner area | tooling/test-utils |
| Triage verdict | needs-current-head-review |
| Codex close reason | pending |

## Summary

Introduced a network-exposed test database configuration with predictable credentials. The PGLite driver did not exist before this commit.

## Current-HEAD Triage

- Verdict: `needs-current-head-review`
- Rationale: Pending validation against current `HEAD`.
- Remediation status: `not-started`
- Verification command: `pending`

## Evidence Paths

- tooling/test-utils/docker/pglite/Dockerfile
- tooling/test-utils/src/SqlTest.ts

## Validation Notes From Codex

- Confirm the PGLite Testcontainers driver and Dockerfile were introduced by this commit and did not exist in the parent commit.
- Confirm default database, username, and password are predictable/well-known values (postgres).
- Confirm those credentials are passed to the server/client path and included in emitted connection metadata/URI.
- Confirm the PGLite server listens on 0.0.0.0 inside the container and Testcontainers publishes the PostgreSQL port without an explicit loopback-only bind.
- Dynamically connect as a second client over the published port while tests are running; not completed because this validation container lacks Docker and dependency installation was blocked by npm 403.

## Sanitized Finding Content

```text
Finding
PGLite test DB exposed with default credentials
Report
Chat
Severity
Informational
Adjust to improve accuracy in future scans
Commit
1dbf931
10:09 AM Apr 27, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced a network-exposed test database configuration with predictable credentials. The PGLite driver did not exist before this commit.
This commit introduces a PGLite-backed SQL test driver. By default it uses the database, username, and password all set to well-known values, then publishes the container port with Testcontainers. The bundled Docker image starts pglite-server listening on 0.0.0.0. On Docker setups where published ports bind to non-loopback interfaces, an attacker on the same network or shared CI network who discovers the ephemeral mapped port can connect with the known credentials while tests are running. That allows reading or modifying seeded integration-test data and potentially affecting test results. The impact is limited because this is a test utility and the database is ephemeral, but tests often contain realistic fixtures or secrets, so the default should be randomized credentials and/or host binding restricted to localhost.
Validation
Confirm the PGLite Testcontainers driver and Dockerfile were introduced by this commit and did not exist in the parent commit.
Confirm default database, username, and password are predictable/well-known values (postgres).
Confirm those credentials are passed to the server/client path and included in emitted connection metadata/URI.
Confirm the PGLite server listens on 0.0.0.0 inside the container and Testcontainers publishes the PostgreSQL port without an explicit loopback-only bind.
Dynamically connect as a second client over the published port while tests are running; not completed because this validation container lacks Docker and dependency installation was blocked by npm 403.
Validation artifact
Evidence
tooling/test-utils/docker/pglite/Dockerfile
12
EXPOSE 5432
13
14
CMD ["./node_modules/.bin/pglite-server", "--db=memory://", "--host=0.0.0.0", "--port=5432"]
tooling/test-utils/src/SqlTest.ts
89
export class PgliteTestcontainersTestDriverConfig extends S.Class<PgliteTestcontainersTestDriverConfig>(
90
$I`PgliteTestcontainersTestDriverConfig`
91
)(
92
{
93
database: S.String.pipe(
94
S.withConstructorDefault(Effect.succeed("postgres")),
95
S.withDecodingDefaultKey(Effect.succeed("postgres"))
96
),
97
internalPort: S.Int.pipe(
98
S.withConstructorDefault(Effect.succeed(5432)),
99
S.withDecodingDefaultKey(Effect.succeed(5432))
100
),
101
maxConnections: S.Int.pipe(
102
S.withConstructorDefault(Effect.succeed(1)),
103
S.withDecodingDefaultKey(Effect.succeed(1))
104
),
105
password: S.String.pipe(
106
S.withConstructorDefault(Effect.succeed("postgres")),
107
S.withDecodingDefaultKey(Effect.succeed("postgres"))
108
),
109
startupTimeoutMs: S.Int.pipe(
110
S.withConstructorDefault(Effect.succeed(60_000)),
111
S.withDecodingDefaultKey(Effect.succeed(60_000))
112
),
113
username: S.String.pipe(
114
S.withConstructorDefault(Effect.succeed("postgres")),
115
S.withDecodingDefaultKey(Effect.succeed("postgres"))
116
),
390
return yield* Effect.acquireRelease(
391
Effect.tryPromise({
392
try: () =>
393
image
394
.withEnvironment({
395
PGDATABASE: config.database,
396
PGPASSWORD: config.password,
397
PGPORT: `${config.internalPort}`,
398
PGUSER: config.username,
399
})
400
.withExposedPorts(config.internalPort)
401
.withHealthCheck({
402
test: ["CMD-SHELL", PgliteHealthCheckCommand],
403
interval: 250,
404
timeout: 1_000,
405
retries: 1_000,
406
})
407
.withStartupTimeout(config.startupTimeoutMs)
408
.withWaitStrategy(
409
Testcontainers.Wait.forAll([Testcontainers.Wait.forHealthCheck(), Testcontainers.Wait.forListeningPorts()])
410
)
411
.start(),
Attack-path analysis
The static code claim is mostly accurate, but the affected code is a private developer test utility under tooling/test-utils rather than an in-scope product runtime or exposed service. Even if treated as a real issue in developer/CI hygiene, probability and impact are both limited: access requires same-network/shared-CI reachability to an ephemeral Docker-published port during tests, and the database is in-memory test data. This does not support the original medium product-security severity; under the provided scoping guidance for test/local tooling, it should be ignored for main-product criticality.
Path
Developer or CI test run --test code builds layer--> @beep/test-utils PGLite Testcontainers driver --withExposedPorts publishes container port--> Docker-published ephemeral host port --reachable if bound to non-loopback host interface--> pglite-server with default credentials --known credentials allow PostgreSQL connection--> Read/modify test database
Static evidence supports the mechanical finding: the PGLite test driver defaults database, username, and password to predictable values; passes those values as environment variables; publishes the PostgreSQL port with Testcontainers; and the Docker image starts pglite-server on 0.0.0.0. That can be exploitable on Docker hosts where published ports bind to reachable non-loopback interfaces. However, the affected code is a private test utility used for integration tests, not the main product runtime, and the attack requires a same-network/shared-CI attacker, ephemeral port discovery, and a test run in progress. Impact is limited to temporary test data and test integrity rather than production data or identity compromise.
Likelihood
Low - Exploitation requires a test run in progress, Docker/Testcontainers availability, environment-specific non-loopback port publishing, attacker presence on the same reachable network or shared CI network, and discovery of an ephemeral mapped port. These conditions are plausible in some CI/developer networks but not broadly exposed.
Impact
Low - A successful connection could read or mutate only the temporary PGLite integration-test database. That may affect test correctness and could expose sensitive fixtures if a project seeds them, but no evidence shows production data, user identities, cloud credentials, or main application state are reachable.
Assumptions
Analysis is limited to static repository artifacts in /workspace/beep-effect; no cloud APIs or live Docker runtime were used.
Docker/Testcontainers host-port binding behavior is environment-dependent; the attack path requires a Docker setup that publishes mapped ports on a non-loopback interface.
The affected database contains only integration-test data unless a project or CI job seeds realistic secrets or sensitive fixtures.
A developer or CI job runs the @beep/test-utils PGLite Testcontainers driver.
Docker/Testcontainers is available and publishes the container port to a host interface reachable by the attacker.
The attacker is on the same LAN, host network, or shared CI network and discovers the ephemeral mapped port while the test container is alive.
The test database contains data or controls test results worth reading or modifying.
Controls
Package is private and test-tooling scoped.
No application ingress, Kubernetes service, load balancer, or production deployment manifest found for this PGLite container.
No strong authentication beyond the configured PostgreSQL credentials.
No explicit localhost-only Docker host binding is present in the driver code.
Blindspots
No live Docker runtime was available, so actual host-interface binding and external reachability could not be dynamically confirmed.
No CI workflow execution environment was analyzed beyond repository artifacts; a shared-runner configuration could increase practical risk.
Static search did not prove whether downstream packages outside this repository import @beep/test-utils or seed sensitive fixtures.
Testcontainers behavior can vary by Docker engine, Docker Desktop, daemon configuration, and host firewall rules.
Finding content copied
Finding content copied
```
