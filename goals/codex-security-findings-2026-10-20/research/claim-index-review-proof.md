# Round-two indexed claim review repair

Review comment `4333365301` is valid. Before the repair, the expanded ordinary
control (10, 45 and 100 claims; four independent parents; eight body terms per
claim) failed its no-abstention assertion at 45 claims. Each dependent claim
references the four independent claims. Receipt: ignored
`../raw/claim-round2-repro.log`. Charging every verdict against the complete
global term set made unrelated claim terms consume the fixed ceiling.

## Bounded algorithm

The separate dependency/path/advisory-copy budget remains 8,192 units, with
maximum dependency depth 128. The separate term-work allowance remains
`min(262144, 8192 + locatedTermCount * 512)`. No ceiling or baseline changed.

After the existing global claim/anchor ordering, construct claim-to-terms and
head-to-global-introductions indexes once. Reserve `3 * locatedTermCount`
before allocating either index: one claim grouping pass, one introduction
filter pass and one head grouping pass. Installed Effect `Array.groupBy`
uses a local record with mutable bucket insertion, rather than growing
immutable record or array copies. If the full reservation fails, construct
neither index and abstain for every referring term. Incomplete buckets cannot
produce semantic findings.

For each verdict, count only the selected chain buckets, then reserve
`6 * (chainTermCount + 1) + chainDepth ** 2` before materializing chain terms.
Six linear traversals cover bucket copying, introduction filtering, up to
three matching filters and candidate output construction. The existing
`byCount` helper now reads the first two candidates through Option and uses
lazy Effect Iterable traversal for the rest; it no longer copies two array
tails before constructing candidates. The depth-squared component covers
bounded claim-number sorting and de-duplication. Selected buckets already
establish membership, so the repeated membership scan is removed. Sorting
claim numbers and retaining each bucket's anchor order preserves the prior
global candidate order inside a chain.

When no in-chain rule decides a fully decomposed chain, inspect the global
same-head introduction bucket. Reserve
`(candidateCount + 1) * (chainDepth + 1)` before its membership search. The
bucket retains global order, including introductions outside all selected
chains, so the first outside-chain candidate is unchanged. Exhaustion yields
explicit `chain-work-limit`, rather than a missing or clean result.

## Regression and verification evidence

The final implementation passes the ordinary 10-, 45- and 100-claim controls
without any budget abstention and produces deterministic semantic findings.
The regression suite also covers 64 independent claims containing 32 distinct
introduction/reference groups each, 5,000 global same-head outside-chain
candidates, and an index reservation exceeding the hard ceiling. It verifies
explicit deterministic abstention, first-global-candidate preservation and
fresh-invocation budget reset. Existing dense 25-claim DAG, depth, path-copy,
advisory-copy, partial-decomposition and outside-chain fixtures remain green.

Node/V8 full package coverage: **15 files, 208 tests passed**, 19.70 seconds.
Receipt: `../raw/claim-round2-qualified-coverage.log`.

| Antecedent policy metric | Final | Existing floor |
| --- | --- | --- |
| Branches | **100% (48/48)** | 100% |
| Lines | **99.30% (143/144)** | 98.92% |
| Statements | **99.40% (168/169)** | 99.04% |
| Functions | **98.73% (78/79)** | 98.55% |

Uncovered counts remain one line, one statement, zero branches and one
function. Receipt: `../raw/claim-round2-coverage-summary.json`.

- Default full `bun run beep quality package-verify @beep/law-practice-domain`
  passed: audit 17.1s, docgen 20.5s. Receipt:
  `../raw/claim-round2-qualified-package.log`.
- Canonical package `bun run package-test-typecheck` passed with exitCode 0
  and empty diagnostics. Receipts: `../raw/claim-round2-qualified-typecheck.log`
  and `../raw/claim-round2-typecheck-result.json`.
- Root Oxlint with nested configs disabled passed for both edited files.
  Receipt: `../raw/claim-round2-qualified-oxlint.log`.

The first package audit/docgen run failed on introduced TS2345: the nested
Option fallback returned an advisory finding at the wrong Option depth.
The copy-removal edit also briefly failed TS2740/TS2322 because Array.map
requires an array; using Iterable.map corrected the lazy traversal. Both
introduced compile failures are repaired in the final passing proof above.

The first global Fallow audit found no claim-policy finding. Its introduced
blocking finding was the parallel DOCX callback at `DocText.service.ts:259`
(CRAP 43.1); the other finding was inherited `writeNearSolidJpegBorder` in
`files-command.test.ts`. Receipts: `../raw/claim-round2-fallow.log` and
`../raw/claim-round2-fallow-raw.txt`. This is attribution, not a claim that the
combined global gate passed.

Final global qualification after both parallel source repairs stabilized:

- `bun run beep lint schema-first` passed, parity ratchet current/baseline/
  introduced all zero. Receipt: `../raw/claim-round2-qualified-schema-first.log`.
- `bun run beep lint effect-vitest` passed, 0 introduced and 190 resolved.
  Receipt: `../raw/claim-round2-qualified-effect-vitest.log`.
- `bun run beep quality fallow audit --check --base origin/main --out
  .beep/fallow/claim-round2-qualified-audit.json --quiet` passed, exitStatus 0,
  0 introduced and 1 inherited-adjacent finding (the JPEG helper above).
  Receipts: `../raw/claim-round2-qualified-fallow.log` and
  `../raw/claim-round2-qualified-fallow-envelope.json`.
- `git diff --check` passed for the two edited files and this report.

No commit, push, quality-baseline change or inbox mutation by this lane.
