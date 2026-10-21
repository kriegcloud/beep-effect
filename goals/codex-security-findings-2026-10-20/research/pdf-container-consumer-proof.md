# PDF container discovery propagation

The PDF driver now separates raw object/cross-reference container discovery
from strict-inflate coverage. Downstream validation and critic reports must
carry both outcomes; a complete inflate check over discovered streams cannot
establish complete global discovery.

## Consumer changes

- Added `containerDiscovery` to technical-drawing `PdfFacts` and CLI
  `CriticPdfMeasurements`, using the existing three-status literal domains.
  Constructor and decoding defaults retain `complete` for old valid inputs.
- Both Drawings adapters copy the driver field, rather than reconstructing
  completeness from `streamCheck` or an empty undecodable-stream array.
- Technical-drawing validation emits an explicit unverified finding when
  container discovery is incomplete, including when inflate is complete and
  the defect list is empty. Encrypted files retain the existing encrypted
  failure outcome.
- Critic JSON preserves the status. Markdown prints discovery separately and
  qualifies an empty defect list as "none among inspected streams" whenever
  either check is incomplete. It retains the clean wording only when both
  statuses are complete. Schema documentation states the same conjunction.

A source search across apps/packages found no additional production
`streamCheck` consumers beyond PDF tools, technical-drawing and Drawings.

## Executed proof

- CLI focused Drawings command/critics suites: **50 tests passed**. An actual
  PDF carrying 129 raw markers is inspected through `PdfBackendFromPdfTools`:
  discovery is `limit-reached`, inflate is `complete`, defect list empty, and
  validation still fails it as unverified. A separate one-byte inflate case
  preserves complete discovery and limited inflate.
- Schema/report regressions cover legacy missing-field decoding, constructor
  defaults, complete/limited/encrypted status roundtrips and incomplete
  report wording.
- Full technical-drawing Node/V8 coverage: **143 tests / 7 files passed**.
  `Validation.rules.ts` is **100% lines/statements/branches/functions**;
  `Validation.schemas.ts` is also 100% on every measured metric.
- Scoped CLI Node/V8 coverage over the same 50 tests exercised every new
  report-completeness branch (branch counters at report lines 914–916 are
  nonzero on all paths). The aggregate measurements-file percentages are
  scoped-test output, not a full CLI ratchet result.
- Canonical `bun run package-test-typecheck` passed for technical-drawing
  and repo-cli, both result artifacts exitCode 0 with no diagnostics.
- Full technical-drawing package verification passed: audit 24.5s, docgen 4.9s.
- CLI quick package verification passed: lint 6.4s, check 6.5s. The first
  run caught an introduced test formatting issue after an assertion edit;
  formatted that line and reran successfully. No waiver was used.
- Root Oxlint with nested configs disabled passed over all nine owned files.
- Bounded `beep docgen local --package @beep/repo-cli` passed in 43.18s; its
  scoped plan included CLI and dependent scratchpad (2/2 tasks passed).

The full approximately 6,900-test CLI suite was not rerun for this narrow field
propagation; the earlier full-suite receipt and its attributed filesystem
mismatch remain separate. No broad CLI coverage-green claim is made.

Receipts are ignored `../raw/pdf-consumer-*.log` and coverage JSON artifacts.
This lane changed only nine consumer source/test files and this proof report.
No PDF driver source, SPEC, baseline, commit or push was changed by this lane.

## Generated residue preservation

The bounded docgen run recreated 5.9 MiB of ignored scratchpad generated docs.
Verified zero tracked files, then preserved it outside the checkout at
`~/.cache/beep/security-findings-2026-10-20/consumer-docgen-generated-docs`.
The untracked `packages/var` residue contained only 15 fontconfig cache files
(2.4 MiB), zero tracked files; preserved it at
`~/.cache/beep/security-findings-2026-10-20/consumer-fontconfig-residue`.
No authored/tracked content was removed. Restore either directory to its original
path to recover the corresponding generated state.

## Schema-derived codec property follow-up

The collected schema-first gate required generated property coverage once the
consumer tests added their third codec assertion. Added one local property in
`drawings-critics.test.ts` using `Arbitrary.schema(CriticPdfMeasurements)` and
`Arbitrary.checkEffect` with the existing `fcRuns(25)` policy. It proves that
generated PDF facts round-trip through JSON with discovery status intact, and
that removing discovery from encoded legacy input defaults to complete without
changing any other fact. No inventory exception or suppression was added.

Both Bun and Node focused Drawings runs pass **51 tests / 2 files** (3.30s and
6.09s). Canonical test typechecking and root Oxlint pass; CLI quick package
verification passes lint 4.9s / check 5.6s. Global schema-first passed: arbitrary-tests advisories 0, enforced candidates 0, parity ratchet current 0.
Receipts: ignored `../raw/drawing-schema-property-*.log`.

## Canonical property registration follow-up

A later collected gate identified EV007 `direct-arbitrary-check` at the
new property. Supported `lint effect-vitest --rows` output explicitly named
`it.effect.prop` as its replacement; the exact pre-repair row is retained in
ignored `../raw/drawing-property-ev007-before.json`. Migrated the property to
`it.effect.prop` with the same `Arbitrary.schema(CriticPdfMeasurements)`,
JSON/legacy assertions, and `fcRuns(25)` arbitrary options. No helper, inventory
refresh, baseline change or assertion weakening was introduced.

Both global gates now pass on the same test delta:

- `bun run beep lint effect-vitest`: exit 0, introduced 0, resolved 190.
- `bun run beep lint schema-first`: exit 0, arbitrary-tests advisories 0,
  enforced candidates 0 and clean parity ratchet.

Focused Drawings command/critics suites pass **51 tests / 2 files** under Bun
(3.51s) and Node (9.39s). Canonical package test typechecking and root Oxlint
pass. CLI quick package verification passes lint 7.4s / check 7.5s. Final
receipts are ignored `../raw/drawing-property-{effect-vitest-final,
schema-first-final,canonical-bun,canonical-node,canonical-typecheck,
canonical-root-oxlint,canonical-package}.log`. No git, inbox or publication
mutation was performed by this repair lane.
