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

- `goals/codex-security-findings-2026-10-14-agent-message/**`.
- Gitignored raw evidence under `goals/codex-security-findings-2026-10-14-agent-message/raw/**`.
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
- [x] Yeet repair and verify passed on the remediation scope; the package build,
      quick verification and 22 focused tests passed at final head.
- [x] The branch was published, all review threads were answered and resolved,
      the review window elapsed, and PR #1766 merged under the S11 gate with
      hosted reds and queued jobs attributed below.
- [x] All 1 captured Codex findings are resolved after merge and the live view
      shows zero packet-applicable open findings.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Launcher size | `test "$(wc -m < goals/codex-security-findings-2026-10-14-agent-message/GOAL.md)" -le 4000` | Pass |
| JSON shape | `jq .` over both files in `ops/` | Pass |
| Finding count | CSF file count equals 1 | Pass |
| Severity count | 1 Medium | Pass |
| Raw ignored | `git status --short -- .../raw` | Only `.gitignore` tracked |
| Sanitization | tracked packet secret/path pattern scan | No matches |
| Per-finding proof | command recorded in finding and triage ledger | Pass |
| Repo proof | `bun run beep yeet verify` | Green |
| Hosted proof | Yeet monitor, review closeout and S11 merge gate | Threads and window passed; reds attributed at merge |
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
| None | N/A | N/A | N/A | N/A |

## Decision Log

| Decision | Reason | Reversal |
| --- | --- | --- |
| Require a private receiving `--grant-file` for managed `serve` | A managed native worker must never consume a queued envelope outside its own persisted conversation grant. The CLI package is private and the command has no published compatibility promise. | Restore the prior invocation only after a replacement host-issued receiving-grant channel is implemented and tested; update launchers and runbook together. |
| Treat missing dependency declaration output in the fresh worktree as an environment-only local check failure | The package check emits TS6305 for many untouched dependency packages; focused native tests and package lint pass. | Build dependencies in this worktree, rerun package check, and remove this exception when proof is available. |
| Stop managed `serve` after a receiving grant becomes invalid. | The grant ID is pinned at startup and cannot be refreshed in that process. Settling the current claim as failed with a detail, logging its receipt, then exiting keeps later queued messages from being silently consumed. | Resume a worker only through a new validated enrollment; preserve the failed receipt and normal generation replacement rules. |
| Merge PR #1766 under S11 after the full review window. | The exact head had zero unresolved threads and no base conflict. The required Security red was live ruleset drift over `beep-reviewer`; JSDoc Ratchet gained two root imports only in the merged base (the branch inventory stayed at the 1,343 baseline and passed locally); Property Laws and Test Unit failed the same `skills-provenance` property on the merged base while the branch test passed 30/30. Heavy jobs remained queued on shared runners. The gate recorded each red and pending job; Vercel deployments were rate limited. | A named main-line fix PR must address every required red that reaches `main` the same working day; reopen this finding only if a merged-revision regression demonstrates the receiving-grant repair failed. |
| Track the final reviewer P2 in issue #1772. | Round-five review found a lock-exhaustion availability edge after the receiving grant was already invalid. The grant fence still prevents a later native prompt. Repository review policy routes P2 findings after round two to a tracked follow-up instead of another push. | Resolve #1772 with fail-stop and storage-failure proof; reopen this packet only if it reveals that the scoped recipient authorization repair did not hold. |
