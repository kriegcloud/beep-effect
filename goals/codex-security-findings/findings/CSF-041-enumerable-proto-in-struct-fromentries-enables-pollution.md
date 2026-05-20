# CSF-041: Enumerable __proto__ in Struct.fromEntries enables pollution

## Metadata

| Field | Value |
|---|---|
| Severity | Low |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 7ed5024 |
| Reported age | 3w ago |
| Capture method | dom-fallback |
| Owner area | packages/common/utils/src |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced a prototype-pollution risk by making fromEntries-defined keys enumerable/writable. Previously, non-enumerable properties prevented __proto__ from being copied during Object.assign/spread.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: Struct.fromEntries defines prototype-sensitive keys as own non-enumerable data properties, preventing Object.assign or spread from copying __proto__, constructor, or prototype into another object.
- Remediation status: `fixed-in-current-head`
- Verification command: `bunx --bun vitest run packages/foundation/modeling/utils/test/Struct.test.ts --testNamePattern 'prototype-sensitive'`
- Changed files:
  - none
- Verification notes:
  - The Struct regression verifies __proto__ remains own but non-enumerable and does not pollute assigned objects.

## Evidence Paths

- packages/common/utils/src/Struct.ts

## Validation Notes From Codex

- Confirm Struct.fromEntries now defines enumerable/writable properties (Struct.ts:600-611).
- Demonstrate enumerable "proto" appears in Object.keys and is copied by Object.assign.
- Demonstrate prior non-enumerable behavior prevents Object.assign from copying "proto".
- Build/run package directly to exercise Struct.fromEntries (not feasible without build outputs/deps).
- Demonstrate global Object.prototype pollution (not shown; only per-target prototype mutation).

## Sanitized Finding Content

```text
Finding
Enumerable __proto__ in Struct.fromEntries enables pollution
Report
Patch
Chat
Severity
Low
Adjust to improve accuracy in future scans
Commit
7ed5024
9:31 PM Apr 22, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced a prototype-pollution risk by making fromEntries-defined keys enumerable/writable. Previously, non-enumerable properties prevented __proto__ from being copied during Object.assign/spread.
The commit changes Struct.fromEntries to define properties as configurable, enumerable, and writable. When untrusted input includes a "__proto__" key, the resulting object now has an enumerable __proto__ data property. If callers subsequently merge or spread this object (a common pattern), JavaScript treats "__proto__" specially and can mutate the target's prototype, leading to prototype pollution and unexpected property injection.
Validation
Confirm Struct.fromEntries now defines enumerable/writable properties (Struct.ts:600-611).
Demonstrate enumerable "proto" appears in Object.keys and is copied by Object.assign.
Demonstrate prior non-enumerable behavior prevents Object.assign from copying "proto".
Build/run package directly to exercise Struct.fromEntries (not feasible without build outputs/deps).
Demonstrate global Object.prototype pollution (not shown; only per-target prototype mutation).
Validation artifact
Evidence
packages/common/utils/src/Struct.ts
600
export const fromEntries = <const E extends readonly [PropertyKey, unknown]>(
601
entries: Iterable<E>
602
): Simplify<{ [P in E[0]]: Extract<E, readonly [P, unknown]>[1] }> => {
603
const out: Record<PropertyKey, unknown> = {};
604
605
for (const [key, value] of entries) {
606
Reflect.defineProperty(out, key, {
607
configurable: true,
608
enumerable: true,
609
value,
610
writable: true,
611
});
Attack-path analysis
The code change is real and tests confirm enumerable __proto__ handling, which can enable prototype pollution if misused. However, repo evidence does not show attacker-controlled inputs flowing into Struct.fromEntries or a merge sink in threat-model surfaces. With reachability unproven and usage appearing static, likelihood and impact are low, so severity is downgraded from medium to low.
Path
Attacker-controlled entry pairs --keys processed--> Struct.fromEntries defines enumerable properties (including __proto__) --enumerable __proto__ propagates--> Caller merges result with Object.assign/spread --prototype chain modified--> Prototype pollution of target object
Struct.fromEntries now defines enumerable properties for all keys, and tests explicitly assert that "__proto__" is treated as a regular own property. Enumerability enables Object.assign/spread to copy a __proto__ entry and mutate a target object's prototype, a known prototype-pollution pattern. However, in-repo usage of Struct.fromEntries appears confined to tests and internal helpers with static inputs, so no threat-model attack surface is shown to feed attacker-controlled entries. This makes reachability and impact within this repo unlikely.
Likelihood
Low - Exploit requires untrusted entries and a merge/spread sink; no evidence of such call sites in the repo.
Impact
Low - If a caller merges the output into another object, an enumerable __proto__ can alter the target's prototype and inject properties, but no such attacker-controlled path is shown in this repo.
Assumptions
Repo-wide usage of Struct.fromEntries is limited to tests and internal helpers; no runtime call sites with attacker-controlled inputs were found in this checkout.
External consumers of @beep/utils are out of scope for this repo-focused analysis.
Caller passes attacker-controlled key/value pairs into Struct.fromEntries
Caller merges/spreads the resulting object into a normal object (e.g., Object.assign or spread)
Controls
No built-in key filtering in Struct.fromEntries; relies on caller sanitization.
Blindspots
Static-only review; external consumers of @beep/utils are not analyzed.
Runtime configurations and build outputs were not examined for generated usage.
Finding content copied
```
