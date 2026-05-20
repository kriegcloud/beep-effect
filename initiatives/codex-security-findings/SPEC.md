# Codex Security Findings Specification

## Status

**Catalog captured; current-HEAD triage pending**

## Mission

Create a durable, sanitized, repo-local catalog of Codex Security findings and use it as the working queue for one consolidated remediation branch and PR.

## Scope

The catalog includes all 64 visible findings from Codex Security for `kriegcloud/beep-effect`, across critical, high, medium, low, and informational severities. Closed findings are included for local audit history.

## Evidence Handling

Raw copied or DOM-extracted findings are temporary local evidence and must remain outside the repository. Tracked artifacts must be sanitized before commit and must not include signed artifact URLs, bearer tokens, cookies, raw secret values, or private browser session data.

## Triage Standard

A finding is active only when the vulnerable path remains reachable in current `HEAD` and has a plausible exploit path. Findings that are historically true but already fixed, unreachable, duplicate, unsupported by current code, or otherwise invalid are marked `dismissed` with rationale.

## Codex Security Closeout

When updating Codex Security after local triage and remediation:

- Use `Already fixed` for findings fixed by this branch or already fixed in current `HEAD`.
- Use `False positive` for findings dismissed as invalid after current-HEAD review.
- Use `Won't fix` only for an explicit accepted-risk decision.

## Acceptance Criteria

- Exactly 64 local finding files exist.
- The index and manifest agree on the count and severity distribution.
- Every finding has a triage verdict before remediation is considered complete.
- Every active finding has a fix, verification command, and Codex closeout reason.
- Final branch quality checks pass for touched packages and the relevant repo gates.
