# CSF-020: Database error diagnostics leak SQL parameters

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 38ba635 |
| Reported age | 3w ago |
| Capture method | dom-fallback |
| Owner area | packages/drivers/drizzle/src |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

An information leak was introduced in the new database driver diagnostics. PostgresError and DrizzleError now include `query` and `params` fields populated from explicit context or native Drizzle query errors. `formatPostgresError` passes those parameters to `formatSql`, and `logPostgresError` writes the formatted output to stderr. There is no parameter redaction, allowlist, truncation policy for non-string values, or opt-in debug gate.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: Postgres and Drizzle diagnostic contexts now redact SQL parameter values before storing them in normalized errors, preserving parameter count without retaining secrets.
- Remediation status: `fixed-in-branch`
- Verification command: `bunx vitest run packages/drivers/postgres/test/Postgres.errors.test.ts packages/drivers/drizzle/test/Drizzle.errors.test.ts`
- Changed files:
  - packages/drivers/postgres/src/Postgres.errors.ts
  - packages/drivers/postgres/test/Postgres.errors.test.ts
  - packages/drivers/drizzle/src/Drizzle.errors.ts
  - packages/drivers/drizzle/test/Drizzle.errors.test.ts
- Verification notes:
  - The focused Postgres and Drizzle error suites pass with redaction coverage.

## Evidence Paths

- packages/drivers/drizzle/src/Drizzle.errors.ts
- packages/drivers/postgres/src/Postgres.errors.ts
- packages/drivers/postgres/src/Postgres.format.ts

## Validation Notes From Codex

- Confirm public error schemas expose raw query and params fields for Postgres and Drizzle.
- Confirm constructors/extractors copy explicit or native Drizzle query parameters without redaction.
- Confirm Postgres SQL formatting renders actual parameter values and formatPostgresError/logPostgresError create a log-output path.
- Dynamically demonstrate a realistic secret parameter is preserved in structured errors and printed by formatting helpers.
- Attempt crash/valgrind/debugger workflow before finalizing: no crash expected for disclosure; valgrind/gdb unavailable; LLDB ran the PoC and showed normal exit after leaking output.

## Sanitized Finding Content

```text
Finding
Database error diagnostics leak SQL parameters
Report
Chat
Severity
Medium
Adjust to improve accuracy in future scans
Commit
38ba635
3:15 PM Apr 27, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
An information leak was introduced in the new database driver diagnostics. PostgresError and DrizzleError now include `query` and `params` fields populated from explicit context or native Drizzle query errors. `formatPostgresError` passes those parameters to `formatSql`, and `logPostgresError` writes the formatted output to stderr. There is no parameter redaction, allowlist, truncation policy for non-string values, or opt-in debug gate.
This commit introduces database diagnostics that preserve raw query text and bound parameter values in public error objects. The Postgres formatter then renders those parameters verbatim for terminal/log output. SQL parameters commonly contain secrets or sensitive application data such as tokens, emails, passwords, API keys, session identifiers, or PII. Because these structured errors can be logged, serialized, returned by higher-level handlers, or sent to telemetry, this creates an information-disclosure risk. The safe default should avoid storing or printing parameter values, or should redact them by default with an explicit opt-in for local debugging.
Validation
Confirm public error schemas expose raw query and params fields for Postgres and Drizzle.
Confirm constructors/extractors copy explicit or native Drizzle query parameters without redaction.
Confirm Postgres SQL formatting renders actual parameter values and formatPostgresError/logPostgresError create a log-output path.
Dynamically demonstrate a realistic secret parameter is preserved in structured errors and printed by formatting helpers.
Attempt crash/valgrind/debugger workflow before finalizing: no crash expected for disclosure; valgrind/gdb unavailable; LLDB ran the PoC and showed normal exit after leaking output.
Validation artifact
Evidence
packages/drivers/drizzle/src/Drizzle.errors.ts
117
export class DrizzleError extends TaggedErrorClass<DrizzleError>($I`DrizzleError`)(
118
"DrizzleError",
119
{
120
operation: S.String,
121
cause: S.OptionFromOptionalKey(S.DefectWithStack),
122
query: S.OptionFromOptionalKey(S.String),
123
params: S.OptionFromOptionalKey(S.Unknown.pipe(S.Array)),
147
static readonly fromUnknown = (
148
operation: string,
149
cause?: unknown,
150
context: DrizzleErrorContext = {}
151
): DrizzleError => {
152
const nativeContext = extractNativeQueryContext(cause);
153
return new DrizzleError({
154
operation,
155
cause: O.fromUndefinedOr(cause),
156
query: O.fromUndefinedOr(context.query ?? nativeContext.query),
157
params: O.fromUndefinedOr(context.params ?? nativeContext.params),
158
});
packages/drivers/postgres/src/Postgres.errors.ts
164
export class PostgresError extends TaggedErrorClass<PostgresError>($I`PostgresError`)(
165
"PostgresError",
166
{
167
operation: S.String,
168
cause: S.OptionFromOptionalKey(S.DefectWithStack),
169
message: S.OptionFromOptionalKey(S.String),
170
sqlState: S.OptionFromOptionalKey(S.String),
171
sqlStateName: S.OptionFromOptionalKey(S.String),
172
severity: S.OptionFromOptionalKey(S.String),
173
detail: S.OptionFromOptionalKey(S.String),
174
hint: S.OptionFromOptionalKey(S.String),
175
where: S.OptionFromOptionalKey(S.String),
176
schemaName: S.OptionFromOptionalKey(S.String),
177
tableName: S.OptionFromOptionalKey(S.String),
178
columnName: S.OptionFromOptionalKey(S.String),
179
constraintName: S.OptionFromOptionalKey(S.String),
180
query: S.OptionFromOptionalKey(S.String),
181
params: S.OptionFromOptionalKey(S.Unknown.pipe(S.Array)),
182
sourceLocation: S.OptionFromOptionalKey(S.String),
202
static readonly fromUnknown = (operation: string, cause?: unknown, context: ErrorContext = {}): PostgresError => {
203
const pgError = O.getOrUndefined(extractPgLikeError(cause));
204
const drizzleContext = extractDrizzleQueryContext(cause);
205
const sqlState = context.sqlState ?? O.getOrUndefined(readString(pgError, "code"));
206
const sqlStateName =
207
context.sqlStateName ?? (sqlState === undefined ? undefined : O.getOrUndefined(getPgErrorName(sqlState)));
208
209
return new PostgresError({
210
operation,
211
cause: optionFrom(cause),
212
message: optionFrom(
213
context.message ?? O.getOrUndefined(getErrorMessage(pgError)) ?? O.getOrUndefined(getErrorMessage(cause))
214
),
215
sqlState: optionFrom(sqlState),
216
sqlStateName: optionFrom(sqlStateName),
217
severity: optionFrom(context.severity ?? O.getOrUndefined(readString(pgError, "severity"))),
218
detail: optionFrom(context.detail ?? O.getOrUndefined(readString(pgError, "detail"))),
219
hint: optionFrom(context.hint ?? O.getOrUndefined(readString(pgError, "hint"))),
220
where: optionFrom(context.where ?? O.getOrUndefined(readString(pgError, "where"))),
221
schemaName: optionFrom(context.schemaName ?? O.getOrUndefined(readString(pgError, "schema"))),
222
tableName: optionFrom(context.tableName ?? O.getOrUndefined(readString(pgError, "table"))),
223
columnName: optionFrom(context.columnName ?? O.getOrUndefined(readString(pgError, "column"))),
224
constraintName: optionFrom(context.constraintName ?? O.getOrUndefined(readString(pgError, "constraint"))),
225
query: optionFrom(context.query ?? drizzleContext.query),
226
params: optionFrom(context.params ?? drizzleContext.params),
227
sourceLocation: optionFrom(context.sourceLocation ?? O.getOrUndefined(extractSourceLocation(cause))),
228
});
packages/drivers/postgres/src/Postgres.format.ts
141
const formatParam = (value: unknown, index: number, palette: Colors): string => {
142
const label = palette.yellow(palette.bold(`$${index + 1}`));
143
const separator = palette.dim("=");
144
145
if (P.isNull(value)) {
146
return `${label}${separator}${palette.dim("null")}`;
147
}
148
if (P.isUndefined(value)) {
149
return `${label}${separator}${palette.dim("undefined")}`;
150
}
151
if (P.isString(value)) {
152
const truncated = Str.length(value) > 40 ? `${Str.slice(0, 37)(value)}...` : value;
153
return `${label}${separator}${palette.green(`"${truncated}"`)}`;
154
}
155
if (P.isNumber(value)) {
156
return `${label}${separator}${palette.cyan(`${value}`)}`;
157
}
158
if (P.isBoolean(value)) {
159
return `${label}${separator}${palette.blue(`${value}`)}`;
160
}
161
if (value instanceof Date) {
162
return `${label}${separator}${palette.magenta(value.toISOString())}`;
163
}
164
if (A.isArray(value)) {
165
const preview =
166
A.length(value) > 3
167
? `[${pipe(value, A.take(3), A.map(String), A.join(", "))}, ...]`
168
: `[${pipe(value, A.map(String), A.join(", "))}]`;
169
return `${label}${separator}${palette.cyan(preview)}`;
170
}
171
if (P.isObject(value)) {
172
return `${label}${separator}${palette.gray("[Object]")}`;
173
}
174
175
return `${label}${separator}${palette.gray(String(value))}`;
296
O.map(normalized.query, (query) => {
297
const parameters = O.getOrElse(normalized.params, A.empty<unknown>);
298
lines.push("");
299
lines.push(palette.bold(queryType(query)));
300
lines.push(formatSql(query, parameters, palette));
301
});
302
303
return A.join(lines, "\n");
304
};
305
306
/**
307
* Log a formatted Postgres failure to stderr.
308
*
309
* @example
310
* ```ts
311
* import { logPostgresError } from "@beep/postgres"
312
*
313
* const effect = logPostgresError(new Error("failed"))
314
* void effect
315
* ```
316
*
317
* @category utilities
318
* @since 0.0.0
319
*/
320
export const logPostgresError = (error: unknown): Effect.Effect<void> => Console.error(formatPostgresError(error));
Attack-path analysis
Kept at medium. The code-level bug is validated and in an intended production driver package: raw query params are stored in public error objects and rendered to stderr without redaction. The impact can be meaningful confidentiality loss, especially for tokens or PII in bind parameters. It does not justify high/critical because the repository does not show a direct public endpoint using this sink, exploitation requires a database failure plus downstream logging/serialization/read access, and there is no integrity, availability, auth bypass, or code execution impact.
Path
Failed DB operation with bind parameters --fromUnknown extracts or accepts context--> PostgresError/DrizzleError stores raw query and params --formatter reads normalized.params--> formatPostgresError/formatSql renders params --Console.error sink--> logPostgresError writes to stderr/logs --log/telemetry reader sees values--> Sensitive parameter disclosure
This is a real information-disclosure bug in an in-scope driver library. The repository defines @beep/postgres and @beep/drizzle as production database driver packages. PostgresError and DrizzleError now include public query and params fields, and fromUnknown copies explicit or native Drizzle query parameters without redaction. The Postgres formatter then renders real scalar values and logPostgresError sends the formatted result to stderr. The provided validation PoC imported the actual TypeScript sources and showed a secret token appearing in structured params and formatted output. Severity remains medium: sensitive tokens/PII/passwords can leak to logs or telemetry, but there is no direct public ingress, privilege escalation, RCE, or database access; exploitation depends on a consuming service logging these errors and on attacker/log-reader access.
Likelihood
Medium - Database errors and centralized logging are common, and the helper directly logs to stderr, but exploitation is not a direct network attack in this checkout and requires a consuming application plus log/telemetry or serialized-error access.
Impact
Medium - Raw SQL parameters can include credentials, API keys, emails, passwords, tokens, session identifiers, or other PII. Disclosure is confidentiality-only and limited to places where structured errors or stderr/log output are readable.
Assumptions
The affected driver packages are intended product/runtime artifacts because they are root workspaces and architecture documentation names them as production database capability.
Exploitability depends on a consuming application using these driver errors or logging helpers during database failures and on an attacker or low-privileged operator being able to read logs, stderr, serialized errors, or telemetry.
No cloud APIs were called; conclusions are based only on repository artifacts and the provided validation evidence.
A consuming application uses @beep/postgres or @beep/drizzle error normalization/formatting for failed database operations.
SQL bind parameters contain secrets, credentials, tokens, emails, passwords, session identifiers, or other sensitive data.
The structured error or formatted output is logged, serialized, sent to telemetry, returned by a higher-level handler, or otherwise readable by an attacker or low-privileged operator.
Controls
No redaction/sanitizer/debug opt-in found in packages/drivers/postgres/src or packages/drivers/drizzle/src for params handling.
No direct public ingress, load balancer, or service port is defined for the affected driver packages themselves.
External mitigation depends on log/telemetry access controls and consuming applications not returning serialized driver errors to untrusted clients.
Blindspots
Static-only repository review cannot verify which production services currently consume @beep/postgres/@beep/drizzle.
No deployment manifests were found proving a public network path to this exact logging sink.
Log aggregation, telemetry exporters, retention policies, and log-reader permissions are operator-dependent and not fully represented in repository artifacts.
Dependency installation was not performed during this attack-path pass; runtime behavior relies on the provided validation evidence and source inspection.
Finding content copied
Finding content copied
```
