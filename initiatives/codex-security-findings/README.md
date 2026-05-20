# Codex Security Findings

## Status

Catalog captured; current-HEAD triage completed with 63 fixed findings and 1 dismissed finding.

## Mission

Preserve the Codex Security finding set locally, validate each finding against current repo state, and remediate legitimate current-HEAD issues on the `codex/security-findings-remediation` branch.

## Capture Policy

- Source: authenticated Codex Security UI for `kriegcloud/beep-effect`.
- Scope: all visible severities and statuses.
- Count: 64 findings.
- Raw exact captures stay outside the repo under `/tmp/codex-security-findings-2026-05-20T02-58-57-448Z`.
- Tracked files are sanitized Markdown only.
- Invalid findings are marked dismissed with rationale; they are not deleted.

## Reading Order

- [SPEC.md](./SPEC.md) - durable contract and triage rules
- [PLAN.md](./PLAN.md) - current remediation plan
- [findings/INDEX.md](./findings/INDEX.md) - queue and finding links
- [ops/manifest.json](./ops/manifest.json) - machine-readable capture metadata
