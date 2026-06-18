# Law-Practice Office-Action Extraction Rung

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Graduate the law-practice office-action loop beyond the rung-0 fixed candidate
list by invoking the provider-neutral `@beep/langextract` service, preserving
span-grounded `GroundedExtraction[]`, and adding enough adverse extraction cases
to make the next doctrine breadth slice safe.

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/law-practice-office-action-extraction-rung/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth.
3. [`PLAN.md`](./PLAN.md) - active execution plan.
4. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
5. [`../agentic-professional-runtime/SPEC.md`](../agentic-professional-runtime/SPEC.md) - product authority.
6. [`../agentic-professional-runtime/docs/data-model-law-practice.md`](../agentic-professional-runtime/docs/data-model-law-practice.md) - law data model authority.
7. [`../law-practice-office-action-spike/`](../law-practice-office-action-spike/) - completed rung-0 reference.

## Current Phase

P0 Scope confirmation is pending. Start by inspecting the current
`OfficeActionReview` loop, the `@beep/langextract/Service` contract, and the
law-practice server layer composition.

## Latest Evidence

Not started. This packet was opened after PR #262 merged the file-processing
and rung-0 office-action loop to `main` on 2026-06-18.

## Notes

- The fixed `OfficeActionReviewSpikeCandidates` list is the implementation seam
  to replace.
- Keep tests deterministic with fake language-model output; live provider
  credentials are not required for packet completion.
- The nlp `AnnotatedDocument` envelope is still span-lossy for law anchoring.
  Feed `LangExtractResult.extractions` / `GroundedExtraction[]` into `IrToLaw`.
- Fixtures must remain synthetic/public only.
