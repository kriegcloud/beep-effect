# CSF-036: Shared DuckDB connection breaks transaction isolation

## Metadata

| Field | Value |
|---|---|
| Severity | Low |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | fb91cc5 |
| Reported age | 1w ago |
| Capture method | dom-fallback |
| Owner area | packages/drivers/duckdb/src |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced: the commit replaced acquireUseRelease-based per-use connections with a cached shared NativeConnection and routed withTransaction through the same shared connection without any semaphore/lock.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: Native DuckDB clients and layers now wrap shared connection use in a Semaphore with one permit, so ordinary queries and withTransaction blocks do not interleave on the cached connection.
- Remediation status: `fixed-in-current-head`
- Verification command: `bunx --bun vitest run packages/drivers/duckdb/test/DuckDb.service.test.ts && bunx tsc --noEmit --pretty false -p packages/drivers/duckdb/tsconfig.json`
- Changed files:
  - none
- Verification notes:
  - Current HEAD creates a connectionLock in both makeNodeClient and makeNodeLayer.

## Evidence Paths

- packages/drivers/duckdb/src/DuckDb.service.ts

## Validation Notes From Codex

- Confirm the commit introduced a cached shared native DuckDB connection instead of per-use connection acquisition.
- Confirm withTransaction issues BEGIN/COMMIT/ROLLBACK on the same connection supplied to ordinary operations.
- Confirm normal run/query/copy operations in makeNodeClient/makeNodeLayer also use that same shared connection.
- Check for absent serialization/dedicated transaction protection such as Semaphore/Mutex/withPermit around transactions.
- Demonstrate the consequence with a deterministic interleaving/control PoC, while noting that execution against the real DuckDB package was attempted but blocked by unavailable npm dependencies.

## Sanitized Finding Content

```text
Finding
Shared DuckDB connection breaks transaction isolation
Report
Chat
Severity
Low
Adjust to improve accuracy in future scans
Commit
fb91cc5
2:47 AM May 6, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced: the commit replaced acquireUseRelease-based per-use connections with a cached shared NativeConnection and routed withTransaction through the same shared connection without any semaphore/lock.
DuckDB transactions are connection-scoped. This commit introduced a cached shared connection for all run/query/copy/transaction operations. withTransaction now issues BEGIN/COMMIT/ROLLBACK on that shared connection, while ordinary top-level run/query calls and other transactions can use the same connection concurrently. If a shared DuckDb layer or client is used by concurrent callers, one caller's statements can execute inside another caller's transaction, observe uncommitted state, be committed unexpectedly, or be rolled back by the other caller's failure. Concurrent withTransaction calls can also fail or interfere because both issue BEGIN on the same connection. Previously, each operation/transaction acquired its own connection, so this cross-fiber transaction-context bleed was not present. The default AI metrics CLI appears mostly single-run/local, so practical severity is low there, but the product-neutral driver is unsafe for shared service use without serialization or dedicated transaction connections.
Validation
Confirm the commit introduced a cached shared native DuckDB connection instead of per-use connection acquisition.
Confirm withTransaction issues BEGIN/COMMIT/ROLLBACK on the same connection supplied to ordinary operations.
Confirm normal run/query/copy operations in makeNodeClient/makeNodeLayer also use that same shared connection.
Check for absent serialization/dedicated transaction protection such as Semaphore/Mutex/withPermit around transactions.
Demonstrate the consequence with a deterministic interleaving/control PoC, while noting that execution against the real DuckDB package was attempted but blocked by unavailable npm dependencies.
Validation artifact
Evidence
packages/drivers/duckdb/src/DuckDb.service.ts
167
const acquireSharedConnection = (options: DuckDbConnectionOptions) => {
168
let nativePromise: Promise<NativeConnection> | undefined;
169
170
return (operation: string): Effect.Effect<NativeConnection, DuckDbError> =>
171
Effect.tryPromise({
172
try: () => {
173
nativePromise ??= DuckDBInstance.create(options.databasePath, options.databaseOptions)
174
.then(async (instance) => ({ connection: await instance.connect(), instance }))
175
.catch((cause) => {
176
nativePromise = undefined;
177
throw cause;
178
});
179
return nativePromise;
180
},
181
catch: connectionFailure(operation, options, undefined, "Failed to open DuckDB connection."),
182
});
253
let client: DuckDbClient;
254
const withTransaction = <A, R>(
255
use: (transaction: DuckDbClient) => Effect.Effect<A, DuckDbError, R>
256
): Effect.Effect<A, DuckDbError, R> =>
257
transactionScoped
258
? use(client)
259
: useConnection("withTransaction", (connection) =>
260
Effect.gen(function* () {
261
const transaction = makeConnectionClient(options, (_operation, useNative) => useNative(connection), true);
262
yield* runOnConnection("withTransaction", options, connection, "BEGIN TRANSACTION");
263
const exit = yield* Effect.exit(use(transaction));
264
if (Exit.isSuccess(exit)) {
265
return yield* runOnConnection("withTransaction", options, connection, "COMMIT").pipe(
266
Effect.as(exit.value)
267
);
268
}
269
270
yield* runOnConnection("withTransaction", options, connection, "ROLLBACK").pipe(
271
Effect.catch(() => Effect.void)
272
);
273
return yield* Effect.failCause(exit.cause);
274
})
293
const makeNodeClient = (options: DuckDbConnectionOptions): DuckDbClient => {
294
const getConnection = acquireSharedConnection(options);
295
return makeConnectionClient(options, (operation, use) =>
296
Effect.flatMap(getConnection(operation), ({ connection }) => use(connection))
297
);
298
};
299
300
const makeNodeLayer = (options: DuckDbConnectionOptions): Layer.Layer<DuckDb> =>
301
Layer.effectContext(
302
Effect.gen(function* () {
303
const scope = yield* Scope.Scope;
304
const getConnection = acquireScopedSharedConnection(options, scope);
305
return Context.make(
306
DuckDb,
307
DuckDb.of(
308
makeConnectionClient(options, (operation, useNative) =>
309
Effect.flatMap(getConnection(operation), ({ connection }) => useNative(connection))
310
)
Attack-path analysis
Severity remains low. The bug is real: a cached shared NativeConnection is used by run/query/copy and withTransaction, and withTransaction has no lock or dedicated connection. The practical attack path is weak in this repository because the reachable consumer is local AI metrics tooling and the install/Pulumi artifacts do not expose a DuckDB write service. A higher rating would require evidence that an in-scope network service shares this DuckDb layer across untrusted concurrent users or tenants and that sensitive data or security-critical state can be modified or observed.
Path
Concurrent in-process caller --triggers concurrent effects--> DuckDb.makeNodeLayer / makeNodeClient --reuses cached nativePromise--> Cached NativeConnection --shared transaction context affects stored data--> DuckDB database file
The finding is a real transaction-isolation bug. The commit introduced acquireSharedConnection, which caches one NativeConnection promise. makeNodeClient and makeNodeLayer route ordinary run/query/copy operations through that same cached connection. withTransaction now issues BEGIN/COMMIT/ROLLBACK on the connection supplied by that same useConnection path and there is no serialization primitive in DuckDb.service.ts. Prior validation modeled the interleaving and showed a top-level insert being rolled back by another caller's transaction. In this repository, the visible production use is the AI metrics forwarder CLI providing DuckDb.makeNodeLayer and performing a derived-storage transaction followed by sequential Parquet exports; no public endpoint or ingress was found that lets an unauthenticated attacker trigger this directly. Severity remains low because impact is limited to integrity/availability of DuckDB-backed data under concurrent shared-client use, and exploitability requires an embedding service or concurrent in-process caller not demonstrated by current repo wiring.
Likelihood
Low - Exploitation requires precise concurrent in-process use of a shared DuckDb layer/client. The visible AI metrics CLI path appears local and mostly sequential, and no public HTTP/RPC endpoint was found that exposes this driver directly.
Impact
Low - The demonstrated effect is data integrity and availability degradation: unrelated operations can be rolled back/committed with another transaction or fail due to overlapping BEGIN statements. There is no evidence of code execution, credential compromise, authentication bypass, or broad cross-tenant exposure in the repository.
Assumptions
DuckDB transaction state is scoped to a native connection.
The attacker must be able to cause concurrent operations through the same in-process DuckDb client or layer; the repository does not show a public HTTP endpoint directly exposing this driver.
Static review was limited to repository artifacts and prior validation evidence; no cloud APIs were called.
A shared DuckDb.makeNodeClient or DuckDb.makeNodeLayer instance reused by concurrent fibers/callers
One caller has an open withTransaction while another caller performs run/query/copyTableToParquet or another withTransaction
Both callers operate in the same process against the same cached native DuckDB connection
Controls
No repository-proven public ingress to the DuckDB driver
AI metrics tool internal URLs are generated as 127.0.0.1
No executable sink is implicated
No transaction mutex/semaphore or dedicated transaction connection is present in the affected driver
Blindspots
Static-only review cannot enumerate external downstream consumers of @beep/duckdb after publication.
Dependency installation/execution against the real TypeScript package was previously blocked, so the runnable proof was a behavioral model rather than an end-to-end package test.
The provided threat model may not cover all current packages in this monorepo, especially AI metrics deployment details outside repository artifacts.
Finding content copied
Finding content copied
```
