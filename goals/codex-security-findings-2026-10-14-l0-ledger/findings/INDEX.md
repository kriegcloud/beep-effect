# Codex Security Findings Index (2026-10-14)

Captured from the authenticated Security Cloud findings view for
`kriegcloud/beep-effect` on 2026-10-14 through the summary-only signed-in CSV export.
Captured summaries remain ignored under `raw/`; tracked records omit signed URLs,
auth values, email addresses, and raw local paths.

## Severity Summary

| Severity | Count |
| --- | ---: |
| High | 1 |
| Medium | 1 |

## Findings

| ID | Severity | Status | Title | Owner area |
| --- | --- | --- | --- | --- |
| [CSF-001](./CSF-001.md) | High | repair implemented | Ledger symlinks can redirect review writes into shell startup files | Skills hunk ledger |
| [CSF-002](./CSF-002.md) | Medium | repair implemented | L0 success can bypass review on another PR sharing its head | Reviewer service and gate |

## Closeout Mapping

- `remediate` or `already-fixed` -> close as `Fixed` after merge and merged-revision verification.
- Strictly proven invalid -> close as `False positive` with evidence recorded.
- Preserve the complete `commit:` identity in every receipt; never strip its namespace.
- The signed-in Validation, Evidence, and Attack-path analysis were read for both IDs before their current-HEAD verdicts.
- The CSV contains Summary only; sanitized detail evidence and proof limits are recorded in each CSF file.
- Accepted risk / `Won't fix` does not satisfy this packet's completion gate.
