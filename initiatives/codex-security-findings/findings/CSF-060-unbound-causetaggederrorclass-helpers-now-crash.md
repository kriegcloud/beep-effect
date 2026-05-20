# CSF-060: Unbound CauseTaggedErrorClass helpers now crash

## Metadata

| Field | Value |
|---|---|
| Severity | Informational |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | bb74c4f |
| Reported age | 4w ago |
| Capture method | dom-fallback |
| Owner area | packages/common/schema/src |
| Triage verdict | needs-current-head-review |
| Codex close reason | pending |

## Summary

Introduced a runtime regression: static helpers depend on a bound `this` and will throw when invoked unbound, whereas the prior implementation used a fallback constructor.

## Current-HEAD Triage

- Verdict: `needs-current-head-review`
- Rationale: Pending validation against current `HEAD`.
- Remediation status: `not-started`
- Verification command: `pending`

## Evidence Paths

- packages/common/schema/src/CauseTaggedErrorClass.ts

## Validation Notes From Codex

- Identify helper code path where this is used without a fallback constructor (CauseTaggedErrorClass.ts:189-223).
- Confirm statics are attached without binding or fallback (CauseTaggedErrorClass.ts:284-288).
- Execute an unbound static helper and observe a runtime TypeError at new ctor(...) (bun poc-unbound-new.ts).
- Exercise unbound mapError in a runtime PoC (not needed once crash reproduced with new).

## Sanitized Finding Content

```text
Finding
Unbound CauseTaggedErrorClass helpers now crash
Report
Patch
Chat
Severity
Informational
Adjust to improve accuracy in future scans
Commit
bb74c4f
11:16 PM Apr 20, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced a runtime regression: static helpers depend on a bound `this` and will throw when invoked unbound, whereas the prior implementation used a fallback constructor.
The commit removes the fallback constructor that previously allowed `CauseTaggedErrorClass` helpers (`new`, `mapError`, and `extend`) to work even when the functions were extracted or passed around. The helpers now call `build(this, ...)` and `originalExtend.call(this, ...)` without a fallback, so if consumers destructure the statics or pass them as callbacks, `this` becomes undefined in strict mode and `new ctor(...)` or `originalExtend.call(...)` will throw. This is a regression that can crash applications using the helpers in a pipe-friendly or destructured style.
Validation
Identify helper code path where this is used without a fallback constructor (CauseTaggedErrorClass.ts:189-223).
Confirm statics are attached without binding or fallback (CauseTaggedErrorClass.ts:284-288).
Execute an unbound static helper and observe a runtime TypeError at new ctor(...) (bun poc-unbound-new.ts).
Exercise unbound mapError in a runtime PoC (not needed once crash reproduced with new).
Validation artifact
Evidence
packages/common/schema/src/CauseTaggedErrorClass.ts
189
const makeCauseTaggedErrorNew = <Error, Fields extends CauseTaggedErrorFields>(
190
fields: Fields
191
): CauseTaggedErrorNew<Error, Fields> => {
192
const hasExtras = hasExtraFields(fields);
193
const build = dual(
194
hasExtras ? 4 : 3,
195
(
196
ctor: CauseTaggedErrorCtor<Error, Fields>,
197
cause: unknown,
198
message: string,
199
extras?: CauseTaggedErrorExtrasInput<Fields>
200
) => new ctor(causeTaggedErrorInput<Fields>(cause, message, extras))
201
) as (
202
ctor: CauseTaggedErrorCtor<Error, Fields>,
203
cause: unknown,
204
message: string,
205
extras?: CauseTaggedErrorExtrasInput<Fields>
206
) => Error;
207
208
return function (
209
this: CauseTaggedErrorCtor<Error, Fields>,
210
causeOrMessage: unknown,
211
messageOrExtras?: string | CauseTaggedErrorExtrasInput<Fields>,
212
extras?: CauseTaggedErrorExtrasInput<Fields>
213
): Error | ((cause: unknown) => Error) {
214
if (hasExtras) {
215
return arguments.length >= 3
216
? build(this, causeOrMessage, messageOrExtras as string, extras)
217
: (cause: unknown) =>
218
build(this, cause, causeOrMessage as string, messageOrExtras as CauseTaggedErrorExtrasInput<Fields>);
219
}
220
221
return arguments.length >= 2
222
? build(this, causeOrMessage, messageOrExtras as string)
223
: (cause: unknown) => build(this, cause, causeOrMessage as string);
224
} as CauseTaggedErrorNew<Error, Fields>;
225
};
226
227
const makeCauseTaggedErrorMapError = <Error, Fields extends CauseTaggedErrorFields>(
228
fields: Fields
229
): CauseTaggedErrorMapError<Error, Fields> => {
230
const hasExtras = hasExtraFields(fields);
231
const build = dual(
232
hasExtras ? 4 : 3,
233
<A, E, R>(
234
ctor: CauseTaggedErrorCtor<Error, Fields>,
235
self: Effect.Effect<A, E, R>,
236
message: string,
237
extras?: CauseTaggedErrorExtrasInput<Fields>
238
): Effect.Effect<A, Error, R> =>
239
Effect.mapError(self, (cause) => new ctor(causeTaggedErrorInput<Fields>(cause, message, extras)))
240
) as <A, E, R>(
241
ctor: CauseTaggedErrorCtor<Error, Fields>,
242
self: Effect.Effect<A, E, R>,
243
message: string,
244
extras?: CauseTaggedErrorExtrasInput<Fields>
245
) => Effect.Effect<A, Error, R>;
246
247
return function <A, E, R>(
248
this: CauseTaggedErrorCtor<Error, Fields>,
249
selfOrMessage: Effect.Effect<A, E, R> | string,
250
messageOrExtras?: string | CauseTaggedErrorExtrasInput<Fields>,
251
extras?: CauseTaggedErrorExtrasInput<Fields>
252
): Effect.Effect<A, Error, R> | ((self: Effect.Effect<A, E, R>) => Effect.Effect<A, Error, R>) {
253
if (hasExtras) {
254
return arguments.length >= 3
255
? build(this, selfOrMessage as Effect.Effect<A, E, R>, messageOrExtras as string, extras)
256
: (self: Effect.Effect<A, E, R>) =>
257
build(this, self, selfOrMessage as string, messageOrExtras as CauseTaggedErrorExtrasInput<Fields>);
258
}
259
260
return arguments.length >= 2
261
? build(this, selfOrMessage as Effect.Effect<A, E, R>, messageOrExtras as string)
262
: (self: Effect.Effect<A, E, R>) => build(this, self, selfOrMessage as string);
263
} as CauseTaggedErrorMapError<Error, Fields>;
284
return withStatics(errorClass, () => ({
285
new: makeCauseTaggedErrorNew<Self, Fields>(fields),
286
mapError: makeCauseTaggedErrorMapError<Self, Fields>(fields),
287
extend: function (this: CauseTaggedErrorClassLike, identifier: string) {
288
const extend = originalExtend.call(this, identifier);
Attack-path analysis
The issue is a reliability regression in a shared helper and is not exposed through any attacker-reachable surface described in the threat model. It requires developer misuse (unbound calls) and only causes a local exception, so it does not constitute a security vulnerability.
Path
Unbound static helper invocation --call without binding--> `this` undefined in build(this, ...) --`new ctor(...)` throws--> Runtime TypeError/exception
CauseTaggedErrorClass attaches `new` and `mapError` statics that call `build(this, ...)` and ultimately `new ctor(...)` (lines 189–223, 227–263). The helpers are attached without binding to the class (lines 284–288). If a developer destructures these statics and calls them unbound, `this` becomes undefined and the constructor call throws. This is a correctness regression in a library helper, not an attacker-reachable security issue in the repo’s exposed services.
Likelihood
Ignore - Trigger requires developer code to call these statics unbound; an external attacker cannot directly force this path.
Impact
Ignore - Impact is limited to a local runtime exception when developer code misuses the helper; no data exposure, auth bypass, or boundary crossing is shown.
Assumptions
CauseTaggedErrorClass helpers are only invoked by application/developer code, not by remote attacker input.
No service in this repo exposes these helpers directly as an untrusted API surface.
Developer code destructures or passes CauseTaggedErrorClass statics (new/mapError/extend) unbound so `this` is undefined
Controls
none
Blindspots
Static-only review; did not trace all downstream usages of CauseTaggedErrorClass across the monorepo.
No runtime deployment context to verify if any network-facing endpoints expose these helpers indirectly.
Finding content copied
```
