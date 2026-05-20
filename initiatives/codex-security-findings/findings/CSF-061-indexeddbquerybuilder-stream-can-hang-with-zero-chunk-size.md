# CSF-061: IndexedDbQueryBuilder stream can hang with zero chunk size

## Metadata

| Field | Value |
|---|---|
| Severity | Informational |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 1e38762 |
| Reported age | 1mo ago |
| Capture method | dom-fallback |
| Owner area | packages/platform-browser/src/IndexedDbQueryBuilder.ts |
| Triage verdict | needs-current-head-review |
| Codex close reason | pending |

## Summary

Introduced a non-terminating stream when chunkSize/limit is 0 due to missing validation and stop conditions.

## Current-HEAD Triage

- Verdict: `needs-current-head-review`
- Rationale: Pending validation against current `HEAD`.
- Remediation status: `not-started`
- Verification command: `pending`

## Evidence Paths

- packages/platform-browser/src/IndexedDbQueryBuilder.ts

## Validation Notes From Codex

- Identify how stream() derives chunkSize and whether zero/negative values are permitted.
- Verify the pagination termination conditions and show they never trigger for limit=0/chunkSize=0.
- Trace applySelect behavior with limitValue=0/offsetValue=0 to confirm empty pages do not terminate the stream.
- Reproduce the hang dynamically with a runtime test (blocked by missing dependencies/tooling).

## Sanitized Finding Content

```text
Finding
IndexedDbQueryBuilder stream can hang with zero chunk size
Report
Chat
Severity
Informational
Adjust to improve accuracy in future scans
Commit
1e38762
8:42 PM Apr 5, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced a non-terminating stream when chunkSize/limit is 0 due to missing validation and stop conditions.
SelectProto.stream computes chunkSize as the minimum of the requested chunkSize and limitValue but does not enforce a positive value. If callers set limit(0) or pass chunkSize <= 0, chunkSize becomes 0. The termination condition uses `limit && total >= limit` and `data.length < chunkSize`, both of which remain false when limit is 0 and chunkSize is 0, so Stream.paginate keeps returning Option.some even after no data remains. This causes Stream.runCollect (and similar consumers) to hang indefinitely and can lead to unbounded CPU usage.
Validation
Identify how stream() derives chunkSize and whether zero/negative values are permitted.
Verify the pagination termination conditions and show they never trigger for limit=0/chunkSize=0.
Trace applySelect behavior with limitValue=0/offsetValue=0 to confirm empty pages do not terminate the stream.
Reproduce the hang dynamically with a runtime test (blocked by missing dependencies/tooling).
Validation artifact
Evidence
packages/platform-browser/src/IndexedDbQueryBuilder.ts
1630
stream(this: IndexedDbQuery.Select<any, never>, options?: {
1631
readonly chunkSize?: number | undefined
1632
}) {
1633
const limit = this.limitValue
1634
const chunkSize = Math.min(options?.chunkSize ?? 100, limit ?? Number.MAX_SAFE_INTEGER)
1635
const initial = this.limit(chunkSize)
1636
return Stream.suspend(() => {
1637
let total = 0
1638
return Stream.paginate(initial, (select) =>
1639
Effect.map(
1640
applySelect(select as any),
1641
(data) => {
1642
total += data.length
1643
;(select as any).offsetValue = total
1644
const reachedLimit = limit && total >= limit
1645
const isPartial = data.length < chunkSize
1646
return [data, isPartial || reachedLimit ? Option.none() : Option.some(select)] as const
Attack-path analysis
Although the bug can cause an infinite stream and CPU usage, it is a local availability issue in a browser library with no demonstrated attacker-controlled input or network exposure in the threat model. The impact is self-contained to the caller, so it is out of scope for security severity.
Path
App code / caller parameters --calls stream with limit/chunkSize 0--> IndexedDbQueryBuilder.stream() --derives chunkSize=0, limit check false--> Stream.paginate loop (chunkSize=0) --termination conditions never met--> Infinite stream / CPU hang
In packages/platform-browser/src/IndexedDbQueryBuilder.ts, stream() computes chunkSize using Math.min without enforcing a positive value. If a caller sets limit(0) or chunkSize <= 0, chunkSize becomes 0 and the Stream.paginate termination checks (data.length < chunkSize and limit && total >= limit) never trigger, resulting in an infinite stream. This is a local availability bug in a browser library and is not exposed as a network attack surface in the repo’s threat model.
Likelihood
Low - Requires the caller to pass limit(0) or chunkSize <= 0; not attacker-controlled in this repo.
Impact
Low - Infinite pagination can hang the caller's runtime and consume CPU, but it does not expose data or cross trust boundaries.
Assumptions
The @effect/platform-browser package is consumed as a client-side library and not exposed as a standalone network service in production deployments.
Callers control limit/chunkSize values in code rather than receiving them directly from untrusted external users.
Caller invokes IndexedDbQueryBuilder.stream() with limit(0) or chunkSize <= 0
Controls
Caller-controlled parameters; no network exposure or auth boundary in this code path.
Blindspots
No dynamic reproduction due to missing dependencies.
Did not verify whether any shipped application exposes limit/chunkSize to untrusted users.
Finding content copied
```
