# Codex Security Findings Specification

## Status

**Original catalog closed; follow-up remediation active**

## Mission

Create a durable, sanitized, repo-local catalog of Codex Security findings and use it as the working queue for consolidated remediation branches and PRs.

## Scope

The original catalog includes all 64 findings visible from Codex Security for `kriegcloud/beep-effect` on 2026-05-19, across critical, high, medium, low, and informational severities. A 2026-05-20 follow-up catalog adds 3 post-merge findings discovered after PR #164 merged. Closed findings are included for local audit history.

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

- Exactly 67 local finding files exist: 64 original findings and 3 post-merge follow-up findings.
- The index and manifest agree on the count and severity distribution.
- Every finding has a triage verdict before remediation is considered complete.
- Every active finding has a fix, verification command, and Codex closeout reason.
- Final branch quality checks pass for touched packages and the relevant repo gates.
