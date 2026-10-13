# Corpus restore handoff — 2026-10-13

## Run-9c scope and provenance

The latest ruling authorizes three PR6 round-two fixes, one push, thread
replies/resolution, and then stop. No wave or merge in this run. Initial
head 782196bf326a44d26d23ce4fcc7a88a18a25a877 on the existing selector branch;
clean, installed, origin/main merge already up to date. Existing selector,
orchestrator receipts and merge commit retained. PR6 #1611 open and ready.
Goal adoption is read-only and conflict-free. Goals doctor baseline: zero
new or inherited blockers, three unrelated advisories, none for this packet.

## Review correction and proof

Explicit selected denominators must equal one; mismatches return a typed
CorpusCommandError before family state. Flag help identifies objectId.
Membership schema enforces globally unique objectIds. New regression uses
a duplicate unselected identity with a differing digest, proves schema
refusal and command refusal before family state. Existing malformed-plan
fixture encodes invalid boundary data without bypassing schema construction.
Nine focused cases pass: five selector cases and four required restoration
cases. Initial new-fixture failure was corrected by enabling the required
larger synthetic PST. Quick package-verify passes lint and check; final
repeat follows the corrected test fixture. No engine behavior changes.

Initial heavy wrapper failed before work because user bus variables were
absent; the approved wrapper succeeds with existing per-user bus variables.
No configuration or unit files changed. Reversal of the three contract
changes is reverting this commit, with both sealed families retained.

## Re-measured prerequisites

| Check | State | Measured value |
| --- | --- | --- |
| P0 sealed | met | 755 directory passes, 10,696 file passes, four inherited losses, one preflight, one seal |
| Slice candidate | met | 53 PST passes, 23 eligible recycle occurrences, 56,140,800 bytes |
| Sealed transformation state | met | Original failure: expected/terminal one, unapproved one; fresh pass: expected/terminal one, unapproved zero |
| Engines | met | pffexport 20260917; bubblewrap 0.13.0; OpenJDK 27, 2026-09-15; Tika 3.3.1 |
| Engine smokes | met | Both approved beep-heavy/bwrap smokes exit zero |
| Capacity | met | 242,532,237,312 free bytes, above 100 GB floor |
| Synthetic exception/accounting/resume cases | met | Four required focused cases pass |
| Main code at live launch | deferred | This run changes PR6 source; run 10 requires merged PR6; no live launch |
| Tika capture and portable paths | retained | Previously merged P1 fixes and freeze records remain unchanged |
| Active transformation units | met | Zero matching corpus-restore heavy units |

Selected objectId:
`da19981ddcd62e532156584b7d8ef06762122f1cffc3f032ac36436d5492fdae`.
Source digest:
`d547453d9d9680d28c898892982e8b3798452fa9e608a40f860ef88cd152907d`.
Tika jar digest matches the freeze record:
`0e8ee9795ac4244feab466f4a5a9c3b94675af392848243842cb6e1e69d27103`.
Original sealed ledger digest:
`efb4b558c2d1680f87a684a69d6aa021653234d12928aa9f27a6943de8970e9f`.
Fresh accepted ledger digest:
`33ad3245d090f519b573769503ebb39162a8806864f664ab0817b705a72fccf5`.
No probe or live launch in this review-only run; no private tool log read.

Final quick package proof passes: lint 4.1 seconds, check 7.5 seconds.
Goals doctor remains zero blockers with the same three unrelated advisories;
goals index matches. Source diff and whitespace review pass. Additional
docgen-local verification is running. Run-9c explicitly prescribes quick
package proof plus focused tests; full test-tsgo, JSDoc ratchet, Fallow and
coverage are not repeated for this narrow correction. Prior run-9B results
remain historical evidence, not proof of this new head. Reference links absent.
Graft estimated 85,365 tokens saved in one retrieval.

## Content-final proof

Scoped docgen-local passes: two successful tasks, 25.397 seconds; CLI docs
aggregate successfully. Final quick package lint/check and all nine focused
tests pass. No new tracked generated files or reference links. Final fetch
and merge are already up to date; PR6 remains open and ready on its previous
head before the single authorized correction push.

Publication uses the run-9c one-push instruction on the existing PR, with
no new PR and no detached monitor or gate started by this worker. The
orchestrator retains hosted readiness and merge ownership. Full parity
producers outside the named quick/test checks are not repeated under the
narrow ruling; docgen-local is current, historical full producer evidence
remains in the earlier handoff. Knowledge refs checks committed HEAD next.
