# Promoted package coverage receipt cache-input review

Reviewed 2026-10-21 after merging main promotion PR #1956 into the coverage dependency lane.

The merge preserves every previously reviewed branch task row and adds the main promotion's 105 task rows and eight package review records unchanged. The eight new test tasks inherit the coverage branch's existing root test environment contract, so their newly imported main baseline rows require a narrow reconciliation.

For each task below, the only effective task configuration change is addition of `BEEP_COVERAGE_INVOCATION_ID` and `BEEP_COVERAGE_RUNTIME_RECEIPT` to hashed environment inputs. The existing `BEEP_FC_NUM_RUNS` and `BEEP_FC_SEED` keys remain. Native Turbo dry-run comparison verifies unchanged command, cache flag, inputs, outputs, dependencies, pass-through environment, and remaining configuration fields. These two added keys are plain invocation metadata. Artifact producers still force fresh test execution and validate same-execution receipts; this record grants no cache reuse qualification.

- `@beep/commands#test`: add the two coverage receipt environment keys only.
- `@beep/github-commands#test`: add the two coverage receipt environment keys only.
- `@beep/github-references#test`: add the two coverage receipt environment keys only.
- `@beep/jsonc#test`: add the two coverage receipt environment keys only.
- `@beep/jsonl#test`: add the two coverage receipt environment keys only.
- `@beep/schema-org#test`: add the two coverage receipt environment keys only.
- `@beep/semver#test`: add the two coverage receipt environment keys only.
- `@beep/spdx#test`: add the two coverage receipt environment keys only.

The promotion review remains retained at `goals/effected-promotion/research/cache-baseline-review-w1a.md`, SHA-256 `badc5e3031a6e9e055e97835cd7cbb213a6a12f020b9a06f39fcafce5a2aabee`. All pre-existing coverage/tsgo basis documents and their references remain byte-for-byte unchanged. No command, cache posture, qualification ledger, scope, profile, epoch, exclusions or unrelated task row changes are authorized by this review.
