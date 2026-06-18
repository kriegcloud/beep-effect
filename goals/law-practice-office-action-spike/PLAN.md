# Law-Practice Office-Action Spike Plan

## Status

Status: `complete` (2026-06-18) — P0–P3 landed green; global `bun run check`
EXIT=0; closeout reflection written.

## Phases

BINDING sequencing — schema before contract before implementation before
verify. Each phase's exit criteria gate the next (mirrors `SPEC.md`
acceptance).

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Schema / data-model | complete | Bespoke Effect-Schema for `OfficeAction`/`Claim`/`Rejection`(§101/§102/§103/§112)/`PriorArtReference`/`Distinction` in `@beep/law-practice-domain`; extend existing `Matter`/`PatentAsset`. Light `@source` JSDoc (CPC/IPC, PROV-O, SKOS). | Entities exist as `.model.ts` (+`.values.ts`/`.errors.ts`) with `$I` identity; `Rejection` cardinality encoded (§102=1 ref, §103=≥1+rationale, §101/§112=0); `Distinction.lifecycleState` typed from epistemic public `ClaimLifecycle`; field names reconciled with `docs/data-model-law-practice.md`; domain tests green. **No service code yet.** |
| P1 Service contract | complete | Define the `Context.Service` ports/interfaces for `IrToLaw` and `OfficeActionReview` in `@beep/law-practice-use-cases`. Typed, **no implementation**. | `IrToLaw: (ReadonlyArray<GroundedExtraction>) => Effect<LawEntities>` and `OfficeActionReview: (OfficeActionReviewInput) => Effect<ClaimProjectionView>` exist as typed services declaring deps on `@beep/file-processing`, `@beep/langextract`, `IrToLaw`, and the epistemic `ClaimGate`/`ClaimLifecycle`/`ClaimProjection`. **No loose helpers extracted before the contract.** |
| P2 Implementation | complete | Implement `IrToLaw` (generic `Entity`/`Relation` discriminants → typed law entities, carrying `Span` → `Evidence(char-span)`); implement the `OfficeActionReview` orchestrator; wire the loop in `@beep/law-practice-server`; author one synthetic/public fixture OA. | The loop turns once GREEN on the fixture: one integration test asserts (a) exactly one `Distinction` candidate; (b) `Evidence` char-span re-slices the fixture to the expected quote; (c) gate admits, lifecycle reaches `shape_valid`; (d) trivial ask returns distinction + span. Bun test green. Candidate-only writes; no slice-to-slice internal imports. |
| P3 Verify / close | complete | Run required checks; capture evidence; prepare PR, review response, and the closeout reflection. | `bun run check` green (no NEW failures vs `@beep/schema` Bun baseline) for `@beep/law-practice-{domain,use-cases,server}`; slice-leakage check clean; packet status + evidence updated; a closeout reflection exists. |

## P3 Closeout Checklist

Before marking the packet closed (and `status` → `completed-retained` / `complete`):

1. Write a closeout reflection via the `/reflect` skill (or copy
   `_template/history/reflections/_TEMPLATE.md`) to
   `history/reflections/<YYYY-MM-DD>-<agent>.md`. Critique the repo **tooling**
   (what worked, what didn't, what was frustrating, what you wished existed), the
   **implementation** (improvement opportunities), and the **goal/prompt** (would
   you revise it to be clearer/easier/more efficient?). Capture TODOs worth
   codifying. Its YAML frontmatter must validate against `ReflectionFrontmatter`.
2. Run `bun run beep lint reflection-artifacts` (this packet has
   `reflectionRequired: true`, so a missing/invalid reflection blocks closeout).
3. Update `README.md` (status, latest evidence) and `ops/manifest.json` phase
   statuses + `initiative.status`.

## Execution Notes

- This packet hard-blocks on `epistemic-claim-lifecycle-gate`: its public
  surface (`ClaimGate`/`ClaimLifecycle`/`ClaimProjection`,
  `Evidence(char-span)`) must exist before P1+ wiring. P0 schema may proceed
  in parallel with Packet A.
- Compose epistemic **only** via its public surface — never reach into
  `@beep/epistemic-domain`/`@beep/epistemic-use-cases` internals.
- Keep the first slice shallow: one §102, one claim, one ref, one
  distinction kind. Resist engine-perfecting before the loop turns once.
- Fixture OA is synthetic/public only — no real client matter in the repo.
- Preserve unrelated worktree changes.
- Keep `SPEC.md` normative and update it only when the contract changes.
- Archive run outputs / proofs under `history/`.

## Verification Commands

```sh
test "$(wc -m < goals/law-practice-office-action-spike/GOAL.md)" -le 4000
jq . goals/law-practice-office-action-spike/ops/manifest.json
rg -n "law-practice-office-action-spike|GOAL.md|agentLaunchers|packetAnchorDocument" goals/law-practice-office-action-spike
git diff --check -- goals/law-practice-office-action-spike
bun run check
bun run beep lint reflection-artifacts
```
