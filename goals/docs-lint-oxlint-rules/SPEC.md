# Documentation lint on oxlint

## Objective
Move the JSDoc/TSDoc runner to repo-owned oxlint JS-plugin rules, preserving public API coverage.

The final root scan has zero error-level findings and two TSDoc empty-code-span warnings,
both reproduced by the retained ESLint docs profile. No warning baseline or exclusion was
added to silence them; the orchestrator owns their main-first repair.

## Non-Goals
Delete ESLint, its deprecated-apis profile, packages, shared environment or laws helpers.
Lane A still requires these; deletion is a separate follow-up after its merge.

## Constraints
The Claude orchestrator owns git and publishing. This lane edits only docs-specific shared-file
sections, uses Effect v4 module paths and tsc-rs 0.6.0 gates, and retains active packet state.

## Acceptance Criteria
- Five mandatory documentation rules and category/TSDoc checks run through oxlint.
- Package, root and staged-file runners load one docs config with matching exclusions.
- Rule tests exercise real oxlint; package checks and requested parity gates have receipts.
- ESLint deprecated-API infrastructure remains available.

## Decision Log

| Date | Decision | Reason | How to reverse |
| --- | --- | --- | --- |
| 2026-10-14 | Split ESLint deletion from docs migration. | Lane A still needs the deprecated-apis profile and shared env. | Merge lane A, then delete the retained infrastructure in a follow-up. |
| 2026-10-14 | Use comment-parser and are-docs-informative directly. | Match the existing parser and informativity algorithm without ESLint runtime coupling. | Restore the ESLint docs worker and remove the new dependencies. |
| 2026-10-14 | Keep parameter/return and length warnings. | Docgen checks export descriptions, examples and versions; it does not validate parameter names/descriptions or return tags. | Restore corresponding ESLint rules. |
| 2026-10-14 | Drop sort-tags, multiline-blocks and tag-lines. | jsdoc-migrate canonicalizes carrier layout, orders tags with tagRank and trims edge blank lines; retain content checks. | Add standalone oxlint formatting rules if a separate ratchet is required. |
| 2026-10-14 | Retain require-description. | Docgen description enforcement is package-configurable; lint must cover all tooling exports. | Drop once docgen enforcement is universal. |
| 2026-10-14 | Preserve legacy declaration/comment association. | Mandatory checks cover direct exported variables/types and indirectly exported functions/classes; description checks require an attached doc block, and adjacent older doc blocks do not inherit a later function's parameters. | Widen coverage in a separately measured policy change. |
| 2026-10-14 | Accept only the reviewed EV010 filesystem-provenance row. | Tests supply FileSystem and Path layers through it.layer with timeout; the row is explicitly a judgment, and the EV006 assertion finding was fixed first. See research/effect-vitest-review.md. | Restore the previous inventory and re-review provenance. |
| 2026-10-14 | Regenerate the schema catalog and retain a keyed drift receipt. | The requested generator adds two docs exports alongside 1176 inherited missing entries in untouched source; do not hand-edit generated rows. | Orchestrator can split the inherited refresh or regenerate after a main-first update. |
| 2026-10-14 | Limit rule harness subprocesses to two oxlint threads and run docs fixtures without concurrency. | The global concurrent test default made grouped synchronous subprocess tests exceed per-test budgets. | Restore default threads/concurrency after measuring a faster in-process harness. |
| 2026-10-14 | Record time-limited package P0 remediation acknowledgements. | Higher-priority runtime reminders required acknowledgement; observed is invalid for package findings. Waivers record temporary repair state, never publication readiness. | Replace remediation acknowledgements with successful proof at orchestrator closeout. |
| 2026-10-14 | Load docs from a dedicated oxlint-docs entry point. | Core policy and docs run independently; avoid parser dependency startup costs in the existing six-rule core tests and consumers. | Recombine plugin registries after measuring startup and test budgets. |
| 2026-10-14 | Run lint-rules subprocess fixtures sequentially across tests and files. | Bun.spawnSync blocks worker progress; concurrent timer budgets counted time in other fixtures and the core-profile audit timed out despite passing assertions. Preserve the existing per-test timeout. | Restore package concurrency after replacing synchronous harness drivers or measuring stable parallel timing. |
| 2026-10-14 | Keep publication and completion with the orchestrator. | Explicit lane envelope; no git mutations or Yeet calls allowed. | Orchestrator completes packet after merge. |
| 2026-10-14 | Root docs oxlint runs without an ESLint result cache; Turbo caches package and root-only tasks. | Oxlint has no matching ESLint content-cache contract; the docs input digest and Turbo inputs include config, rule source and dependency identity. | Restore ESLint docs routing and its directory-keyed cache. |
| 2026-10-14 | Load tsdoc.json through TSDocConfigFile once per file. | Reuse Microsoft configuration semantics and avoid stale parser state after edits. | Replace with an explicit schema-config loader if per-file configuration cost becomes material. |

## Verification Matrix
See research/verification.tsv and the lane report for exact commands, exit codes and attribution.


## Warning overlap evidence
Docgen checks descriptions only when enabled, and examples/versions according to package settings
(`commands/Docgen/internal/JsDocAnalysis.ts`). Migration orders tags with `tagRank` and trims
edge blank lines (`Quality/internal/JSDocMigrateRewrite.ts`). Parameter/return tag content and
length checks remain in oxlint. File overviews and category tags retain their advisory severity.

## Scope and exclusions
Tooling public declaration checks remain under `packages/tooling/*/*/src/**/*.ts`.
TSDoc syntax spans apps, packages and infra; lab apps, generated SDK output, declarations,
tests, stories, internal tooling source and build artifacts are excluded by the docs config.

### 2026-10-14 merge and review follow-up

- Preserve both oxlint workers, main knowledge-doctor steps and Knip retirement while resolving all nine conflicts. Reason: both merged initiatives remain authoritative. Reverse by reverting this merge resolution and follow-up together.
- Require the tsgolint assignment summary and compare its unmatched count with every listed path before filtering TypeScript extensions. Missing or inconsistent evidence fails LintProgramAssignmentError (review comment 4276915577). Reason: silence cannot prove coverage. Reverse by reverting the guard and its two regression tests.
- Take main generated baselines and regenerate with their owners; preserve main qualification scope/profile/epoch and union baseline subjects. Reason: avoid overwriting new main review receipts. Reverse with the previous baseline/request/basis as one unit.
- ESLint config, docs profile, parser/plugins, shared BEEP_ESLINT_PROFILE and laws directory moves stay out of this PR. PR B2 follows immediately after this PR merges. Reason: keep this merge and positive-evidence fix reviewable. Reverse by explicitly moving B2 scope into a separately reviewed change.

- Remove the now-uncalled ESLint worker and its private heap constants as part of runner replacement; retain all repository ESLint surfaces reserved for B2. Reason: both commands now use Oxlint, so the private runner is dead code. Reverse by restoring the runner only with a caller.

- Alphabetize the docs dependency block and regenerate the docs plugin alias through tsconfig-sync. Reason: repair lane-owned Sherif and config-sync findings without hand-editing generated aliases. Reverse by restoring the manifest and regenerated alias files together, at the cost of the same cheap-gate findings.

- Migrate plain-data DocsRuleSet to branded S.Opaque over annotated S.Struct and brand TSDocConfigurationError. Reason: main now enforces D1/D4; preserve decode and .make semantics while satisfying the current schema law. Reverse by restoring the two declarations together, which restores the schema-first red.

- Keep the previously accepted EV010 platform-filesystem-candidate review row for docs-rules.test.ts; normalized inventory ID diff adds that single judgment row and removes none. Reason: the filesystem is provided through it.layer and this is a review candidate, not a new detector finding. Reverse by removing the source dependency only if the fixture no longer exercises filesystem behavior.

- Regenerate the schema catalog after the Opaque migration and retain its complete owner-generated catch-up. Reason: main catalog kind metadata was stale after its schema migration; hand-editing generated rows is forbidden. Reverse by restoring the prior catalog and rerunning the owner command against the reverted sources.

## Fallow wave decisions (2026-10-14)

- Replace the combined docs visitor with a typed rule dispatch table and small named checks, retaining shared parsing/attachment and the separate TSDoc parser rule. Decompose overload/name/function AST lookup through Effect Match and small helpers. Reason: eight introduced complexity findings violate current thresholds; tests and diagnostics must stay unchanged. Reverse by restoring the previous docs.ts with its failing complexity receipt.
- Extract positive assignment-evidence validation into named Effect.fn; the worker still rejects missing/mismatched summary, truncation and unowned TS paths. Reason: separate native execution from coverage proof without changing behavior. Reverse by inlining the same helper body back into the worker.
- Extract fixture installation and unassigned-file assertions from the executed-worker test callback. Reason: lower test cognitive complexity while retaining every assertion. Reverse by inlining those two helpers.
- Preserve existing unrelated observability edits; regenerate the catalog via its owner after spans change. Reason: preserve the orchestrator's dirt and keep source spans valid. Reverse only this wave's regenerated span changes alongside the source revert.
