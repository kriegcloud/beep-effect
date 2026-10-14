# Codex Security Findings (2026-10-14) Spec

## Objective

Remediate every open Codex Cloud security finding visible at
`https://chatgpt.com/mcp-app/connector_openai_defense_factory/open_defense_factory#/findings` for
`kriegcloud/beep-effect` in the 47-finding batch captured on 2026-10-14. Publish
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

- `goals/codex-security-findings-2026-10-14/**`.
- Gitignored raw evidence under `goals/codex-security-findings-2026-10-14/raw/**`.
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
- Browser closure happens after merge, against the exact 47-ID allowlist.
- Preserve unrelated work and stage only reviewed packet intent.

## Acceptance Criteria

- [x] All 47 findings have sanitized tracked CSF records with Codex ID, severity,
      title, source commit, and public summary.
- [x] Every finding has a current-HEAD verdict, disposition, lane, rationale,
      remediation state, changed-file set, and verification evidence.
- [x] Every real finding is fixed at the shared root cause with a focused
      regression check where executable behavior changes.
- [x] Packet counts, manifest, triage ledger, launcher size, sanitation, and
      whitespace checks pass.
- [ ] Yeet repair and verify are green on the complete remediation scope.
- [ ] The branch is published, hosted checks and reviews are closed, and the PR
      is mergeable and merged.
- [ ] All 47 captured Codex findings are resolved after merge and the live view
      shows zero packet-applicable open findings.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Launcher size | `test "$(wc -m < goals/codex-security-findings-2026-10-14/GOAL.md)" -le 4000` | Pass |
| JSON shape | `jq .` over both files in `ops/` | Pass |
| Finding count | CSF file count equals 47 | Pass |
| Severity count | 5 Medium, 12 Low, 30 Informational | Pass |
| Raw ignored | `git status --short -- .../raw` | Only `.gitignore` tracked |
| Sanitization | tracked packet secret/path pattern scan | No matches |
| Per-finding proof | command recorded in finding and triage ledger | Pass |
| Repo proof | `bun run beep yeet verify` | Green |
| Hosted proof | Yeet monitor and review closeout | Green and mergeable |
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

| Decision | Reason | Reversal path |
| --- | --- | --- |
| Disable automatic publisher PDF discovery and HTTP redirects (CSF-016). | HTML PDF locators are attacker-controlled destinations, and request-after-discovery bypassed the original source classification. Direct PDF acquisition remains available. | Restore discovery only through an egress guard that validates and binds each resolved destination and redirect, with internal-address regressions. |
| Limit drawing models to 256 parts (CSF-022). | It bounds synchronous overlap comparisons at 32,640 and avoids unbounded local resource use; ordinary figure sets are much smaller. | Replace the quadratic comparison with a measured spatial index and worker budget, then raise the schema cap with performance proof. |
| Anchor Claude hook executables to the launch project (CSF-012). | A current checkout can contain attacker-controlled code even when its settings were never trusted; directory presence cannot authenticate a hook. | Add an explicit trusted-checkout approval mechanism with a binding to hook contents, then permit controlled root switching with a regression. |
| Disable automated M365 draft sending (CSF-003). | Graph's send-draft action accepts a mutable draft id without a documented version precondition; the checked bytes can change before send. Draft preparation and manual Outlook send remain available. | Implement an immutable message send or documented version-bound action with a concurrent-edit regression, then restore the tool under review. |
| Remove the two raw Beep log/status Bash grants (CSF-033). | Their prefix patterns allow extra unit selectors and do not enforce the documented Beep-only boundary. Existing Beep CLI and timer-list commands remain available. | Add a separate argument-validating, read-only Beep unit wrapper with tests, then grant only that wrapper. |
| Update the installed Graft 0.21.1 matcher along with its recorded patch (CSF-019). | The local CLI executes the installed dist file, so changing only the repo patch would leave this workstation exposed during the goal. | Restore the saved pre-security dist file or reinstall the pinned package and reapply the prior patch; the saved bytes are outside the repository. |
| Use the shared no-follow contained writer for reviewed goal adoption (CSF-020). | It rejects stable symlink ancestors and retains exclusive creation while reusing repository path policy. | Revert the helper call and regression together after a replacement directory-handle implementation is proven. |
| Cap one knowledge-doctor report at four distinct historical commits (CSF-035). | This bounds archive materialization before any historical tree is extracted; the compressed archive is released after extraction. | Replace the cap with a measured streaming or eviction design, then raise it with a resource-bound regression. |
| Require a matching hash to adopt a pending Box upload (CSF-043). | Matching byte length alone cannot establish that the conflicting file contains the intended attachment. | Restore a size-only path only after an authenticated provider ownership proof and a regression covering same-size foreign bytes exist. |
| Bind review and provenance writes to checked directory descriptors (CSF-046, CSF-047). | A final-component symlink or swapped output directory must not redirect operator writes outside the corpus. | Replace the descriptor operations only with a tested equivalent that preserves no-follow opens and atomic replacement. |
| Require a fresh Graph change key for docket undo deletion (CSF-031). | A planning read cannot protect a calendar entry from later attorney edits, and a second read without a version condition still races. | Restore the old request only after another atomic provider operation can enforce the provisional-category rule; keep the concurrent-edit regression. |
| Recheck every initially exempted terminal shell before retirement deletion (CSF-042). | A shell can leave the attachment scan after writing, so an empty final holder set does not prove the archive is complete. | Replace PID/count tracking with a stronger filesystem change journal and retain a departing-shell regression. |
| Stage and verify chunked Box upload bytes before opening a remote session (CSF-045). | Provider SHA-1 arrives after storage, so a mutable source pathname cannot serve as approved content identity. | Replace private staging only with a precommit digest path or immutable source handle proven against same-size swaps; preserve scoped cleanup tests. |
