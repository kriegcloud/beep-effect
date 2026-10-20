# H2 review wave 1 (2026-10-14)

The requested fixes retain the standalone lane as non-required and restore all
three compiler ignore flags to false across the root and four profile copies.
The policy canary requires both the shared Effect-only finding and TypeScript
failure to fail tsc-rs. The hosted checkout probe skips only a missing lane
module; a present module reaches the CLI dispatcher. Separate stream capture
keeps valid stdout JSON intact despite stderr warnings, retains stderr in
failure excerpts, and retains a five-minute scoped timeout. #1807 retired the
catalog suppression allowance. Pin documentation now names five armed 0.52
rules and defers the brand rule to schema-opaque-default.

The approved interim exit policy is blocked: tsc-rs 0.6.0 rejects the nine new
rule names with fatal TS377134 warnings when ignore flags are false. A controlled
empty-file canary exits 2 with H2's map and 0 with main's map. Main has
the same false flags but none of those nine severity keys. The review wave
preserves the approved policy and reports the incompatibility for orchestration;
it does not silently turn off unknownRuleName or widen warning ignores.

Cache review: no package script words, lane spec, Turbo input/output patterns,
environment declarations, cache modes, or qualification scopes changed. The
checkout probe and CLI implementation edits do not change the cached command
projection. Compiler configuration bytes are already ordinary Turbo inputs;
changing their contents does not alter the qualification contract. The cache
audit reports zero blocking findings; no baseline re-record is required.

Verification summaries and exact commands are in the external H2 report and
h2-logs/review-1/. Raw command logs are not committed to the packet. Reversal:
restore this wave's flag, fixture, stream, guard and comment changes together;
do not leave a required context without a rule-enforcing exit path.

## Verification

| Check | Exit | Result |
| --- | --- | --- |
| Five CLI test files, compiler policy fixture, final dispatch replay | 0 each | 181 + 4 tests; 9-test focused replay passes |
| Standalone affected diagnostics | 0 | 291 projects, 73820 visits, zero findings, 731.863s |
| Root check / dependency build / quick package checks | 2 / 2 / 1 each | Nine unknownRuleName warnings with false ignore flags; final source typing and smoke pass |
| All nine requested cheap gates | 0 each | Cache audit has zero blockers; no baseline contract change |
| Missing/present checkout probe and empty-file compiler comparison | expected exits | Missing skips 0, present dispatches; H2 map exits 2, main map exits 0 |
| Formatting / whitespace | 0 | Clean |
