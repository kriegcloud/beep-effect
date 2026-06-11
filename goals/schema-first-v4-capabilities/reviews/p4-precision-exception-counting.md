# P4 Precision Exception Counting

Date: 2026-06-08

## Completed

- Changed `beep lint schema-first` summary counts so rule-specific advisory
  totals count active inventory entries with `status: "advisory"` only.
- Left reviewed matches in `standards/schema-first.inventory.jsonc` as
  `status: "exception"` entries so they remain visible and auditable without
  inflating open remediation debt.
- Added a focused command test proving an inventoried
  `SFV4-precision-audit` exception does not fail lint and reports
  `sfv4_precision_audit_advisories=0`.
- Marked the two remaining broad email matches as explicit exceptions:
  - `ContactSubmissionFormPayload.email` preserves raw browser `FormData`
    staging text before contact-domain normalization and validation;
  - `HubSpotErrorOptions.email` preserves invalid external input in diagnostic
    error context.

## Why This Matters

The packet wants false-positive review after each remediation phase. That only
works if a reviewed exception is distinct from an active advisory. Before this
pass, the linter still counted reviewed precision entries as advisories because
it summarized by `ruleId` alone. Future agents can now use the count as an
actionable queue while still seeing intentional broad domains in the inventory.

## Verification

```sh
bunx --bun vitest run packages/tooling/tool/cli/test/lint-command.test.ts --testNamePattern "precision-audit"
bun run beep lint schema-first --write
bun run beep lint schema-first
```

Current schema-first lint reports:

```text
[schema-first] sfv4_precision_audit_advisories=0
```
