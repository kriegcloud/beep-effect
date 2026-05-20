# Codex Security Findings Plan

## Phase 0 - Capture Catalog

- [x] Create remediation branch `codex/security-findings-remediation`.
- [x] Capture all 64 visible Codex Security findings into local raw evidence under `/tmp/codex-security-findings-2026-05-20T02-58-57-448Z`.
- [x] Generate sanitized tracked initiative packet with one file per finding.
- [x] Verify tracked files contain no signed artifact URLs or token-like browser/session data.

## Phase 1 - Current-HEAD Triage

- [x] Review every original finding against current `HEAD`.
- [x] Mark reachable findings `active` with owner area and verification command.
- [x] Mark already-fixed or invalid findings `dismissed` with rationale and Codex close reason.
- [x] Update [findings/INDEX.md](./findings/INDEX.md) summary counts.

## Phase 2 - Remediation

- [x] Fix original active findings one by one or in tight root-cause clusters.
- [x] Update each original finding with changed files, verification command, and residual risk.
- [x] Run focused checks for every touched package or app.

## Phase 3 - Final Proof And Codex Closeout

- [x] Run broad repo quality gates appropriate for the original remediation diff.
- [x] Use the Codex Security UI to mark original fixed findings `Already fixed` and invalid findings `False positive`.
- [x] Confirm PR #164 contained the initiative packet and all original remediation changes.

## Phase 4 - Post-Merge Follow-Up Findings

- [x] Capture the 3 new Codex Security findings visible after PR #164 merged.
- [x] Add sanitized tracked finding files `CSF-065` through `CSF-067`.
- [x] Fix the three follow-up findings on `codex/security-findings-followup`.
- [ ] Publish the follow-up PR.
- [ ] After the follow-up PR merges, mark the 3 follow-up Codex findings `Already fixed`.
