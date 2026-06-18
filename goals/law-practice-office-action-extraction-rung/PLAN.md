# Law-Practice Office-Action Extraction Rung Plan

## Status

Status: `complete` (2026-06-18) - P0-P3 implemented; PR #265 published; hosted
checks reached green; closeout review findings addressed in the follow-up patch.

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Scope and contracts | complete | Confirm the current `OfficeActionReview` seam, `LangExtractService` contract, law labels, and deterministic test strategy. | Required source facts and any blockers are recorded; no implementation ambiguity remains. |
| P1 Service-backed extraction | complete | Replace production fixed candidates with `LangExtractService.extract` and feed `LangExtractResult.extractions` into `IrToLaw`. | Happy-path loop test passes with deterministic fake model/service output. |
| P2 Non-happy paths and breadth gate | complete | Add required-label/alignment failure handling and decide whether this packet also implements first doctrine breadth. | At least one non-happy-path test passes; 103/101/112 scope is implemented or explicitly deferred. |
| P3 Verify and close | complete | Run required checks, update packet evidence, write reflection, publish the feature branch with Yeet, and close out hosted PR feedback. | Verification is green or unrelated failures are classified; PR is open and mergeable; packet status and evidence are current. |

## Execution Notes

- Preserve unrelated worktree changes.
- If execution starts on `main` or another protected/default branch, fetch
  `origin/main`, confirm the base is fresh, and create a feature branch before
  editing.
- Keep `SPEC.md` normative and update it only when the contract changes.
- Keep the law-domain package isolated from extraction and epistemic runtime
  dependencies.
- Prefer composing the existing `LangExtractService` over adding a new law-only
  extraction abstraction unless a real complexity boundary appears.
- Fixed candidate data is retained only through the package test surface after
  P1; production `OfficeActionReview` now uses `LangExtractService.extract`.
- Multi-reference 103 plus 101/112 breadth is deferred to the next rung; this
  packet closes the service-backed extraction path first.
- Archive old run outputs under `history/` when a future execution run closes
  the packet.

## P3 Closeout Checklist

Before marking the packet closed:

1. Write a closeout reflection to
   `history/reflections/<YYYY-MM-DD>-<agent>.md`.
2. Run `bun run beep lint reflection-artifacts`.
3. Update `README.md` latest evidence and `ops/manifest.json` phase statuses.
4. Run `bun run beep yeet verify` before claiming branch-level green.
5. Publish via
   `bun run beep yeet publish --pr --monitor --message "feat(law-practice): service-backed office action extraction"`.
6. Run `bun run beep yeet monitor --summary` and
   `bun run beep yeet closeout --summary --require-greptile-score 5/5 --require-greptile-issues 0 --require-review-comments 0`.
7. Fix failed hosted checks or actionable review nits with follow-up Yeet
   publishes until the PR is mergeable. Do not auto-merge without explicit user
   approval.

## Verification Commands

```sh
test "$(wc -m < goals/law-practice-office-action-extraction-rung/GOAL.md)" -le 4000
jq . goals/law-practice-office-action-extraction-rung/ops/manifest.json
rg -n "law-practice-office-action-extraction-rung|GOAL.md|agentLaunchers|packetAnchorDocument" goals/law-practice-office-action-extraction-rung
git diff --check -- goals/law-practice-office-action-extraction-rung
bun run check
bun run beep lint reflection-artifacts
bun run beep yeet verify
bun run beep yeet publish --pr --monitor --message "feat(law-practice): service-backed office action extraction"
bun run beep yeet monitor --summary
bun run beep yeet closeout --summary --require-greptile-score 5/5 --require-greptile-issues 0 --require-review-comments 0
```
