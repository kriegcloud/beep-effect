# Agent Guide

`@beep/duckdb` is the driver-level DuckDB runtime over `@duckdb/node-api`. Its
main surface is `DuckDbClient`, an `effect/sql` `SqlClient` that reports the
`"sqlite"` dialect, plus `DuckDbMigrator` (the shared `effect/sql/Migrator`
bound to that client) and the in-memory `DuckDbTestLayer`. The legacy `DuckDb`
service (JSON rows, named `$param` records, `DuckDbAdapter` contract) stays for
existing consumers, runs on the same internals, and never provides
`SqlClient`.

It owns technical DuckDB failures (`SqlError` reasons for the client,
`DuckDbError` for the legacy service), connection and instance lifecycle,
statement compilation and value conversion. It does not own product schemas,
retention rules or projections.

Layout: public modules in `src/*.ts`; everything else in `src/internal/`
(`classify`, `convert`, `parameters`, `compiler`, `native`, `gate`,
`transaction`, `connection`, `extras`), which is not exported
(`"./internal/*": null`). An internal module exports only what another `src/`
module imports (D42): fallow dead-code is a blocking lane with a zero baseline.

User-facing semantics, the bind/read tables and the consumer support matrix
are in `README.md`. Keep the two files in step.

## Design decisions

D1 to D12 come from the gap-map critique; D13 to D43 from the implementation
SPEC; D44 onward record what implementation changed or learned.

| id | decision | reason | reversal |
| --- | --- | --- | --- |
| D1 | `dialect: "sqlite"` with a DuckDB `makeCompiler` (`?` placeholders, `defaultEscape('"')`, Postgres-style `onRecordUpdate`, empty `onCustom`) | `Dialect` is a closed union at 4.0.5 with no `"duckdb"`; `"pg"` breaks the Migrator (`to_regclass`, `LOCK TABLE`); the sqlite branch of every tested consumer works on DuckDB, and pg-style `updateValues` works with `?` | swap the compiler module |
| D2 | Savepoints emulated inside the connection with the stock `withTransaction`: `SAVEPOINT effect_sql_n` is a no-op, `ROLLBACK TO SAVEPOINT effect_sql_n` marks the transaction rollback-only | DuckDB 1.5.6 rejects every savepoint statement with a Parser Error; routing through the connection avoids a hand-copied `makeWithTransaction` and survives HEAD's signature change | override `makeWithTransaction` |
| D3 | Safe COMMIT: refuse after a nested rollback, or when the abort probe fails after any in-transaction failure | after constraint, conversion, out-of-range or interrupt errors DuckDB aborts the transaction, and COMMIT then reports success while writing nothing | drop the probe and accept DuckDB's behaviour |
| D4 | Error reasons from DuckDB message prefixes (table in `README.md` and `src/internal/classify.ts`); raw native error kept in `reason.cause` | grounded in observed messages; `makeSqliteAcquirers`' `isNoTransactionError` reads `reason.cause.message` | change the table in `classify.ts` |
| D5 | SafeIntegers-aware converter; DECIMAL width ≤ 15 → `number`, wider → exact `string`; TIME and BIT → string; BLOB → plain `Uint8Array`; 64-bit and wider integers → `number` without SafeIntegers (rounded above 2^53, documented and pinned by a test) | DECIMAL never silently lossy, fixed per column type; Bun returns `Buffer` for BLOB and BIT; the integer rounding is the SPEC's sqlite-node-style default (node:sqlite itself throws `ERR_OUT_OF_RANGE`), kept so a column's JS type never depends on its value | change the converter, or fail out-of-range integers like node:sqlite |
| D6 | `Date` binds as `timestampTZValue`; UTC by default (the "instance option" half is replaced by D13) | the only `Date` encoding correct for both TIMESTAMP and TIMESTAMPTZ columns under UTC that still types as a timestamp in untyped contexts | config knob |
| D7 | Instance policy: read-write files → `DuckDBInstance.fromCache`; `:memory:` → own instance; READ_ONLY as amended by D35 | one process-wide database per file; two RW instances of one file in one process lose writes | policy function in `native.ts` |
| D8 | `executeStream` materializes inside a transaction and streams incrementally outside one | a per-row statement on the transaction connection silently truncates a native stream at 2048 rows | flag |
| D9 | One connection per client (`makeSqliteAcquirers`) | DuckDB serializes per connection anyway; matches sqlite-node and pglite | add a reader pool |
| D10 | Legacy `DuckDb` keeps its API, runs on the shared internals, never provides `SqlClient` | existing consumers (ai-metrics, law-practice, labs) depend on JSON rows and `$param` records; providing `SqlClient` would shadow PGlite in mixed layers | keep the old implementation |
| D11 | Persistence, PersistedQueue, cluster storages and the encrypted event log are declared unsupported at 4.0.5 (documented, not guarded) | their sqlite DDL uses `AUTOINCREMENT`, `datetime()`, partial indexes and INT32 columns DuckDB rejects or overflows | DuckDB-native storage layers later |
| D12 | Private package: no changeset; consumers migrate in the same PR | repo convention for private packages | n/a |
| D13 | TimeZone is a session `SET TimeZone` on the client's connection (default `UTC`), never an instance option | instance options are part of the cached configuration: `{}` vs `{TimeZone:"UTC"}` on one file fails with `Connection Error` and would break sharing with legacy opens | instance option for `:memory:` only |
| D14 | `db.namespace` = `current_database()` name; `config.databasePath` for adopters = attached path or `:memory:` | OTel semconv names the database; the query is exact for every constructor | use the path |
| D15 | Per-connection op lock plus a settle-aware interrupt canceller around every native call | `interrupt()` is connection-wide and a late interrupt hits the next statement; a shared prepared statement races | none (correctness) |
| D16 | Prepared cache = `ScopedCache` per connection (200 entries, 10 minutes); `get`, `invalidateAll` and the cache-scope close run only under the op lock; entry finalizers `destroySync` directly; the lookup is settle-aware and destroys a late result; multi-statement and no-statement SQL cached as `RunDirect` (scope narrowed by D44) | ScopedCache joins every eviction close before the evicting call returns; an abandoned lookup used to release the lock early and leak the statement | `prepareCacheSize: 0` |
| D17 | No `backup` extra | `COPY FROM DATABASE` fails on foreign-key order and leaves a partial file | add `exportDatabase` or an ordered copy |
| D18 | Extras in a transaction: parquet export and checkpoint refuse; LOAD, INSTALL, ATTACH, DETACH run on the transaction connection | filesystem and database-level effects are not transactional; ATTACH is | change per extra |
| D19 | No class statics on the `DuckDbClient` tag | the namespace export already gives `DuckDbClient.make/layer/...` | add statics |
| D20 | Config = `typeof DuckDbClientConfigData.Encoded & { runtime and function fields }` | unbranded, accepts plain literals, works with the `Config.Wrap` record form and `Config.schema` | — |
| D21 | Reason `message` = human operation message; native text stays in `reason.cause` | upstream convention; `isNoTransactionError` needs the raw cause | put native text in `message` |
| D22 | Refused commit = `UnknownError` (`commitTransaction`), cause = original failure or the nested marker | not retryable: the caller swallowed an error | reuse the original reason |
| D23 | The commit effect refuses without issuing ROLLBACK; `onCommitFailure` rolls back | one rollback path, upstream poisoning semantics | roll back inside commit |
| D24 | File-backed tests live in `test/DuckDb.service.test.ts` | any other file would add an EV010 effect-vitest row (S31) | new file plus an accepted row |
| D25 | Legacy `makeNodeClient` kept (unscoped, documented) | keep the public API | delete in a follow-up |
| D26 | Legacy `DuckDbError.cause` = classified `SqlError` | classifier reuse; still an `Error` with the native error one level down | keep the raw error |
| D27 | `threads`, `memory_limit`, `temp_directory` stay in `databaseOptions`; no default temp directory | minimal typed surface; a default needs a path policy the driver does not own | typed fields later |
| D28 | Appender out of scope | scope | follow-up |
| D29 | An empty array binds as an empty LIST typed `LIST(SQLNULL)` through `bindTypes` (R2-DF-1); it casts into `INTEGER[]`, `VARCHAR[]` and nested LIST columns, and `SELECT ?` reads it as `INTEGER[]` | the untyped native bind refuses an empty `listValue` ("Cannot create lists with item type of ANY") but accepts it with the explicit `LIST(SQLNULL)` type the driver already passes | reject empty arrays |
| D30 | DuckDB `infinity`/`-infinity` read as those strings at every DATE/TIMESTAMP precision (sentinels checked before conversion); other values outside the JS `Date` range read as `String(value)`, TIMESTAMPTZ rendered in UTC (`+00`) instead of the upstream module-load host offset (R2-DF-3); in-range values are floored to the millisecond | the JS reader throws on out-of-range values and would fail the whole query; DATE and TIMESTAMP_S/MS `toString` print the sentinels as huge finite dates and ±infinity TIMESTAMP_NS fits the `Date` range; the upstream reader truncates toward zero and moved pre-epoch instants forward | `Date(NaN)` |
| D31 | INTERVAL `micros` follows SafeIntegers | consistency with integer columns | keep `bigint` |
| D32 | Blank SQL returns the empty result without a native call | `run("")` is a native no-op while `prepare("")` and `extractStatements("")` fail | fail |
| D33 | B1 (rename plus legacy instance policy) between A1 and A2; B2 (re-base) after A2 | barrel name collision; the legacy test fakes constrain the re-base; the instance policy must not be droppable | — |
| D34 | `makeSqliteAcquirers` without `isTransaction` (the option exists at 4.0.5) | its only use is the cleanup ROLLBACK after a failed commit or poisoning; an unconditional ROLLBACK plus the raw-cause `no transaction is active` check cannot drift from DuckDB's real state | pass `(conn) => conn.isTransaction()` |
| D35 | Client READ_ONLY opens go through `fromCache` (refused beside an in-process RW open); legacy READ_ONLY keeps `create()`; legacy RW moved to `fromCache` in B1 | a private RO instance beside RW reads corrupt blocks after a checkpoint and drops the process file lock on close; law-practice depends on legacy RO beside RW (known hazard, follow-up) | RO through `create()` |
| D36 | Result-name transform = local null-safe `makeRowTransform`, not `Statement.defaultTransforms(...).array` | upstream throws on LIST values with a leading `NULL` and on `null` elements in arrays of objects | upstream helper once fixed |
| D37 | `clearBindings()` before every bind of a cached statement | stale bindings survive a short or empty bind | — (correctness) |
| D38 | `USE` and `SET`/`RESET schema\|search_path` invalidate the connection's prepared cache | defensive on DuckDB 1.5.6: a statement with binds is re-bound per execution against the current catalog and schema, result-shape changes included (probed); only parameterless prepared statements keep their first binding, and D44 keeps those out of the cache. The clear keeps that true if a DuckDB release stops re-binding; test in `test/DuckDbClient.test.ts` | drop the invalidation |
| D39 | Internal runtime state (`TransactionPhase`, `CommitDecision`, `CachedStatement`, `ResolvedInstance`) uses `Data.*`, not schema unions | payloads hold `SqlError` instances and native handles, never wire data | schema unions |
| D40 | `attachExtras` uses `Reflect.ownKeys` / `Reflect.set` | parity with upstream `Object.assign(client, ...)` (own enumerable props survive `withoutTransforms()`), and `Object.assign` is banned | one typed `as unknown as` helper |
| D41 | `fromConnection` sets no session TimeZone unless `timeZone` is given | `SET` is session-scoped and the connection belongs to the caller | always set UTC |
| D42 | Internal modules export only what another `src/` module imports | fallow dead-code is blocking with a zero baseline and `src/internal/*` are not fallow entries | add the modules as fallow entries |
| D43 | Plain-object binds use a hoisted `S.fromJsonString(S.Unknown)` encoder | EF-3/EF-19 forbid `JSON.stringify`; bigint and cyclic values become a typed failure | — |
| D44 | Only statements with bind values use the prepared cache (`runLocked` in `src/internal/connection.ts` requires `binds.length > 0`); parameterless statements always run through `connection.run` | DuckDB 1.5.6 plans a parameterless prepared statement once with statistics propagation, so a cached constant-filter query prepared on an empty table kept returning `[]` after inserts (found by the vendored event-log suite; regression test in `test/DuckDbClient.test.ts`) | cache parameterless statements again once DuckDB re-plans them, or invalidate on write |
| D45 | Multi-statement SQL without bind values returns the rows of the first statement, except `executeStream` outside a transaction, which streams the last statement's rows | native `runAndReadAll`/`duckdb_query` behaviour, while native `stream` runs the leading statements first; splitting statements would need a tokenizer | split and return the last statement's rows |
| D46 | DECIMAL binds are documented and tested in the unscaled `bigint` form, `decimalValue(BigInt(12345), 5, 2)` | the `number` overload is `fromDouble`, and binding an overflowing value segfaults Bun | none on the driver side; it passes `DuckDB*Value` through unchanged |
| D47 | The vendored `SqlEventLogServerUnencrypted` suite takes `{ savepoints: false }`, which skips its caught-nested-rollback case; a DuckDB test in `test/DuckDbClient.eventLog.test.ts` pins the refused outer commit instead | no savepoints (D2), and at 4.0.5 the storage's `withTransaction` runs `catchIf(isSqlError, die)`, so the refusal reaches callers as a defect | drop the option when DuckDB gains savepoints |
| D48 | Vendored suites (`test/shared/*`) are adapted only where repo rules require it (`dual`-built helpers, `Entry.make`, the `@beep/test-runner` `it`), each change marked `// beep:` | tsgo rules `missingPipeableSignature` and `newSchemaClass` apply to tests; the markers keep a re-vendor diff readable | re-vendor verbatim if the rules are relaxed |
| D49 | Test plan deviations: the stream-in-transaction test uses `range(10000)`; the concurrent nested-transaction test uses two successes; resolver tests use one table per test | 10000 rows with a per-row statement is well past the 2048-row native chunk where a non-materialized stream truncates; without savepoints a failing nested branch refuses the outer commit (D2), so only the serialization of successful branches is testable; vitest runs tests concurrently (`vitest.shared.ts` `sequence.concurrent`), so shared tables collide | follow the SPEC wording |
| D50 | B2 landed: the legacy service runs every native call through `NativeGate`, and its transaction client records statement failures and interruptions and runs `ABORT_PROBE_SQL` before COMMIT; the shared connection closes under the gate lock, after a running statement settles; on an aborted transaction it runs ROLLBACK and fails with `DuckDbError` (operation `withTransaction`, cause the recorded error) | same lost-write bug as D3; one classifier and one interrupt path for both surfaces; the legacy suite stayed unchanged and green | revert `src/DuckDb.service.ts` to its B1 state (commit `017f13c4fe`) |
| D51 | The legacy re-base adds only the span `DuckDb.probeAborted`, under the legacy `DuckDb.*` namespace (`DuckDb.withTransactionOnConnection` predates the re-base) | `Effect.fn` names follow `Concept.action`; keeping the legacy concept name separates them from `DuckDbClient.*` spans | rename and re-generate the instrumentation catalog |
| D52 | A bound LIST is typed from its first item whose type has no `NULL` leaf (`bindTypes` in `src/internal/parameters.ts`, passed to every `DuckDbClient` native bind; the legacy `DuckDb` service passes its positional arrays and named `$param` records straight to node-api without bind types, so a `listValue` there is still typed from `items[0]`); an all-null list stays `LIST(SQLNULL)` | node-api `typeForValue` types a list from `items[0]` only, so `[null, 7]` bound as `LIST(SQLNULL)` and stored every item as NULL without an error; `typeForValue` is not re-exported, so the driver imports `@duckdb/node-api/lib/typeForValue.js` (the package has no `exports` map) | reject lists with a leading null |
| D53 | After the client scope closes, every statement skips the closed prepared cache and the closed native gate fails it with `ConnectionError` before it reaches the native connection (also for `fromConnection`, whose caller-owned connection stays usable); the classifier still matches the unwrapped `connection disconnected`/`instance closed` text | a closed `ScopedCache.get` interrupts its caller, which typed error handling cannot catch, and a statement queued behind teardown could otherwise start on a connection its owner is closing | let post-close statements reach the native connection |
| D54 | `layerClientConfig` is the Config-driven `layerClient` | Config-driven programs beside PGlite otherwise have to choose `layerConfig` and its `SqlClient` | hand-roll `Config.unwrap` + `layerClient` |
| D55 | Raw `COMMIT`/`END` text run inside a transaction goes through the same commit decision as `withTransaction`'s commit; on a refusal the driver runs `ROLLBACK` and fails with the refused-commit `UnknownError` (`guardedCommit` in `src/internal/connection.ts`) | a raw `BEGIN` / swallowed constraint error / raw `COMMIT` reported success and wrote nothing although the tracker had recorded the failure (review round 2); the raw caller has no `onCommitFailure`, so the driver cleans up | send raw COMMIT straight to DuckDB and document the gap |
| D56 | Legacy `DuckDbError.message` carries the native DuckDB diagnostic of a classified statement failure when no explicit message is given | the cause moved to a `SqlError` in B2, which put the native text two levels down | keep the generic default message |
| D57 | A list whose number items bind as different types takes the widest, INTEGER < BIGINT < DOUBLE, recursively through nested lists (`[1, 2.5]` is `DOUBLE[]`, `[1, 3e9]` is `BIGINT[]`) in `bindTypes` (R2-05) | upstream `typeForValue` types a list from its first item, so `[1, 2.5]` bound as `INTEGER[]` and failed with "number is not an integer"; every JS number is a double, so widening loses nothing the caller had | keep failing and point at a typed `listValue` |
| D58 | A read-write open of a file that a `readOnly` client holds in the same process is refused, not queued or downgraded: `DuckDbClient` fails with `ConnectionError`, the legacy service fails its first statement with `DuckDbError` (R2-CI-1, test in `test/DuckDb.service.test.ts`) | both opens go through `fromCache`, which refuses a second open of a cached file with a different configuration; letting RW through would need a private instance and bring back the D35 hazard | close the read-only client first, or open read-write only |

## Known hazards

- **Legacy READ_ONLY beside a read-write open of the same file.** The legacy
  service still opens READ_ONLY files with `DuckDBInstance.create()` (D35)
  because law-practice opens `practice.duckdb` READ_ONLY beside its RW
  `PracticeKgHost` in one process (`PracticeKg.references.ts`,
  `PracticeKg.claims.ts`, `PracticeKg.correspondents.ts`). Such a private RO
  instance can read corrupt or wrong blocks after the RW instance checkpoints,
  and closing it releases the process's file lock while the RW instance is
  still open, so another process can then open the file read-write. The new
  client never does this: its READ_ONLY opens are refused beside RW.
- **A `readOnly` client opened first blocks read-write opens of the file.**
  While it is open, a read-write `DuckDbClient` of the same file in the same
  process fails with `ConnectionError` and the legacy service fails its first
  statement with `DuckDbError` (D58). Open order matters: a process that opens
  a reader before its writer cannot write until every reader closes.
- **Two legacy RW opens of one file with different `databaseOptions`** now
  fail with `Connection Error ... different configuration` instead of silently
  splitting the database (B1 moved legacy RW to `fromCache`). None was found in
  the repo.
- **Caught nested rollback.** Catching a failed nested `withTransaction` and
  continuing refuses the outer COMMIT (D2, D22). Through
  `SqlEventLogServerUnencrypted` this is a defect, not a typed error (D47).
- **Stream deadlocks.** A stream consumer that issues a statement per row
  outside a transaction deadlocks on the client semaphore; on a `reserve`d
  connection it deadlocks on the op lock the stream holds. Deliberate: a
  deadlock is better than the silent 2048-row truncation the alternative
  produces.
- **`fromConnection` interrupts are connection-wide.** Cancelling a client
  statement calls `connection.interrupt()`, which can cancel a query the caller
  runs on the same connection outside the client.
- **`decimalValue(number, w, s)` that overflows** crashes Bun when bound (D46).
- **Raw `BEGIN` interrupted after DuckDB started the transaction** leaves the
  tracked phase `Idle` while DuckDB is inside a transaction, so the next
  `withTransaction` fails its BEGIN. Theoretical (BEGIN is instant) and outside
  `withTransaction`, whose BEGIN is uninterruptible.
- **Comment-only SQL** with bind values, or through `executeStream`, fails
  natively with `Error in native callback` (`UnknownError`). Not special-cased:
  detecting it needs a tokenizer and binding values to it has no meaning.
- **Number and array bind gaps.** Integral numbers outside int64 and
  arrays mixing kinds (`[1, "a"]`) fail with `UnknownError`; arrays mixing
  number kinds widen (D57). `@duckdb/node-api` 1.5.6 has no `doubleValue`
  helper and `listValue(items)` takes no item type, so the fix is the typed
  `DuckDB*Value` pass-through.
- **`DuckDb.makeNodeClient`** is unscoped and never closes its connection
  (D25).

## Upgrade notes (effect > 4.0.5)

1. Add `driver: "duckdb"` to the `SqlClient.make` options in `makeFromNative`
   (`src/DuckDbClient.service.ts`); HEAD requires it.
2. Pass `isTransaction: (conn) => isDuckDbConnection(conn) && conn.isTransaction()`
   to `MakeOptions.isTransaction` (HEAD `packages/effect/src/sql/SqlClient.ts`),
   relying on the phase tracking (a commit-time conflict already sets `Idle`).
   `makeSqliteAcquirers` already accepts `isTransaction` at 4.0.5 and stays
   without it (D34) unless the HEAD contract requires both to agree.
3. Update the Migrator tests: failed migrations become typed `MigrationError`
   failures instead of defects (HEAD `88bc68001c`).
4. Savepoint emulation is unaffected by HEAD's `makeWithTransaction` signature
   change because the driver never calls it.
5. Re-run the consumer support matrix in `README.md`: the eventlog,
   persistence and queue modules are heavily reworked at HEAD. Re-check D47
   (`catchIf(isSqlError, die)` in the event-log storage).
6. Tests read `reason.isRetryable`, the 4.0.5 getter name. Check it on the bump.
7. `@duckdb/node-api` bumps: re-run the prepared-statement probe behind D44
   (stale result of a cached parameterless statement) and the classifier
   strings in `test/DuckDbClient.classification.test.ts`.

## Follow-ups

- Appender support (D28).
- `exportDatabase(directory)` over `EXPORT DATABASE` (works from READ_ONLY), or
  a topologically ordered per-table copy, instead of the missing `backup`
  (D17).
- Optional reader pool (`maxConnections > 1`), which also removes the
  outside-transaction stream deadlock.
- DuckDB-native storage layers for the unsupported consumers (D11).
- `DuckDbMigrator` `dumpSchema`.
- Route law-practice READ_ONLY lookups through the RW `PracticeKgHost`
  connection, then move legacy READ_ONLY opens onto `fromCache` (D35).
- Delete the unscoped legacy `makeNodeClient` (D25).
