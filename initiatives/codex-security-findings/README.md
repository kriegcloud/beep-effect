# Codex Security Findings

## Status

Original catalog closed in Codex Security with 63 fixed findings and 1 dismissed finding. A post-merge follow-up catalog adds 3 new findings, all fixed on `codex/security-findings-followup`.

## Mission

Preserve the Codex Security finding set locally, validate each finding against current repo state, and remediate legitimate current-HEAD issues on consolidated remediation branches.

## Capture Policy

- Source: authenticated Codex Security UI for `kriegcloud/beep-effect`.
- Scope: all visible severities and statuses.
- Original count: 64 findings.
- Follow-up count: 3 findings captured after PR #164 merged.
- Raw exact captures stay outside the repo under `/tmp/codex-security-findings-2026-05-20T02-58-57-448Z`.
- Tracked files are sanitized Markdown only.
- Invalid findings are marked dismissed with rationale; they are not deleted.

## Reading Order

- [SPEC.md](./SPEC.md) - durable contract and triage rules
- [PLAN.md](./PLAN.md) - current remediation plan
- [findings/INDEX.md](./findings/INDEX.md) - queue and finding links
- [ops/manifest.json](./ops/manifest.json) - machine-readable capture metadata
