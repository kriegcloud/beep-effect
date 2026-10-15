# Codex Security Findings (2026-10-14) Spec

## Objective

Remediate every open Codex Cloud security finding visible at
`https://chatgpt.com/mcp-app/connector_openai_defense_factory/open_defense_factory#/findings` for
`kriegcloud/beep-effect` in the 2-finding batch captured on 2026-10-14. Publish
the work through Yeet, reach mergeable hosted state, merge, then resolve the
exact captured findings until no packet-applicable finding remains open.

## Non-Goals

- No accepted-risk or `Won't fix` disposition.
- No raw report bodies, signed artifact URLs, auth headers, cookie values,
  email addresses, secret material, or developer-local absolute paths in tracked
  files.
- No Codex Create PR or patch-apply actions.
- No unrelated refactors, dependency churn, or broad formatting.
- No weakening of quality, security, CI, or review gates.

## Source Hierarchy

1. The user objective that created this packet.
2. `AGENTS.md`, `CLAUDE.md`, and required skills.
3. Governing architecture and package standards.
4. This `SPEC.md`.
5. `PLAN.md`.
6. `GOAL.md`.
7. Supporting `research/`, `ops/`, `findings/`, and `history/` files.

## Target Surfaces

- `goals/codex-security-findings-2026-10-14-l0-ledger/**`.
- Gitignored raw evidence under `goals/codex-security-findings-2026-10-14-l0-ledger/raw/**`.
- Maintained repo paths named by `findings/INDEX.md` after current-HEAD validation.

## Constraints

- Default disposition is `remediate`. `already-fixed` or `false-positive`
  requires strict current-HEAD proof recorded in the finding and triage ledger.
- Minimal root-cause fixes plus one focused regression check per executable-code
  finding. Reuse canonical path-safety, schema, and bounds helpers after live
  source/barrel discovery.
- Schema-first and Effect-first laws govern all production changes.
- Security controls may not be simplified away for diff size.
- Captured summaries stay in ignored `raw/`; tracked records contain only sanitized
  metadata, summaries, validation, decisions, changed files, and proof.
- Browser closure happens after merge, against the exact 2-ID allowlist.
- Preserve unrelated work and stage only reviewed packet intent.

## Acceptance Criteria

- [x] All 2 findings have sanitized tracked CSF records with Codex ID, severity,
      title, source commit, and public summary.
- [x] Every finding has a current-HEAD verdict, disposition, lane, rationale,
      remediation state, changed-file set, and verification evidence.
- [x] Every real finding is fixed at the shared root cause with a focused
      regression check where executable behavior changes.
- [x] Packet counts, manifest, triage ledger, launcher size, sanitation, and
      whitespace checks pass.
- [x] Focused tests and Yeet cheap gates passed; 16 of 16 required hosted checks
      were green. Two optional checks were still pending at the S11 merge and
      the workflow was canceled after merge. Full local Yeet verify did not
      finish and is not represented as green.
- [x] The branch was published; the 5/5 review, zero outstanding threads, and
      20-minute window satisfied the S11 merge gate. PR #1805 merged.
- [x] All 2 captured Codex findings are resolved after merge and the live view
      shows zero packet-applicable open findings.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Launcher size | `test "$(wc -m < goals/codex-security-findings-2026-10-14-l0-ledger/GOAL.md)" -le 4000` | Pass |
| JSON shape | `jq .` over both files in `ops/` | Pass |
| Finding count | CSF file count equals 2 | Pass |
| Severity count | 1 High, 1 Medium | Pass |
| Raw ignored | `git status --short -- .../raw` | Only `.gitignore` tracked |
| Sanitization | tracked packet secret/path pattern scan | No matches |
| Per-finding proof | command recorded in finding and triage ledger | Pass |
| Repo proof | Focused tests, package verification, Yeet cheap gates | Passed; full local verify was not completed |
| Hosted proof | 16 required checks, 5/5 reviewer, threads, 20-minute window, S11 gate | Passed; two optional checks pending at merge |
| Final closure | Signed-in in-app findings view | Both exact IDs Fixed; zero open |

## Stop Conditions

- The signed-in CSV export cannot be produced from the findings page.
- Tracked evidence contains a secret, signed URL, auth value, email address, or
  raw local path.
- A fix requires a product or architecture decision outside this packet.
- A proposed security control would rely on a platform-specific fail-open path.
- The same blocking condition repeats after reasonable investigation.

## Exception Ledger

| Exception | Scope | Owner | Rationale | Removal condition |
| --- | --- | --- | --- | --- |
| None | N/A | N/A | N/A | N/A |

## Decision Log

| Decision | Reason | Reversal path |
| --- | --- | --- |
| Reject symlinked or multiply linked ledger entries and bind each directory by descriptor. | Path-based existence and append can leave the checkout boundary. The existing directory-handle primitive provides a no-follow anchor. | Revert the source change if a replacement offers equivalent descriptor-bound, no-follow read and append semantics; retain the regression cases. |
| Bind reviewer checks to PR number plus full head and base SHA. | L0 is classified relative to a PR base, so head-only success does not represent the reviewed diff. | Replace the association format only together with an equivalent PR/base-aware creation, completion, and merge predicate; retain cross-PR tests. |
| Keep the two reports in one Yeet PR and close exact Cloud IDs after merge. | Both touch one CLI package and share a single package/hosted proof cycle. | Revert the merged PR if proof exposes a regression; reopen the exact IDs if post-merge verification fails. |
| Use S11 after the review window with two optional jobs pending. | All required checks were green and the independent review was 5/5; S11 records pending jobs and canceled the active workflow after merge. | If either pending job later produces a concrete red or the merged revision fails proof, open a focused fix PR the same day. |
| Rebind the existing independent 5/5 review to the exact PR/head/base before merging. | The reviewer host still emitted the old short-head `external_id`; the new security gate correctly refused it. The same-head reviewer result was republished with the new association and a migration note. | Re-run an independent review and replace the check if the original review or head/base proof is invalidated. |
