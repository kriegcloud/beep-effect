# GOAL: Remediate and close all 52 Codex security findings in one PR

Repo: `/home/elpresidank/YeeBois/projects/beep-effect`.
Branch: `@slop/june-8-2026` (already exists; do not create a new branch).

Outcome: All 52 findings from Codex scan
`5138685acf488191ad6a5ee51a84452d` are triaged, remediated by default, and
closed in Codex, with a mergeable PR on the existing branch.

This is a compact `/goal` launcher. Treat the packet as the contract:

- `goals/codex-security-findings-2026-06/README.md`
- `goals/codex-security-findings-2026-06/SPEC.md`
- `goals/codex-security-findings-2026-06/PLAN.md`
- `goals/codex-security-findings-2026-06/ops/manifest.json`
- `goals/codex-security-findings-2026-06/ops/triage.json`
- `goals/codex-security-findings-2026-06/findings/INDEX.md`

Read those first, then `AGENTS.md`, `CLAUDE.md`, and standards named by
`SPEC.md`. Higher-priority repo standards outrank packet prose.

Scope:

- In: the packet, plus repo paths named in each finding's `changedFiles`.
- Out: findings outside this scan; new branches; raw/unsanitized evidence;
  Codex's own Create-PR / Patch-apply buttons.

Workflow (phases mirror the manifest):

1. bootstrap — scaffold packet on `@slop/june-8-2026`.
2. extract — capture BOTH Report and Patch per finding to `/tmp`; commit
   sanitized markdown + `findings/patches/CSF-NNN.patch` only.
3. triage — set disposition (remediate default), verdict, and lane per finding;
   partition lanes by file ownership, serialize overlaps.
4. GATE — STOP. Get human approval of the disposition matrix before any fixes
   or Codex closures.
5. close-invalids — Chrome pass 1: close non-remediated dispositions
   (False positive / Already fixed / Won't fix).
6. remediate-by-lane — fix by lane; record a targeted verification command +
   `changedFiles` in `ops/triage.json` for each.
7. yeet-to-mergeable — run `bun run beep yeet` until the PR is mergeable
   (checks green, Greptile 5/5, 0 unresolved threads).
8. close-remediated — Chrome pass 2: mark "Already fixed" with PR evidence.
9. closeout — reconcile INDEX/manifest/triage; write history evidence.

Rules:

- Default disposition is remediate. "Won't fix" needs written justification.
- Sanitize signed URLs, token params, auth headers, cookies, secret paths.
- Two Chrome closure passes: non-remediated after GATE, remediated when mergeable.
- Chrome is one serial session; yeet is serial. Only triage and remediation
  fan out (cap 6).

Acceptance:

- [ ] `SPEC.md` acceptance criteria satisfied (all 52 closed in Codex).
- [ ] Every remediated finding has a passing verification.
- [ ] PR mergeable; sanitization scan clean.
- [ ] No unrelated refactors or formatting churn.

Verification:

```sh
test "$(wc -m < goals/codex-security-findings-2026-06/GOAL.md)" -le 4000
jq . goals/codex-security-findings-2026-06/ops/manifest.json
jq . goals/codex-security-findings-2026-06/ops/triage.json
git diff --check -- goals/codex-security-findings-2026-06
```

STOP at the post-triage GATE, before any "Won't fix", and before changing public
API, schema, auth, or infra beyond a finding's fix. Done only when all 52 are
closed in Codex and the PR is mergeable, or a blocker is reported with
file/command evidence.
