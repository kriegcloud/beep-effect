# Antecedent policy coverage regression repair

Initial-head hosted job `119021631378` reported an introduced per-file regression
for `Antecedent.policy.ts`. Read-only Node/V8 reproduction confirmed exactly
those measurements before editing. After parent released the publication
freeze, added three test cases in `ClaimElement.rules.test.ts`; no production
source or baseline changed.

| Metric | Original hosted/local | Required floor | Final Node/V8 |
| --- | --- | --- | --- |
| Branches | 93.18% (41/44) | 100% | **100% (44/44)** |
| Lines | 98.4% (123/125) | 98.92% | **99.2% (124/125)** |
| Statements | 97.22% (140/144) | 99.04% | **99.3% (143/144)** |
| Functions | 98.52% (67/68) | unchanged | **98.52% (67/68)** |

## Meaningful budget paths

The new wide-dependency fixtures exercise resource reservation boundaries that
the dense-DAG/depth tests did not reach:

- 128 unavailable parents exhaust the reservation for appended unresolved paths.
- 128 available independent parents exhaust the reservation for copied resolved paths.
- 90 unavailable parents enumerate successfully but exhaust accumulated advisory
  copying while evaluating the chains.

Each case first checks a small two-parent control emits semantic advisories,
then verifies the large case emits only explicit `chain-work-limit` abstentions
and that a fresh invocation deterministically produces the same result.
Decomposition uses a complete context; the unavailable-parent policy cases
exercise legitimate partial policy inputs. All 44 policy branches are covered.

## Executed verification

From `packages/law-practice/domain`:

`node ../../../node_modules/vitest/vitest.mjs run --coverage --coverage.reporter=json --coverage.reporter=json-summary --maxWorkers=1`

Result: **15 test files, 205 tests passed**, Node/V8 coverage, 5.49 seconds.
Baseline reproduction had 202 passing tests. Coverage provider matches the
canonical Node/V8 lane; Bun/Istanbul is not used for these measurements.

`bun run package-test-typecheck` also passed, artifact exitCode 0 and empty
diagnostic output. Full `bun run beep quality package-verify
@beep/law-practice-domain` passed: audit 14.2s, docgen 12.9s. Both root
`bun run lint:oxlint -- <test-file>` (nested configs disabled) and additional
`oxlint --type-aware <test-file>` passed. Scoped Biome and diff checks passed.

The initial package audit exposed a new fixture-only nonempty-array inference
error in the conditional partial-claims list. Added an explicit existing
`PatentClaims` type annotation; the full rerun passed. The initial failed
receipt is retained; its local inbox row can be tied to the final repair commit.

Receipts are ignored `../raw/law-coverage-*.log`,
`../raw/law-coverage-{summary,final}.json` and
`../raw/law-coverage-typecheck-result.json`. Local passing coverage does not
replace the new hosted result for the eventual consolidated PR head.
