# Codex Security Findings (2026-06) Spec

## Objective

Remediate all 52 Codex Cloud security findings from scan
`5138685acf488191ad6a5ee51a84452d` (3 High / 15 Medium / 18 Low / 16
Informational) in one PR on `@slop/june-8-2026`, and close every finding in
Codex with the correct close reason. Every remediated finding carries a passing
targeted verification; every dismissed or accepted-risk finding carries a written
rationale.

## Non-Goals

- No fresh branch; reuse the existing `@slop/june-8-2026`.
- No remediation of findings outside this scan.
- No tracking of raw captures or unsanitized evidence.
- No `Won't fix` disposition without explicit written justification.
- No use of Codex's own "Create PR" / "Patch apply" buttons; remediation is
  manual and consolidated into one yeet-driven PR.

## Source Hierarchy

1. User objective or issue that created this packet.
2. `AGENTS.md`, `CLAUDE.md`, and required skills.
3. Governing architecture/package standards.
4. This `SPEC.md`.
5. `PLAN.md`.
6. `GOAL.md`.
7. Supporting `research/`, `ops/`, and `history/` files.

Higher sources outrank lower sources when they conflict.

## Target Surfaces

- `goals/codex-security-findings-2026-06/**` (this packet).
- Any repo paths named in a finding's Evidence Paths / `changedFiles` during
  remediation (security-sensitive code across foundation, drivers, tooling, and
  app packages).

## Constraints

- Default disposition is `remediate`; `accepted-risk` requires written
  justification recorded in the finding rationale and `ops/triage.json`.
- Capture BOTH the Report and the Patch per finding; patches live in
  `findings/patches/CSF-NNN.patch`.
- Lanes: partition by file-ownership into non-overlapping parallel batches;
  serialize overlapping findings; no git worktrees; no merge step.
- One approval gate after triage (disposition matrix) and public disclosure
  posture. STOP until approved.
- Closure timing: non-remediated dispositions closed right after the GATE;
  remediated findings closed when the PR is mergeable. Two Chrome closure passes.
- Sanitize signed URLs, token-like params, auth headers, cookies, and secret
  paths from all committed content. Raw captures stay untracked in `/tmp`.
- Keep unremediated findings of any severity redacted in public tracking;
  publish detailed reports, affected paths, exploit analysis, validation notes,
  and patch material only with the corresponding fix after verification.
- Drive to mergeable through the `yeet` operator path; never weaken check names.

## Acceptance Criteria

- [ ] All 52 findings captured with sanitized Report + Patch; `capturedCount == 52`.
- [ ] Every finding has a disposition, verdict, lane, and Codex close reason.
- [ ] Every remediated finding has a passing targeted verification + recorded
      `changedFiles` in `ops/triage.json`.
- [ ] Every `accepted-risk` finding has explicit written justification.
- [ ] `bun run beep yeet` is green and the PR is mergeable (checks green,
      Greptile 5/5, 0 unresolved actionable review threads).
- [ ] Sanitization scan is clean on tracked files.
- [ ] All 52 findings closed in Codex (False positive / Already fixed / Won't fix).
- [ ] INDEX, manifest, and triage counts reconcile.
- [ ] No unrelated refactors or formatting churn.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Packet launcher size | `test "$(wc -m < goals/codex-security-findings-2026-06/GOAL.md)" -le 4000` | Passes |
| Manifest JSON | `jq . goals/codex-security-findings-2026-06/ops/manifest.json` | Passes |
| Triage JSON | `jq . goals/codex-security-findings-2026-06/ops/triage.json` | Passes |
| Finding count | `ls goals/codex-security-findings-2026-06/findings/CSF-*.md \| wc -l` == 52 | Passes |
| Sanitization | secret-pattern `rg` over the packet | No matches |
| Per-finding verify | each `remediate` entry's `verificationCommand` | Passes |
| Mergeable | `bun run beep yeet verify` then hosted checks | Green |
| Whitespace | `git diff --check -- goals/codex-security-findings-2026-06` | Passes |

## Stop Conditions

- Post-triage GATE not approved (hard stop / phase boundary).
- `Won't fix` proposed without written justification.
- Sanitization scan finds a secret in tracked files.
- Enumerated Codex finding count != 52.
- A remediation fix would require editing a file outside its lane.
- Required source files missing or materially contradictory.
- The same blocker repeats after reasonable investigation.

## Exception Ledger

| Exception | Scope | Owner | Rationale | Removal condition |
| --- | --- | --- | --- | --- |
| None | N/A | N/A | N/A | N/A |
