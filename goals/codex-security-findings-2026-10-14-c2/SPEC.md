# Codex Security Findings (2026-10-14) Spec

## Objective

Remediate every open Codex Cloud security finding visible at
`https://chatgpt.com/mcp-app/connector_openai_defense_factory/open_defense_factory#/findings` for
`kriegcloud/beep-effect` in the 1-finding batch captured on 2026-10-14. Publish
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

- `goals/codex-security-findings-2026-10-14-c2/**`.
- Gitignored raw evidence under `goals/codex-security-findings-2026-10-14-c2/raw/**`.
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
- Browser closure happens after merge, against the exact 1-ID allowlist.
- Preserve unrelated work and stage only reviewed packet intent.

## Acceptance Criteria

- [x] All 1 findings have sanitized tracked CSF records with Codex ID, severity,
      title, source commit, and public summary.
- [x] Every finding has a current-HEAD verdict, disposition, lane, rationale,
      remediation state, changed-file set, and verification evidence.
- [x] Every real finding is fixed at the shared root cause with a focused
      regression check where executable behavior changes.
- [x] Packet counts, manifest, triage ledger, launcher size, sanitation, and
      whitespace checks pass.
- [x] Yeet cheap gates, focused tests, package verification, and catalog check
      passed. Full local proof failed on inherited lint-policy drift; hosted
      Heavy / Check failed on inherited repo CLI tests under the S11 exception.
- [x] The branch was published, review threads were clear, the review window
      elapsed, and PR #1787 merged through the S11 gate.
- [x] The exact captured Codex finding was marked Fixed after merge, leaving
      zero packet-applicable open findings. A distinct later Low finding has a
      separate packet.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Launcher size | `test "$(wc -m < goals/codex-security-findings-2026-10-14-c2/GOAL.md)" -le 4000` | Pass |
| JSON shape | `jq .` over both files in `ops/` | Pass |
| Finding count | CSF file count equals 1 | Pass |
| Severity count | 1 Informational | Pass |
| Raw ignored | `git status --short -- .../raw` | Only `.gitignore` tracked |
| Sanitization | tracked packet secret/path pattern scan | No matches |
| Per-finding proof | command recorded in finding and triage ledger | Pass |
| Repo proof | Focused test, package verification, catalog check, Yeet cheap gates; full verify attribution | Focused checks green; inherited full-proof red recorded |
| Hosted proof | Yeet review closeout and S11 merge gate | Zero threads, elapsed window, attributed Heavy / Check red, merged |
| Final closure | supported connector or signed-in in-app findings view | Zero packet-open |

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
| S11 inherited red | PR #1787 Heavy / Check | `codex/test-tsgo-main-unblock` | Repo CLI test errors in files outside the C2 repair; focused C2 checks passed. The merge gate re-read threads and waited for the review window. | Merge the same-day main unblocker and verify its test typecheck. |

## Decision Log

| Decision | Reason | Reversal |
| --- | --- | --- |
| Repair CSF-001 as a C2 reliability defect and close it as Fixed after merge. | The current source constructs a checked report with a zero digest before computing its true digest. Security Cloud found no attacker route, but the functional failure is concrete and a small repair preserves the final digest check. | Revert the source change if a verified canary run shows a regression, then reopen the finding and repair report assembly without weakening validation. |
| Refresh the generated observability catalog in this PR. | The new C2 helper adds one span. PR #1780 also landed drawing-review spans after the #1786 catalog unblocker generated its output, so the current main projection was stale again. The generator incorporates both sets without hand-edited entries. | Regenerate from the merged source and remove any entry only if its source span is removed. |
| Merge PR #1787 under the documented S11 exception after its full review window. | Hosted Heavy / Check failed on inherited repo CLI test code unrelated to the C2 change; the focused repair checks and all other completed required jobs passed, and no review thread remained. A same-day main fix has a named owner. | If the main fix does not restore the check, open a further dedicated fix PR; revert the C2 change only if its own regression evidence fails. |
