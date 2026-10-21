# Non-hub Cloud finding proof

Execution resumed after PR #1928 merged as `426d494b3433ccddf797a2d896984f1ad23c81ad`.
Parent integrated main and completed root installation before these checks.
All checks below ran against the shared dirty security-fix checkout with
Effect 4.0.5 / Vitest 5.0.5. These are local results, not hosted CI or Cloud
closure evidence. No commit, publication or finding status changed in this lane.

## Focused regression results

Each command runs from its package directory as
`bunx --bun --no-install vitest run <test path>`.

| Finding | Package | Test path | Result |
| --- | --- | --- | --- |
| CSF-002 | @beep/pdf-tools | test/PdfTools.service.test.ts | 34 passed |
| CSF-003 | @beep/doc-text | test/DocText.service.test.ts | 39 passed |
| CSF-005 | @beep/repo-ai-metrics | test/config-snapshot-bounds.test.ts | 30 passed after repair |
| CSF-006 | @beep/repo-cli | test/accounts-usage.test.ts | 81 passed |
| CSF-007 | @beep/palantiri | test/Redaction.test.ts | 8 passed |
| CSF-008 | @beep/law-practice-domain | test/ClaimElement.rules.test.ts | 28 passed after repair |

Total: 220 passing focused tests. Logs retained locally as
`../raw/cloud-proof-{doc-text,pdf-tools,accounts,palantiri}.log`,
`../raw/cloud-proof-metrics-2.log` and `../raw/cloud-proof-law-domain-2.log`.

## Introduced failures repaired

- CSF-005: the draft read six bytes but compared with the seven-byte marker
  `gitdir:`. Four regressions failed, including two existing broken-metadata
  cases, because the marker was never recognized. Read exactly seven bytes,
  retaining short-read/EOF accounting. All 30 tests now pass. This correction
  preserves fail-closed recognition and never reads the complete metadata.
- CSF-008: three new tests failed. The old Array guard was absent in installed
  Effect v4; use `isReadonlyArrayNonEmpty`. The positive fixture text made
  "sensor operates" part of the noun head, so it did not resolve "sensor".
  Use the existing valid controller-coupled-to-sensor construction. Dense-DAG,
  depth/shared-budget and fresh-invocation assertions remain intact. All 28 pass.
- CSF-003: initial package build/docgen found introduced `Record.empty` generic
  ordering, schema `instanceof` and nullable callback boolean violations.
  Use `R.empty<string, Uint8Array>()`, `S.is(DocTextError)` and explicit null
  comparison. Package audit and docgen now pass.

## Package verification

Commands: `bun run beep quality package-verify <package>`, default full mode.

| Package | Audit | Docgen | State |
| --- | --- | --- | --- |
| @beep/pdf-tools | passed 11.6s | passed 3.1s | passed |
| @beep/doc-text | passed 7.3s | passed 2.3s | passed |
| @beep/law-practice-domain | passed 9.5s | passed 14.3s | passed |
| @beep/repo-ai-metrics | passed 22.6s | passed 4.3s | passed |
| @beep/palantiri | passed 14.0s | passed 2.7s | passed |
| @beep/repo-cli | parent-owned | parent-owned | avoid duplicate proof |

The initial DOCX docgen inbox row is `local-shard-8674800b2edf`. An attempted
`--observed` acknowledgment was rejected because that mode only applies to
proof-job/merge-ready rows; no acknowledgment or waiver was applied.

Scoped Biome formatting passed over all 12 assigned source/test files, fixing
nine. Root manifests/lockfile and all sibling-worker surfaces were untouched.

Metrics package verification also found two new test-only v3 `Effect.dieMessage`
uses and a missing named `Effect.fn` around the file-open test guard. Replaced
with invariant defects and a named Effect function; full audit/docgen rerun
passed. No inherited or unrelated failures remained in these five packages.

Final package command logs are retained in ignored `../raw/cloud-proof-verify-*.log`.
The successful reruns clear their corresponding local package inbox failures;
no waiver or false proof acknowledgment was used.

## Generated catalog and final local state

`bun run beep observability catalog --write` regenerated only
`standards/instrumentation-catalog/@beep/doc-text.generated.jsonc` for the new
bounded-DOCX span. `bun run beep observability catalog --check` then passed:
120 shards, zero drift. Command receipts: ignored
`../raw/cloud-proof-observability-{write,check}.log`. Scoped `git diff --check`
passed across all assigned surfaces and the generated shard.

Final inbox read confirmed automatic successful-rerun acknowledgments for
DOCX audit (`local-shard-87ff7714dd87`), DOCX docgen
(`local-shard-8674800b2edf`) and metrics audit (`local-shard-e615437fd97b`).
The acknowledgments name the current checkout HEAD; the uncommitted proof state
and actual passing command results above remain the evidence boundary.

## Later cheap-gate remediation

Fallow complexity feedback led to behavior-preserving local refactors in
bounded DOCX XML parsing and bounded claim-parent traversal. See
`cheap-gate-triage.md` for exact attribution and proof. Final default full
package verification passed again: DOCX audit 7.1s / docgen 2.7s; law-domain
audit 8.4s / docgen 9.4s. These final receipts supersede the earlier package
timings for those two source files. No span name changed.

## Round-one claim budget compatibility repair

The earlier results above describe their recorded source revisions. A later
review reproduced premature budget abstention on ten ordinary multi-parent
claims. The current policy retains the 8192-unit dependency/path/advisory-copy
budget and depth 128, with a separate term-scan allowance of
`min(262144, 8192 + 512 * locatedTermCount)`. Both remain deterministic and
charged before work; the global outside-chain lookup is unchanged.

[Round-one claim budget proof](./claim-budget-review-proof.md) records the
reproduction and correction: 206 tests pass under Node/V8; policy branches
100%, lines 99.21%, statements 99.31%. Strict test typechecking, root Oxlint
and full package verification passed. This current evidence supplements the
historical tables above without rewriting their counts or timings.

## CSF-002 round-one compatibility repair

Review comment 4333008357 identified a valid compatibility defect: the original
128-candidate bound threw before structural facts could be returned for harmless
marker text. Current remediation retains that deterministic bound and the 64 KiB
header windows, but reports partial discovery with the additive schema field
`containerDiscovery`. Values are `complete`, `limit-reached`, and `encrypted`;
`streamCheck` remains inflation-only. Exhaustive stream inspection requires both
fields complete. Existing constructors and serialized structure payloads default
the new field to `complete`. Valid loaded PDFs with 129+ irrelevant markers now
return their pages/fonts/facts and explicit partial discovery.

An explored forward-parser alternative was discarded before publication because
pdf-lib can rewind after lookahead or a rejected stream-length seek; its final
cursor does not prove aggregate work. A temporary deep ByteStream import also
failed source type-checking (the introduced local audit row). The final bounded
fallback removes that import/adapter entirely. No private parser API, lint
exception, resource-budget relaxation, or baseline lowering is retained.

Final PDF fallback proof passed: canonical package audit/docgen, package test
checker and root scoped Oxlint; Node/V8 ran 41 tests with structure.ts coverage
96.68% statements, 87.01% branches, 96.92% functions and 96.49% lines. Full
resource/compatibility argument, exact logs and downstream handoff are recorded
in `research/pdf-review-proof.md`. No floor or baseline was lowered.

## Hub platform comparison follow-up

The initial hub Node-import suppression was rejected by the global hosted
diagnostic policy and has been removed. The current implementation uses Bun's
native global comparator, with the existing Node/V8 Bun-API shim providing
Node's native comparator during tests. Both runtime suites and the global
policy pass; see [native comparison proof](./hub-native-crypto-proof.md).
No new diagnostic exception is retained.
