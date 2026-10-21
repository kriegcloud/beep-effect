# CI coverage artifacts

The Check workflow collects coverage during its existing unit and Labs test
executions. Its coverage comparison job validates those reports, merges the two
repo-cli test halves and runs the existing regression comparator. It does not
execute tests or regenerate the baseline.

## Producers

The four Test Unit partitions keep their existing identities: `unit-a`,
`unit-b`, `repo-cli-1` and `repo-cli-2`. They run their selected tests under
Bun with Istanbul instrumentation. The Labs job supplies a fifth artifact.
The coverage scope planner supplies required owners in addition to ordinary
unit-test selection, so affected dependents and labs remain represented.

The workflow invokes each unit partition with:

```sh
bun run beep ci lane test-unit --partition unit-a \
  --coverage-output .beep/ci-coverage/unit-a
```

Labs uses `ci lane labs --coverage-output .beep/ci-coverage/labs`.
`--coverage-only` preserves the distinction between required selected tests and
the Labs job's separately gated build/check work.

The producer discovers configured tests without executing their bodies, then
runs the selected suite once. It records raw `coverage-final.json` counters,
the test result receipt and a manifest. An empty partition still supplies an
explicit receipt. Instrumented tasks run fresh during the initial rollout;
ordinary cached logs are insufficient evidence of a coverage report.

## Comparison

The workflow downloads the five expected partition artifacts into separate
directories and runs:

```sh
bun run beep ci lane coverage --compare-only \
  --coverage-input .beep/ci-coverage-inputs
```

Use the same affected/base options as the producer jobs. The validator binds
artifacts to the tested checkout SHA, base SHA and workflow run attempt. A PR's
synthetic merge SHA can differ from its branch head. It also validates expected
packages, shards, test and source inventories, digests and successful test
completion. Missing, stale or inconsistent evidence fails the comparison.

The merger combines raw Istanbul counter maps before calculating percentages.
Adding or averaging the summaries from the two repo-cli halves would lose the
relationship between their complementary executed branches. Unexecuted source
files remain part of the report. A genuinely zero-executable barrel requires
source and instrumenter evidence; it is not assigned invented 100% coverage.

The existing package/per-file floors, minimums and ratchet remain authoritative.
Report consumption does not authorize writing or weakening the baseline.

## Rollout and required checks

Check invokes the trusted reusable Heavy workflow at `main`. Editing its file
in a PR does not change the revision already executing from main. During the
transition the old Heavy coverage producer therefore remains the required
`Heavy / Coverage Regression` check, while the new consumer reports
`Coverage Artifact Migration` for qualification.

The workflow reads GitHub's resolved reusable-workflow SHA for that run to
select the name. Once main contains the retired Heavy producer, the consumer
uses the required `Heavy / Coverage Regression` name. A failed lookup stops
admission rather than guessing from a moving branch. Other Heavy jobs retain
their parallel execution. Label-triggered heavy admission does not replay unit
tests or create a second artifact comparison.

## Retained local tooling and rollback

Root and package coverage commands still produce reports for local diagnosis.
The scoped baseline writer and existing comparator remain in use. The standalone
`ci lane coverage` route without `--compare-only` also remains available to
legacy callers during transition. Their presence does not mean the hosted
artifact comparison should fall back to test execution.

Only the old Heavy matrix entry and its exclusive runtime, preflight and summary
branches retire in this change. Remove another helper only after checking its
remaining callers. Preserve historical coverage receipts.

To roll back the CI cutover, restore the standalone Heavy producer and remove
the artifact consumer together, preserving exactly one required coverage
context. Keep the baseline unchanged. Reverting just a job name or dropping the
consumer while Heavy no longer produces coverage would leave the required
status unreported.
