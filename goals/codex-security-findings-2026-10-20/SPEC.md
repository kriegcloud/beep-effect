# Codex Security Findings (2026-10-20) Spec

## Objective

Remediate every open Codex Cloud security finding visible at
`https://chatgpt.com/mcp-app/connector_openai_defense_factory/open_defense_factory#/findings` for
`kriegcloud/beep-effect` in the 8-finding batch captured on 2026-10-20. Publish
the work through Yeet, reach mergeable hosted state, merge, then resolve the
exact captured findings until no packet-applicable finding remains open.

The operator expanded this same single-PR goal to include all 104 open GitHub
Dependabot alerts captured in `ops/dependabot.json` (50 unique advisories).
Keep this separate from the exact eight Cloud identities. Every captured alert
requires a source-backed disposition and merged-revision closure evidence;
fixture location alone does not establish an invalid alert.

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

- `goals/codex-security-findings-2026-10-20/**`.
- Gitignored raw evidence under `goals/codex-security-findings-2026-10-20/raw/**`.
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
- Browser closure happens after merge, against the exact 8-ID allowlist.
- Preserve unrelated work and stage only reviewed packet intent.

## Acceptance Criteria

- [ ] All 104 captured Dependabot alerts have a source-backed disposition,
      remediation and merged-revision dependency-graph or closure evidence.
- [ ] The Cloud fixes and Dependabot remediation ship in the same PR.

- [ ] All 8 findings have sanitized tracked CSF records with Codex ID, severity,
      title, source commit, and public summary.
- [ ] Every finding has a current-HEAD verdict, disposition, lane, rationale,
      remediation state, changed-file set, and verification evidence.
- [ ] Every real finding is fixed at the shared root cause with a focused
      regression check where executable behavior changes.
- [ ] Packet counts, manifest, triage ledger, launcher size, sanitation, and
      whitespace checks pass.
- [ ] Yeet repair and verify are green on the complete remediation scope.
- [ ] The branch is published, hosted checks and reviews are closed, and the PR
      is mergeable and merged.
- [ ] All 8 captured Codex findings are resolved after merge and the live view
      shows zero packet-applicable open findings.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Launcher size | `test "$(wc -m < goals/codex-security-findings-2026-10-20/GOAL.md)" -le 4000` | Pass |
| JSON shape | `jq .` over both files in `ops/` | Pass |
| Finding count | CSF file count equals 8 | Pass |
| Severity count | 3 Low, 5 Informational | Pass |
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

- 2026-10-20: Operator holds all verification, quality checks, and publication
  until PR #1928 merges. Source inspection and draft remediation may proceed.
  After merge, fetch and merge main into this branch before running proof.
  This overrides the default immediate package handoff and proof sequence.
- 2026-10-20: Keep the CSV repository identity (`kriegcloud/beep-effect`)
  intact; GitHub currently resolves PR #1928 under `beep-effect/beep-effect`.
  Resolve Cloud scope from the captured full IDs rather than rewriting identities.
- 2026-10-20: Draft changes are reversible working-tree edits. No finding is
  declared fixed until detail enrichment and deferred regression proof succeed.

- 2026-10-20: Add an application bearer credential to the hub's existing
  loopback-plus-Tailscale boundary. Client and service provisioning is required
  before deployment; missing configuration prevents startup. The update does
  not provision or rotate any live credential. Rollback keeps the hub stopped
  until an equally authenticated boundary is available.
- 2026-10-20: DOCX preflight validates actual streamed output and rebuilds a
  stored archive before Mammoth reads it. ZIP declarations alone are untrusted.
  Reuse fflate plus the saxes streaming XML parser rather than hand-writing
  archive/XML parsers. Aggregate output is capped at 8 MiB, 512 entries,
  50000 XML nodes, and depth 128; limits produce typed extraction failures.
  Resource-limited child-process isolation remains a separate defense; it is
  not claimed by these changes.
- 2026-10-20: Source-bound budgets protect PDF candidate discovery and claim
  traversal/evaluation. Exhaustion rejects PDF inspection or explicitly marks
  antecedent coverage incomplete, never silently passing a partial analysis.

- 2026-10-20: Operator adds all captured open Dependabot alerts to the same
  PR and authorizes parallel source work during the #1928 hold. Preserve
  historical fixture bytes; distinguish inert parser inputs from installed
  dependencies. Keep the original Cloud inventory and allowlist unchanged.
  Reversal is the ordinary feature-branch diff; no live alert is dismissed
  during draft triage.

- 2026-10-20: Backport the exact upstream VariantStrIter pointer-mutability
  fix into one licensed, provenance-preserving `vendor/rust/glib-0.18.5`
  source copy shared by both desktop Cargo roots. GTK 0.18 requires GLib
  0.18 and no compatible fixed release exists in the reviewed metadata.
  Retain the true crate version, generate locks after the hold, test release
  behavior and keep scanner status separate from source-fix proof. Reverse
  through the feature diff or retire the patch when supported upstream
  dependencies incorporate the fix.

- 2026-10-21: Exclude only the preserved upstream GLib crate from the spelling
  checker, matching the existing third-party SDK/API-document policy. Upstream
  identifiers and prose retain their recorded provenance; authored maintenance
  documentation outside the crate remains checked. Rust compilation, tests,
  dependency provenance and security review still apply. Reverse by removing
  this spelling entry when the backport is retired.
