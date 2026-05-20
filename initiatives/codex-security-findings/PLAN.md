# Codex Security Findings Plan

## Phase 0 - Capture Catalog

- [x] Create remediation branch `codex/security-findings-remediation`.
- [x] Capture all 64 visible Codex Security findings into local raw evidence under `/tmp/codex-security-findings-2026-05-20T02-58-57-448Z`.
- [x] Generate sanitized tracked initiative packet with one file per finding.
- [x] Verify tracked files contain no signed artifact URLs or token-like browser/session data.

## Phase 1 - Current-HEAD Triage

- [ ] Review every finding against current `HEAD`.
- [ ] Mark reachable findings `active` with owner area and verification command.
- [ ] Mark already-fixed or invalid findings `dismissed` with rationale and Codex close reason.
- [ ] Update [findings/INDEX.md](./findings/INDEX.md) summary counts.

## Phase 2 - Remediation

- [ ] Fix active findings one by one or in tight root-cause clusters.
- [ ] Update each finding with changed files, verification command, and residual risk.
- [ ] Run focused checks for every touched package or app.

## Phase 3 - Final Proof And Codex Closeout

- [ ] Run broad repo quality gates appropriate for the final diff.
- [ ] Use the Codex Security UI to mark fixed findings `Already fixed` and invalid findings `False positive`.
- [ ] Confirm the final PR contains the initiative packet and all remediation changes.
