# CSF-059: LocalDate constructors allow impossible calendar dates

## Metadata

| Field | Value |
|---|---|
| Severity | Informational |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | b06f2f3 |
| Reported age | 3w ago |
| Capture method | dom-fallback |
| Owner area | packages/shared/domain/src |
| Triage verdict | needs-current-head-review |
| Codex close reason | pending |

## Summary

Introduced a correctness bug in the new LocalDate value module: non-string constructors and schema decoding do not enforce real calendar-day validity.

## Current-HEAD Triage

- Verdict: `needs-current-head-review`
- Rationale: Pending validation against current `HEAD`.
- Remediation status: `not-started`
- Verification command: `pending`

## Evidence Paths

- packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts
- packages/shared/domain/src/values/LocalDate/LocalDate.model.ts

## Validation Notes From Codex

- Confirm LocalDate.Model validates year, month, and day independently and allows day values up to 31 without checking the selected month/year.
- Confirm exported object constructors (make, makeOption, makeEffect) and model schema decoding are direct LocalDate.Model paths without calendar-day refinement.
- Confirm a month/year-aware validator exists and is applied to string parsing, proving the object and string boundaries are inconsistent.
- Confirm downstream methods consume the stored fields as a real date through DateTime.makeUnsafe, so invalid instances can affect later date arithmetic/conversion.
- Dynamically reproduce the exact invalid construction/crash in the real runtime; attempted but blocked by missing dependencies/workspaces, with valgrind/gdb unavailable.

## Sanitized Finding Content

```text
Finding
LocalDate constructors allow impossible calendar dates
Report
Chat
Severity
Informational
Adjust to improve accuracy in future scans
Commit
b06f2f3
7:07 AM Apr 27, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced a correctness bug in the new LocalDate value module: non-string constructors and schema decoding do not enforce real calendar-day validity.
The introduced LocalDate model only constrains day to 1..31 and month to 1..12. The string parsing paths perform month/year-aware validation, but the exported makeOption, makeEffect, and Model schema decode paths are simple bindings to LocalDate.Model and do not call that validation. As a result, callers can create LocalDate instances for impossible dates such as February 31st or June 31st. Those invalid instances may later be passed into toDateTime(), addDays(), diffInDays(), or other methods that assume a real calendar date and use DateTime.makeUnsafe, potentially causing crashes, normalization surprises, or incorrect business logic.
Validation
Confirm LocalDate.Model validates year, month, and day independently and allows day values up to 31 without checking the selected month/year.
Confirm exported object constructors (make, makeOption, makeEffect) and model schema decoding are direct LocalDate.Model paths without calendar-day refinement.
Confirm a month/year-aware validator exists and is applied to string parsing, proving the object and string boundaries are inconsistent.
Confirm downstream methods consume the stored fields as a real date through DateTime.makeUnsafe, so invalid instances can affect later date arithmetic/conversion.
Dynamically reproduce the exact invalid construction/crash in the real runtime; attempted but blocked by missing dependencies/workspaces, with valgrind/gdb unavailable.
Validation artifact
Evidence
packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts
49
export const make: typeof LocalDate.Model.make = LocalDate.Model.make.bind(LocalDate.Model);
50
51
/**
52
* Optional constructor for a `LocalDate` model.
53
*
54
* Returns `Option.none()` when the model fields fail schema validation.
55
*
56
* @example
57
* ```ts
58
* import * as O from "effect/Option"
59
* import { makeOption } from "@beep/domain/values/LocalDate/index"
60
*
61
* const date = makeOption({ year: 2024, month: 6, day: 15 })
62
*
63
* console.log(O.isSome(date)) // true
64
* ```
65
*
66
* @category constructors
67
* @param input - Calendar field payload to construct from.
68
* @returns Optional LocalDate model when the payload is valid.
69
* @since 0.0.0
70
*/
71
export const makeOption: typeof LocalDate.Model.makeOption = LocalDate.Model.makeOption.bind(LocalDate.Model);
72
73
/**
74
* Effectful constructor for a `LocalDate` model.
75
*
76
* Fails with `Schema.SchemaError` when the model fields fail schema validation.
77
*
78
* @example
79
* ```ts
80
* import { Effect } from "effect"
81
* import { makeEffect } from "@beep/domain/values/LocalDate/index"
82
*
83
* const program = Effect.gen(function* () {
84
*   const date = yield* makeEffect({ year: 2024, month: 6, day: 15 })
85
*   return date.toISOString()
86
* })
87
* ```
88
*
89
* @category constructors
90
* @param input - Calendar field payload to construct from.
91
* @returns Effect that succeeds with a LocalDate model.
92
* @since 0.0.0
93
*/
94
export const makeEffect: typeof LocalDate.Model.makeEffect = LocalDate.Model.makeEffect.bind(LocalDate.Model);
143
const isValidCalendarDate = ({ month, day, year }: CalendarParts): boolean =>
144
month >= 1 && month <= 12 && day >= 1 && day <= getDaysInMonth(year, month);
209
export const fromString = (dateString: string): Effect.Effect<LocalDate.Model, S.SchemaError> =>
210
O.match(Str.match(ISO_DATE_PATTERN)(dateString), {
211
onNone: () =>
212
Effect.fail(makeInvalidLocalDateError(dateString, "Expected an ISO 8601 local date in YYYY-MM-DD format")),
213
onSome: (match) => {
214
const parts = toCalendarParts(match);
215
216
return isValidCalendarDate(parts)
217
? decodeLocalDate(parts)
218
: Effect.fail(makeInvalidLocalDateError(dateString, "Invalid calendar date"));
packages/shared/domain/src/values/LocalDate/LocalDate.model.ts
39
export class Model extends S.Class<Model>($I`LocalDateModel`)(
40
{
41
year: S.Int.check(S.makeFilterGroup([S.isGreaterThanOrEqualTo(1), S.isLessThanOrEqualTo(9999)])),
42
month: S.Int.check(S.makeFilterGroup([S.isGreaterThanOrEqualTo(1), S.isLessThanOrEqualTo(12)])),
43
day: S.Int.check(S.makeFilterGroup([S.isGreaterThanOrEqualTo(1), S.isLessThanOrEqualTo(31)])),
44
},
153
toDateTime(): DateTime.Utc {
154
return DateTime.makeUnsafe({
155
year: this.year,
156
month: this.month,
157
day: this.day,
158
});
Attack-path analysis
Downgraded from low security severity to ignore for security triage. Static evidence confirms a real correctness bug in @beep/domain LocalDate object construction, but the repository evidence does not connect it to an in-scope attacker-controlled surface or a material security impact. The affected constructor path is a private workspace library API; observed consequences are crashes, normalization surprises, or incorrect business logic in code that already chooses to construct the object. This does not meet the bar for a security vulnerability under the provided threat model.
Path
Untrusted product input to date object fields (not found) --would need to reach; not evidenced in product code--> @beep/domain LocalDate object constructor/schema decode --independent field bounds allow impossible date--> Invalid LocalDate instance, e.g. February 31 --later conversion consumes raw fields--> toDateTime/date arithmetic using DateTime.makeUnsafe --possible crash or wrong date result, not security compromise--> Reliability/correctness failure only
The stated code bug is real: LocalDate.Model only constrains day to 1..31, while make/makeOption/makeEffect are direct bindings to that model and direct schema decode targets LocalDate.Model. The string parsing path contains real calendar validation, so object and string construction are inconsistent. However, the issue is a generic date correctness/reliability bug, not an evidenced security vulnerability. No in-scope product endpoint, Tauri command, sidecar/RPC route, sandbox/tool path, tenant boundary, identity boundary, secret sink, or executable sink was found to make attacker-controlled invalid dates security-relevant. At most, a caller that already supplies object fields can create an invalid date and later trigger incorrect date arithmetic or a crash in its own runtime.
Likelihood
Ignore - The bug is easy for a developer or direct library caller to trigger, but no realistic attacker-controlled in-scope product entry point was found. Exploitation as a security issue is therefore unlikely.
Impact
Ignore - The proven impact is invalid date construction that can affect caller-local date conversion or arithmetic. There is no demonstrated confidentiality, integrity, authorization, sandbox, identity, filesystem, or code-execution impact.
Assumptions
Analysis is limited to repository artifacts in /workspace/beep-effect and excludes .specs as requested.
The threat-model-relevant attack surfaces are the desktop shell, sidecar HTTP/RPC server, repo-memory runtime, AI SDK servers, sandbox/tool execution, and event-log sync surfaces described in the prompt.
A code-level correctness bug in a value object is only security-relevant if attacker-controlled input reaches it through an in-scope product boundary and causes a security impact.
A caller must construct @beep/domain LocalDate from object fields via Model.make, make, makeOption, makeEffect, or direct schema decoding rather than the string parser.
The caller must supply a month/day/year combination that passes independent numeric bounds but is not a real calendar date, such as 2024-02-31.
Application code must later invoke date conversion or arithmetic that assumes the fields represent a real calendar date.
For security impact, an in-scope endpoint would need to expose those object fields to an attacker; no such product use was found by repository grep.
Controls
Existing fromString/LocalDateFromString path performs month/year-aware calendar validation
@beep/domain package is marked private in package.json
No observed imports of @beep/domain/values/LocalDate from threat-model-relevant product services
No executable sink, secret sink, privileged identity operation, or cross-tenant boundary was identified
Blindspots
Dynamic reproduction was not available because the earlier validation stage reported missing workspaces/dependencies.
Some threat-model focus files such as packages/runtime/server/src/index.ts were absent from this checkout, limiting full service exposure verification.
If downstream applications outside this repository consume @beep/domain and bind object LocalDate fields directly to untrusted security-sensitive inputs, they could have application-specific logic bugs not visible in this static repository review.
A similar LocalDate implementation exists in packages/common/schema, but no security-relevant LocalDate use outside schema/Timestamp utilities was established during this pass.
Finding content copied
Finding content copied
```
