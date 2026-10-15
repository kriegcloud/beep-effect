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

- `goals/codex-security-findings-2026-10-14-drawing-critics/**`.
- Gitignored raw evidence under `goals/codex-security-findings-2026-10-14-drawing-critics/raw/**`.
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
- [x] Focused tests, package test typecheck, quick package verification, and
      hosted Security and Heavy / Check pass. The stale-branch lint red and
      pending coverage check were recorded by Yeet under S11 at merge; the
      consolidated lint fix had already merged on `main` in PR #1798.
- [x] The branch was published, review threads were closed, the 20-minute
      window elapsed, and PR #1795 merged at `5f3dfb3969`.
- [x] The exact captured Codex finding was marked Fixed after merge and the
      refreshed live view shows zero packet-applicable open findings.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Launcher size | `test "$(wc -m < goals/codex-security-findings-2026-10-14-drawing-critics/GOAL.md)" -le 4000` | Pass |
| JSON shape | `jq .` over both files in `ops/` | Pass |
| Finding count | CSF file count equals 1 | Pass |
| Severity count | 1 Low | Pass |
| Raw ignored | `git status --short -- .../raw` | Only `.gitignore` tracked |
| Sanitization | tracked packet secret/path pattern scan | No matches |
| Per-finding proof | command recorded in finding and triage ledger | Pass |
| Repo proof | Focused tests, package verification, Yeet repair/verify | Focused and quick checks green; stale-branch full-proof red attributed to PR #1798 |
| Hosted proof | Yeet monitor and review closeout | 5/5 review, no threads, S11 merge receipt |
| Final closure | Signed-in Security Cloud findings view | Exact ID Fixed; refreshed open view 0 of 0 |

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
| S11 merge over a stale-branch Heavy / Lint Policy red and pending Coverage Regression | PR #1795 final head `9ff065ba0e` | Lint episode: PR #1798, merged on `main` before #1795; coverage: monitor on later proof | Security, Heavy / Check, Build, Docgen, Doctest, Test Integration, and repo CLI tests passed; review window and thread gate passed. Yeet recorded both exceptions at merge. | The lint fix already landed at `709d440def`; investigate any later coverage failure on main. |

## Decision Log

| Decision | Reason | Reversal |
| --- | --- | --- |
| Restrict Grok to Read and Grep under `dontAsk` and the strict sandbox; restrict Claude to Read under its restricted mode. | The installed CLIs expose these controls, and the prior launch bypassed permission checks while handling lower-trust review material. Tests assert each critical argument. | Revert the launcher changes only after replacing them with a separately verified read-only process boundary; keep the critic route disabled until that boundary is in place. |
| Retain the five-reviewer sequence and remove the Claude Bash hint. | Reviewers can consume the prepared pack and its measurement files with read tools. The hint conflicted with the read-only contract. | If essential measurements are missing, add them to the prepared pack before launch rather than granting reviewers shell access. |
| Explicitly deny Grok WebFetch and WebSearch. | Grok's strict sandbox blocks child network traffic, but its in-process web tools use a separate network path; deny rules also override existing user grants. | Re-enable only behind an independently verified egress policy that limits destinations and data. |
| Merge PR #1795 through Yeet's S11 gate after the 20-minute window. | The exact head passed targeted proof and 34 hosted checks, had zero unresolved threads and a 5/5 reviewer result. Its lint job was red on the older branch snapshot even though PR #1798 had cleared the episode on main; coverage remained pending. The gate recorded both states and cancelled the remaining run. | Verify the merged main revision retains PR #1798's lint fixes, and review any later coverage failure separately. |
