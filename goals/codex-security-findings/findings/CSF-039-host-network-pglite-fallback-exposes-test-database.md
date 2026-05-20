# CSF-039: Host-network PGLite fallback exposes test database

## Metadata

| Field | Value |
|---|---|
| Severity | Low |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 0c25ebd |
| Reported age | 2w ago |
| Capture method | dom-fallback |
| Owner area | tooling/test-utils |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced a security bug: the new host-network fallback in startPgliteContainer can expose the PGLite test database on the host network using a fixed port and default credentials.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: The host-network PGLite fallback is absent from current HEAD, and the branch also removes the remaining default test-container password by generating a per-resource password when config omits one.
- Remediation status: `fixed-in-branch`
- Verification command: `bunx --bun vitest run packages/tooling/test-kit/test-utils/test/SqlTest.test.ts && bunx tsc --noEmit --pretty false -p packages/tooling/test-kit/test-utils/tsconfig.json`
- Changed files:
  - packages/tooling/test-kit/test-utils/src/SqlTest.ts
  - packages/tooling/test-kit/test-utils/test/SqlTest.test.ts
- Verification notes:
  - The focused SqlTest suite passes and covers generated PGLite Testcontainers passwords.

## Evidence Paths

- tooling/test-utils/docker/pglite/Dockerfile
- tooling/test-utils/src/SqlTest.ts

## Validation Notes From Codex

- Confirm the commit introduced an automatic retry from normal bridge/exposed-port startup to Docker host networking on matching container-networking errors.
- Confirm the host-network path uses the same PGLite container and fixed internal port rather than Docker's random host port mapping.
- Confirm the PGLite server command binds to 0.0.0.0:5432, which becomes a host-wide wildcard listener in host network mode.
- Confirm default database credentials are predictable postgres/postgres with database postgres and port 5432.
- Perform a full end-to-end Docker/Testcontainers connection to the actual PGLite server from a non-loopback address; blocked because Docker is not installed in the validation container.

## Sanitized Finding Content

```text
Finding
Host-network PGLite fallback exposes test database
Report
Chat
Severity
Low
Adjust to improve accuracy in future scans
Commit
0c25ebd
7:11 PM Apr 30, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced a security bug: the new host-network fallback in startPgliteContainer can expose the PGLite test database on the host network using a fixed port and default credentials.
The new retry path starts the PGLite test container with Docker host networking when normal bridge port setup fails. In host network mode, the container shares the host network namespace, so the Dockerfile command that binds pglite-server to 0.0.0.0:5432 becomes a listener on the host's network interfaces rather than an isolated container interface. The helper reports 127.0.0.1 to clients, but this does not restrict the actual bind address. Since the default port and credentials are postgres/postgres, an attacker on a reachable network segment during test execution may connect to the temporary database and read or modify test data, or disrupt tests. This is lower impact than a production service issue because it is in test tooling and only triggers after a specific bridge-networking failure, but it is a newly introduced unintended exposure.
Validation
Confirm the commit introduced an automatic retry from normal bridge/exposed-port startup to Docker host networking on matching container-networking errors.
Confirm the host-network path uses the same PGLite container and fixed internal port rather than Docker's random host port mapping.
Confirm the PGLite server command binds to 0.0.0.0:5432, which becomes a host-wide wildcard listener in host network mode.
Confirm default database credentials are predictable postgres/postgres with database postgres and port 5432.
Perform a full end-to-end Docker/Testcontainers connection to the actual PGLite server from a non-loopback address; blocked because Docker is not installed in the validation container.
Validation artifact
Evidence
tooling/test-utils/docker/pglite/Dockerfile
12
EXPOSE 5432
13
14
CMD ["./node_modules/.bin/pglite-server", "--db=memory://", "--host=0.0.0.0", "--port=5432"]
tooling/test-utils/src/SqlTest.ts
154
internalPort: PgliteTcpPort.pipe(
155
S.withConstructorDefault(Effect.succeed(5432)),
156
S.withDecodingDefaultKey(Effect.succeed(5432))
157
),
158
maxConnections: PglitePositiveInteger.pipe(
159
S.withConstructorDefault(Effect.succeed(1)),
160
S.withDecodingDefaultKey(Effect.succeed(1))
161
),
162
password: S.String.pipe(
163
S.withConstructorDefault(Effect.succeed("postgres")),
164
S.withDecodingDefaultKey(Effect.succeed("postgres"))
165
),
166
startupTimeoutMs: PglitePositiveInteger.pipe(
167
S.withConstructorDefault(Effect.succeed(60_000)),
168
S.withDecodingDefaultKey(Effect.succeed(60_000))
169
),
170
username: S.String.pipe(
171
S.withConstructorDefault(Effect.succeed("postgres")),
172
S.withDecodingDefaultKey(Effect.succeed("postgres"))
649
const startHostNetworkContainer = Effect.tryPromise({
650
try: async (): Promise<StartedPgliteContainer> => {
651
const container = await makeContainer().withNetworkMode("host").start();
652
return {
653
container,
654
host: "127.0.0.1",
655
port: config.internalPort,
667
const shouldRetryWithHostNetwork = (error: SqlTestHarnessError): boolean =>
668
pipe(
669
error.cause,
670
O.exists((cause) => {
671
const message = String(cause);
672
return (
673
Str.includes("failed to set up container networking")(message) &&
674
Str.includes("operation not supported")(message)
675
);
676
})
677
);
678
679
return yield* Effect.acquireRelease(
680
startBridgeContainer.pipe(
681
Effect.catch((error) => (shouldRetryWithHostNetwork(error) ? startHostNetworkContainer : Effect.fail(error)))
682
),
Attack-path analysis
Adjusted from medium to low because the code evidence supports a real host-network exposure, but probability and impact are both constrained. The vulnerable path is in private developer test tooling under tooling/test-utils, not the main desktop sidecar or AI SDK runtime. It only triggers after a specific bridge-networking failure and exposes an in-memory test database for the duration of test execution. The meaningful impacts are test data disclosure/modification and test disruption, not production data compromise, identity compromise, or RCE.
Path
LAN attacker --can reach host TCP/5432 during test window--> Developer/CI host running tests --runs PGLite Testcontainers driver--> Testcontainers bridge startup failure --error substring match triggers retry--> Automatic Docker host-network fallback --host network shares host namespace--> PGLite binds 0.0.0.0:5432 --attacker connects with predictable defaults--> Transient test database access/tampering
The finding is technically valid: the commit introduced an automatic retry path that switches the PGLite test container from normal Testcontainers exposed-port bridge mode to Docker host networking. The image command binds pglite-server to 0.0.0.0:5432, and host networking makes that a host-namespace listener. The driver also has fixed default database/user/password/port settings and passes them into the container. This creates a real but narrow network exposure during tests. The main limiting factors are scope and reachability: the code is private developer test tooling, the fallback requires a specific bridge-networking failure, the exposure exists only while tests run, and the data is a transient in-memory test database rather than production state.
Likelihood
Low - Exploitation requires a developer/CI run, a specific Testcontainers bridge-network failure, host-network fallback, attacker network reachability to TCP/5432, and timing during the temporary container lifetime. These conditions are realistic but not common.
Impact
Low - Unauthorized access can expose or alter a transient PGLite test database and disrupt test execution. There is no evidence this contains production data, grants production identity privileges, or enables code execution. Impact could increase only if CI tests load sensitive fixtures or if test tampering affects a release gate.
Assumptions
Docker host networking behaves normally: a process binding 0.0.0.0 inside a host-network container listens on the host network namespace.
The attacker is on a network segment that can reach the developer or CI host on TCP/5432 while the test container is running.
The PGLite Testcontainers driver is run with defaults or similarly weak credentials.
The fallback path is reached only when bridge-network container startup fails with the configured error substrings.
A developer or CI job runs the private @beep/test-utils PGLite Testcontainers SQL test driver.
The normal Testcontainers bridge/exposed-port startup fails with an error containing both 'failed to set up container networking' and 'operation not supported'.
The host-network fallback starts successfully.
TCP/5432 on the developer or CI host is reachable by the attacker.
The database uses the built-in default connection settings or otherwise attacker-known credentials.
Controls
Normal path uses Testcontainers bridge/exposed-port mapping before fallback.
Fallback is limited to a specific error substring match.
Affected component is private test tooling, not the primary runtime service.
No strong database authentication control is present because predictable defaults are configured.
No repository evidence of ingress, load balancer, Kubernetes Service, or cloud firewall exposure for this port.
Blindspots
Docker was not available in the analysis environment, so no end-to-end Testcontainers/PGLite run was performed.
Static analysis cannot determine developer or CI host firewall rules, network segmentation, or whether TCP/5432 is reachable externally.
Static analysis cannot determine whether downstream CI jobs load sensitive fixtures into this transient database.
No cloud APIs were called and no live infrastructure exposure was checked.
.specs content was excluded as requested.
Finding content copied
Finding content copied
```
