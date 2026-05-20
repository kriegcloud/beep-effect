# CSF-056: Cause formatting returns reason instead of PostgresError

## Metadata

| Field | Value |
|---|---|
| Severity | Informational |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | d021c3a |
| Reported age | 3w ago |
| Capture method | dom-fallback |
| Owner area | packages/drivers/postgres/src |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced bug: Effect Cause inputs to formatPostgresError are incorrectly normalized. The code should first find a reason whose postgresErrorFromReason is Some and then unwrap it, or use a firstMapped-style helper.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: formatPostgresError now maps Cause reasons through postgresErrorFromReason, drops None values, and returns the first real PostgresError instead of returning the raw reason selected by findFirst.
- Remediation status: `fixed-in-branch`
- Verification command: `bunx --bun vitest run packages/drivers/postgres/test/Postgres.errors.test.ts --testNamePattern 'Postgres formatting' && bunx tsc --noEmit --pretty false -p packages/drivers/postgres/tsconfig.json`
- Changed files:
  - packages/drivers/postgres/src/Postgres.format.ts
- Verification notes:
  - The Postgres formatting focused tests and package typecheck pass.

## Evidence Paths

- packages/drivers/postgres/src/Postgres.format.ts

## Validation Notes From Codex

- Confirm the changed formatter path has postgresErrorFromReason returning Option<PostgresError> while postgresErrorFromCause passes it to predicate-style A.findFirst.
- Confirm A.findFirst semantics return the original Cause.Reason, not the mapped Option value, so a matching Cause.fail(PostgresError) normalizes to a reason object.
- Exercise formatPostgresError with a Cause.fail(PostgresError) and observe either invalid output or a runtime exception from treating reason fields as Options.
- Check environmental feasibility of native crash/valgrind/debugger requirements; for this TypeScript path use direct runtime crash and a noninteractive JS debugger trace if possible.
- Preserve a minimal PoC and logs demonstrating the failure path.

## Sanitized Finding Content

```text
Finding
Cause formatting returns reason instead of PostgresError
Report
Chat
Severity
Informational
Adjust to improve accuracy in future scans
Commit
d021c3a
8:48 PM Apr 27, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced bug: Effect Cause inputs to formatPostgresError are incorrectly normalized. The code should first find a reason whose postgresErrorFromReason is Some and then unwrap it, or use a firstMapped-style helper.
Postgres.format.ts now tries to extract an existing PostgresError from an Effect Cause before formatting. However, postgresErrorFromCause passes postgresErrorFromReason directly to A.findFirst. That helper is a predicate-style search and returns the original Cause.Reason element, not the Option<PostgresError> produced by postgresErrorFromReason. As a result, normalizePostgresError can return a Cause.Reason while typed as PostgresError. formatPostgresError then treats that reason object as a PostgresError and reads Option fields such as message/sqlState, which can produce invalid output or throw at runtime. This also breaks the intended Cause.fail(PostgresError) path added by the commit.
Validation
Confirm the changed formatter path has postgresErrorFromReason returning Option<PostgresError> while postgresErrorFromCause passes it to predicate-style A.findFirst.
Confirm A.findFirst semantics return the original Cause.Reason, not the mapped Option value, so a matching Cause.fail(PostgresError) normalizes to a reason object.
Exercise formatPostgresError with a Cause.fail(PostgresError) and observe either invalid output or a runtime exception from treating reason fields as Options.
Check environmental feasibility of native crash/valgrind/debugger requirements; for this TypeScript path use direct runtime crash and a noninteractive JS debugger trace if possible.
Preserve a minimal PoC and logs demonstrating the failure path.
Validation artifact
Evidence
packages/drivers/postgres/src/Postgres.format.ts
268
const postgresErrorFromReason = (reason: Cause.Reason<unknown>): O.Option<PostgresError> =>
269
pipe(
270
Result.try((): O.Option<PostgresError> => {
271
if (Cause.isFailReason(reason)) {
272
return isPostgresError(reason.error) ? O.some(reason.error) : O.none();
273
}
274
if (Cause.isDieReason(reason)) {
275
return isPostgresError(reason.defect) ? O.some(reason.defect) : O.none();
276
}
277
return O.none();
278
}),
279
Result.getOrElse(O.none)
280
);
281
282
const postgresErrorFromCause = (cause: Cause.Cause<unknown>): O.Option<PostgresError> =>
283
pipe(readCauseReasons(cause), A.findFirst(postgresErrorFromReason));
285
const normalizePostgresError = (error: unknown): PostgresError => {
286
if (isPostgresError(error)) {
287
return error;
288
}
289
290
if (isCause(error)) {
291
return pipe(
292
postgresErrorFromCause(error),
293
O.getOrElse(() => PostgresError.fromUnknown("format", error))
294
);
345
export const formatPostgresError = (error: unknown, palette: Colors = colors): string => {
346
const normalized = normalizePostgresError(error);
347
const lines = [palette.red(palette.bold("POSTGRES ERROR")), `${palette.dim("operation")} ${normalized.operation}`];
348
349
O.map(normalized.message, (message) => lines.push(`${palette.dim("message")}   ${message}`));
350
O.map(normalized.sqlState, (code) => {
Attack-path analysis
The original low-severity scanner result correctly identified a real type/normalization bug in Postgres.format.ts, and validation reproduced a runtime TypeError. For security triage, however, probability × impact does not support a vulnerability rating: the affected code is a diagnostic formatter in @beep/postgres, not an evidenced public service boundary; static repository review found no ingress, identity privilege, secret handling path, or important threat-model surface that invokes it with attacker-controlled Cause values; and the impact is limited to invalid output or a local/runtime logging crash. This should be fixed as a reliability bug, but classified as ignore for security criticality.
Path
Caller invokes formatPostgresError/logPostgresError with Effect Cause --Cause is normalized--> postgresErrorFromCause uses A.findFirst with Option-returning mapper --wrong value type returned--> normalizePostgresError unwraps a Cause.Reason as if it were PostgresError --PostgresError assumptions violated--> formatter reads PostgresError Option fields and throws or emits invalid diagnostics
The reported bug is valid as a runtime correctness issue: postgresErrorFromReason returns Option<PostgresError>, but postgresErrorFromCause supplies it directly to A.findFirst, causing a Cause.Reason to be returned where normalizePostgresError expects a PostgresError. formatPostgresError then dereferences PostgresError Option fields and can throw. However, this is an exported diagnostic helper in a private driver package, with no repository-evidenced public ingress, service account, secret reference, or cross-boundary attack path tied to the threat model. The proven impact is invalid diagnostic output or a formatter/logging crash, not a security boundary violation.
Likelihood
Ignore - The code path is reachable by direct library use, but no in-scope externally reachable product route was found that lets an attacker supply the required Effect Cause to this formatter. Exploitation would depend on a consuming application choosing this diagnostic helper and leaving the exception security-relevant.
Impact
Ignore - The demonstrated effect is a formatter/logging exception or invalid diagnostic output. There is no demonstrated account takeover, authentication bypass, authorization bypass, sensitive data disclosure, code execution, sandbox escape, or cross-tenant impact.
Assumptions
Analysis was limited to repository artifacts in /workspace/beep-effect and excluded .specs as requested.
No cloud APIs or live deployment checks were performed.
The validation-stage PoC is treated as evidence that the formatter bug is real, but not as evidence of an externally reachable security impact.
A security finding requires a realistic in-scope attacker path to a security-relevant impact, not just a runtime correctness failure.
A caller imports the @beep/postgres formatting API.
The caller passes an Effect Cause value to formatPostgresError or logPostgresError.
The Cause contains, or is treated as containing, a PostgresError reason.
The resulting formatter exception is not caught and has a security-relevant consequence in the caller.
Controls
No ingress, listener, load balancer, or port is defined by the affected formatter component.
The affected package is marked private in package.json.
The vulnerable sink is diagnostic formatting/stderr logging, not command execution, SQL execution, authorization, or secret retrieval.
No service account, managed identity, cloud role, or Kubernetes secret reference was found for this affected component.
Blindspots
Static-only analysis cannot prove how external consumers of the private package use formatPostgresError after publication.
The repository lacks installed dependencies, so live end-to-end service reachability was not re-tested in this stage.
Absence of grep hits does not prove the formatter is never invoked through dynamic imports or future code paths.
No deployment manifests for an @beep/postgres-backed service were identified in the reviewed artifacts.
Finding content copied
Finding content copied
```
