# Epistemic Claim Lifecycle Gate Plan

## Status

Status: `complete`

## Binding Sequencing

Every phase follows the binding order: **schema -> service-contract ->
implementation -> verify**. A later phase may not begin until the prior phase's
exit criteria are met (mirrors `SPEC.md` Acceptance / Verification Matrix).
Helpers are extracted only after schema + contract are fixed. Role-suffix order:
`.model.ts`/`.errors.ts` -> `.ports.ts`/`.service.ts` -> `.repo.ts`.

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Schema / data-model | complete | Extend `ClaimLifecycle` to the four-state union (`candidate -> shape_valid -> consistency_checked -> admitted`) with transition value objects + typed errors; port the v3 `EvidenceSpan` char-offset fields (`startChar`/`endChar`/`quote`/`confidence`) onto `Evidence`; define `ClaimGateResult` and `ClaimProjectionView` schemas. All in `@beep/epistemic-domain`. No service code. | Schemas compile; `$I` annotations present; `bun run check --filter @beep/epistemic-domain` green with no new failures; `CandidateClaim` consumes the extended lifecycle. |
| P1 Service-contract | complete | Define `ClaimGate`, `ClaimLifecycle` transition, and `ClaimProjection` as `Context.Service` ports/interfaces in `@beep/epistemic-use-cases` (new tier). `ClaimGate` declares its `ShaclValidationService` dependency; transition is `advance(claim, gateResult)`; projection signature is `(authority: ReadonlyArray<CandidateClaim>) => ClaimProjectionView`. Typed, no impl bodies, no extracted helpers. | `tsc --noEmit` on the use-cases tier type-checks; ports reference only P0 schemas + HAVE services; the forbidden helpers-first anti-pattern is absent. |
| P2 Implementation | complete | Implement the gate over the bounded `@beep/semantic-web` SHACL adapter; implement lifecycle transitions (`candidate -> shape_valid` on gate pass; rejected verdict blocks advance); implement `ClaimProjection` as a pure in-memory fold; wire the thin `@beep/epistemic-server` Layer surface. Encode the federation invariant: projection is read-only and rebuildable, authority is single-owner. Helpers extracted now (after P0/P1 fixed). | Gate admits/rejects; transitions guard correctly; projection is pure; no central-write path exists in the projection type. |
| P3 Verify / close | complete | Run the acceptance proof (`SPEC.md` P3): admit + advance, reject + no-advance, deterministic/referentially-equal projection rebuild, slice-Layer-only boot. Capture evidence; write the closeout reflection. | Bun test green; no NEW `@beep/schema` Bun-runtime failures; reflection exists; README + manifest statuses updated. |

## P3 Closeout Checklist

Before marking the packet closed (and `status` -> `completed-retained` /
`complete`):

1. Write a closeout reflection via the `/reflect` skill (or copy
   `_template/history/reflections/_TEMPLATE.md`) to
   `history/reflections/<YYYY-MM-DD>-<agent>.md`. Critique the repo **tooling**
   (SHACL adapter ergonomics, schema-first scaffolding, slice-tier creation),
   the **implementation** (the gate / lifecycle / projection seams), and the
   **goal/prompt** (would you revise it?). Capture TODOs worth codifying — in
   particular whether the bounded SHACL subset fully expressed the claim shape.
   Its YAML frontmatter must validate against `ReflectionFrontmatter`.
2. Run `bun run beep lint reflection-artifacts` (this packet has
   `reflectionRequired: true`, so a missing/invalid reflection blocks closeout).
3. Update `README.md` (status, latest evidence) and `ops/manifest.json` phase
   statuses + `initiative.status`.

## Execution Notes

- Preserve unrelated worktree changes.
- Keep `SPEC.md` normative and update it only when the contract changes.
- Keep this plan current; archive run outputs under `history/`.
- Do NOT let any IP-law vocabulary enter the epistemic slice — that is the
  `law-practice-office-action-spike` packet's job.
- If the bounded SHACL subset cannot express the claim shape, stop with evidence
  per the `SPEC.md` stop condition; do not extend the engine.

## Verification Commands

```sh
test "$(wc -m < goals/epistemic-claim-lifecycle-gate/GOAL.md)" -le 4000
jq . goals/epistemic-claim-lifecycle-gate/ops/manifest.json
rg -n "epistemic-claim-lifecycle-gate|GOAL.md|agentLaunchers|packetAnchorDocument" goals/epistemic-claim-lifecycle-gate
git diff --check -- goals/epistemic-claim-lifecycle-gate
bun run check --filter @beep/epistemic-domain
bun test packages/epistemic
bun run beep lint reflection-artifacts
```
