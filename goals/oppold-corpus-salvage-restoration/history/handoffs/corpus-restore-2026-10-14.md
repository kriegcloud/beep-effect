# Corpus restoration recovery engine handoff — 2026-10-14

## Scope and state

Read the complete lane brief, including the 11:14Z recovery engine binding.
Preserved the prior uncommitted final-report append to the 2026-10-13 handoff.
Integrated main and created the recovery-engine feature branch; #1718
was then merged by the orchestrator and is not re-pushed. Integrate that
merge before publication so this PR contains only the recovery changes. No corpus run or
worker-owned runtime family is active. No sealed artifact was modified.

## Renewed prerequisite measurements

| Check | Status | Measurement |
| --- | --- | --- |
| Lane and packet | met | expected corpus-restore lane; complete packet; recovery-engine branch |
| P0 phase and archive | met | P0 complete; 755 directory passes, 10,696 file passes, four inherited-loss rows, one preflight/seal; 53 PST passes, 23 recycle non-stub occurrences |
| Wave state | met | all nine sealed; five accepted, four failed; ordinal 9 unit inactive |
| Ordinal 9 ledger | met | 634 repair rows; one start/attempt/exception/summary/failure; zero accepted store/child/warning rows |
| Ordinal 9 immutable digest | met | 87943da8d7c8b10283008000c1d99ca4a17e411a7824bec520f1f10adae5bc90 |
| Java | met | OpenJDK 27, 2026-09-15; real path /usr/lib/jvm/java-27-openjdk/bin/java |
| Tika digest | met | 0e8ee9795ac4244feab466f4a5a9c3b94675af392848243842cb6e1e69d27103 |
| pffexport and bubblewrap | met | pffexport 20260917; bubblewrap 0.13.0 |
| Capacity | met | 385,180,622,848 bytes; above 100 GB floor |
| Focused restoration proof | met | 8 selected tests pass, including the four required cases and two new recovery cases |
| Main code for recovery | pending | code is local; no launch before merged source equality |
| Actual recovery launch preflight | pending | engine PR must merge; new freeze records and admitted smokes required before launch |
| Doctor baseline | met | 223 packets, zero blockers, six unrelated inherited advisories, no finding for this packet |
| Dependencies | met | bun.lock moved on main integration; frozen-lockfile install succeeded |
| Heavy admission | met | package and hosted-parity commands admitted after queueing; no admission bypass |

## Decisions and release notes

The same Java/Tika chain is bound by the orchestrator. Use the existing
max-elapsed-millis option for the separately frozen recovery budget:
3 × 7,222,485 + 600,000 = 22,267,455, rounded up to 22,320,000 ms.
Family 43,200,000 ms, ratio 4, 2,147,483,648-byte output and 100 GB floor
remain fixed. No default, engine or original launcher change. The runner
already applies that option to extraction and final attempt validation.

Terminal catch now retains schema-defined original classes and stable fields
in optional failureCause evidence, excluding messages, paths and tool output.
Old rows still decode and real engine failures remain unapproved. Regression
proof covers nonzero/empty Tika output on a synthetic GIF, the larger elapsed
budget, the unchanged family deadline and full-output/budget behavior.
The first test run exposed a diagnostic guard matching the outer wrapper
before the inner cause; corrected the order and the rerun passed all eight.

| Release notes without changesets | Change | Release impact | Reversal |
| --- | --- | --- | --- |
| @beep/repo-cli (private) | Add optional message-free terminal diagnostics; document independently frozen recovery bound | Additive field; no major release; no changeset under #1566 | Revert code and packet decisions; retain all immutable corpus evidence |

The approved recovery batch has four sequential fresh tool families, one
failed occurrence per family as the existing selector requires. A repeated
second-pass failure receives unsupported recovery disposition with retained
evidence, never a third attempt. The disposition never approves a sealed
engine failure or promotes partial repairs. New manifests must name the
actual merged engine codeHead and measured versions before launch; none is
created in this engine-PR preparation run.

Open items: engine PR merge, new manifests and recovery execution; eighteen
larger occurrences and estate/recycle/DOC gates remain open for P3.
P2 remains in-progress, P0/P1/P4 complete and P3 pending. Reversal: revert
code and packet decisions while retaining every ledger, output, claim and
manifest. The user-manager environment failure and cause-loss friction are
recorded in research/OPPORTUNITIES.md at discovery.


## Verification progress

Eight selected corpus-command tests pass; three transformation coverage
cases pass, including bounded nested-cause projection. Initial test-tsgo
found two introduced test diagnostics (TS377050 pipe style and TS2345
record shape). Both corrected before publication; rerun remains required.
Docgen local passed. Full package verification and the remaining parity
lanes are running under admitted beep-heavy jobs, at most two owned jobs.
The original wave launcher digest remains
5b1d87cb5c420a53e56340bbc092c21826666c9e25ef210a421b8e20955e65e6.
Doctor retains zero blockers/six unrelated advisories; packet JSON, GOAL
size, index projection and whitespace checks pass. No runtime launch.


Hosted-parity knowledge refs failed on eleven inherited host-path
observations in the Palantiri exploration and six telemetry packets.
All eight affected files match origin/main exactly; zero introduced path
deltas. No other packet was edited. Attribution and ownership are recorded
in OPPORTUNITIES.md; the standing inherited-fence/S11 route applies if
publication encounters the same rows. JSDoc ratchet passed. Full package
verification, fallow and scoped coverage are still running.


All four approved recovery occurrence identities match the sealed archive
metadata and their original freeze records. Input bytes by ordinal:
5 = 157,975,552; 7 = 354,026,496; 8 = 436,306,944;
9 = 456,877,056. This is metadata identity proof, not a new payload rehash;
the built-in archive re-verify is still required before each live family.
Fallow audit+health passed. Scoped package coverage is running.


The first default package-verify completed audit in 1,153.6 seconds and
passed docgen in 32.2 seconds. Audit ran 6,184 tests: 6,182 passed, two
failed. The new legacy-row test used the v3 Struct.omit signature; verified
Effect v4 source and corrected to an array of keys. The checkout-integrity
knowledge-doctor test compared committed packet bytes against the dirty
manifest update; commit the completed change before rerunning. Neither is
an inherited engine defect or grounds to bypass proof. Package verification
is not yet green. Its inbox row will cite the corrective commit; scoped
coverage's first run likewise began on the dirty packet and must be
attributed before any readiness claim.
