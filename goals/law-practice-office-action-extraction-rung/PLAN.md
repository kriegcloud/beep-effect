# Law-Practice Office-Action Extraction Rung Plan

## Status

Status: `pending`

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Scope and contracts | pending | Confirm the current `OfficeActionReview` seam, `LangExtractService` contract, law labels, and deterministic test strategy. | Required source facts and any blockers are recorded; no implementation ambiguity remains. |
| P1 Service-backed extraction | pending | Replace production fixed candidates with `LangExtractService.extract` and feed `LangExtractResult.extractions` into `IrToLaw`. | Happy-path loop test passes with deterministic fake model/service output. |
| P2 Non-happy paths and breadth gate | pending | Add required-label/alignment failure handling and decide whether this packet also implements first doctrine breadth. | At least one non-happy-path test passes; 103/101/112 scope is implemented or explicitly deferred. |
| P3 Verify and close | pending | Run required checks, update packet evidence, write reflection, and prepare PR readiness if requested. | Verification is green or unrelated failures are classified; packet status and evidence are current. |

## Execution Notes

- Preserve unrelated worktree changes.
- Keep `SPEC.md` normative and update it only when the contract changes.
- Keep the law-domain package isolated from extraction and epistemic runtime
  dependencies.
- Prefer composing the existing `LangExtractService` over adding a new law-only
  extraction abstraction unless a real complexity boundary appears.
- Keep fixed candidate data under test surfaces only after P1.
- Archive old run outputs under `history/` when a future execution run closes
  the packet.

## P3 Closeout Checklist

Before marking the packet closed:

1. Write a closeout reflection to
   `history/reflections/<YYYY-MM-DD>-<agent>.md`.
2. Run `bun run beep lint reflection-artifacts`.
3. Update `README.md` latest evidence and `ops/manifest.json` phase statuses.
4. Run `bun run beep yeet verify` before claiming branch-level green.

## Verification Commands

```sh
test "$(wc -m < goals/law-practice-office-action-extraction-rung/GOAL.md)" -le 4000
jq . goals/law-practice-office-action-extraction-rung/ops/manifest.json
rg -n "law-practice-office-action-extraction-rung|GOAL.md|agentLaunchers|packetAnchorDocument" goals/law-practice-office-action-extraction-rung
git diff --check -- goals/law-practice-office-action-extraction-rung
bun run beep lint reflection-artifacts
```
