# CI coverage artifacts

The Check workflow collects coverage during its existing unit and Labs test
executions. Its coverage comparison job validates those reports, merges the two
repo-cli test halves and runs the existing regression comparator. It does not
execute tests or regenerate the baseline.

## Producers

The four Test Unit partitions keep their existing identities: `unit-a`,
`unit-b`, `repo-cli-1` and `repo-cli-2`. They instrument the existing test
commands, preserving environment assignments and test selection. The CLI's two
partitions use its existing coverage command under Node/V8; the other packages
use Istanbul under their canonical Bun or Node test runtime. The Labs job
supplies a fifth artifact. Providers are recorded per invocation, and a package's
shards must use the same provider before their raw counters can be merged.
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
runs the selected suite once. A package whose canonical script contains two
test invocations retains both, with a distinct report for each invocation.
Its dependency builds run before those invocations. A reporter inside each
Vitest process records the actual test runtime, version and completion status;
the CLI runtime that seals the artifact is recorded separately.

Coverage producers and the consumer pin Node 22.22.3, retaining the existing
coverage lane's workaround for native escaped-key corruption in newer Node
versions. The producer verifies Float16Array support; its worker flag remains
scoped by `vitest.shared.ts`. Other CI lanes retain the repository's default Node.
The combined producer clears the legacy standalone coverage flag that skips
some test cases. Explicit coverage arguments enable instrumentation, while the
artifact consumer enforces the ratchet, so ordinary unit cases remain eligible.

The producer records raw `coverage-final.json` counters, test results,
runtime receipts and a manifest. An empty partition still supplies an
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
packages, invocations, runtimes, shards, test and source inventories, digests and successful test
completion. Missing, stale or inconsistent evidence fails the comparison.

The merger combines raw maps in Istanbul's counter format before calculating percentages.
Adding or averaging the summaries from the two repo-cli halves would lose the
relationship between their complementary executed branches. Unexecuted source
files remain part of the report. A source with no instrumentable units requires
both a restricted syntax check and evidence from the real instrumenter. This
includes type barrels and empty classes without methods, fields or static
blocks. Zero instrumentable units do not imply that evaluating imports or a
class's base expression has no runtime effects. Such files retain their genuine
zero counters; they are not assigned invented 100% coverage.

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
