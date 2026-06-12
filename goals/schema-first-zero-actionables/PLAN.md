# Schema-First Zero Actionables Plan

## Status

Status: `local-proof`

Current branch: `schema-first-zero-actionables`

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Packet and baseline | complete | Create packet, capture inventory baseline, classify existing dirty files. | Packet checks pass and dirty files have an in/out decision before publish. |
| P1 Detector audit | complete | Remove mechanically distinguishable false positives before code migration. | Detector changes keep real findings visible and reduce noise. |
| P2 Arbitrary leftovers | complete | Resolve active `SFV4-arbitrary-tests` advisories. | Active arbitrary-test advisory count is zero. |
| P3 High-volume migration | complete | Clear concentrated candidate clusters. | Box/NLP/NLP-MCP clusters and package checks are green. |
| P4 Stragglers and hard gate | complete | Clear remaining candidates and enforce repo-wide candidate failure. | Non-exception candidates are zero and future candidates fail lint. |
| P5 PR closure | in-progress | Publish a merge-ready PR through Yeet. | Hosted checks and closeout gates pass. |

## Execution Notes

- Preserve unrelated worktree changes. The branch started with existing edits to
  `bun.lock`, `package.json`, `packages/tooling/tool/docgen/src/Domain.ts`, and
  `packages/tooling/tool/docgen/src/Printer.ts`.
- Before publish, classify those existing edits as in-scope, intentionally
  separate, or excluded from the schema-first PR.
- Start each remediation wave with `bun run beep lint schema-first` and the
  inventory grouping from `research/baseline-2026-06-11.md`.
- For false positives, prefer detector improvements in `SchemaFirst.ts` over
  exception churn.
- For true pure-data candidates, prefer annotated `S.Class` or a justified
  schema-first shape over preserving exported interfaces/type literals.
- For active arbitrary advisories, import production schemas and derive data
  with `S.toArbitrary`; add source-schema `toArbitrary` annotations only when
  generation needs domain-specific values.
- Keep generated output out of scope. Migrate handwritten wrappers and exclude
  generated files when necessary.

## Pre-Publish Classification

| Path | Classification | Evidence |
| --- | --- | --- |
| `package.json` | carried branch work | Pre-existing dependency bumps for `drizzle-orm`, `drizzle-kit`, and `fallow`; retained because the user explicitly asked the branch to include current changes. |
| `bun.lock` | carried branch work | Lockfile companion to the pre-existing dependency bumps; retained with `package.json`. |
| `packages/tooling/tool/docgen/src/Domain.ts` | carried branch work | Pre-existing docgen model/tagged-class refactor with formatting churn; not edited by this packet implementation. |
| `packages/tooling/tool/docgen/src/Printer.ts` | carried branch work | Pre-existing docgen `Printable` schema/tagged-union refactor; not edited by this packet implementation. |

## Wave Order

1. Detector false-positive audit and packet evidence.
2. Seven active `SFV4-arbitrary-tests` advisories.
3. High-volume handwritten clusters:
   - Box streaming payloads and config wrapper candidates.
   - NLP tool success/data schemas.
   - NLP-MCP streaming tool parameter schemas.
4. Smaller stragglers in infra, sandbox, chalk, color, form, LocalDate,
   repo-utils package metadata, Wink runtime state, and SQL test resources.
5. Repo-wide hard gate and Yeet PR closure.

## Verification Commands

```sh
test "$(wc -m < goals/schema-first-zero-actionables/GOAL.md)" -le 4000
jq . goals/schema-first-zero-actionables/ops/manifest.json
rg -n "schema-first-zero-actionables|GOAL.md|agentLaunchers|packetAnchorDocument" goals/schema-first-zero-actionables
git diff --check -- goals/schema-first-zero-actionables
bun run beep lint schema-first
bun run repo-exports:catalog:check
bun run beep yeet verify
bun run beep yeet monitor
bun run beep yeet closeout --require-greptile-score 5/5 --require-greptile-issues 0 --require-review-comments 0
```
