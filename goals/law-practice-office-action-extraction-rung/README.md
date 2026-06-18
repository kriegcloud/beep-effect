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

P3 Verify and close is in progress. P0-P2 are locally complete: production
`OfficeActionReview` invokes `LangExtractService.extract`, feeds
`LangExtractResult.extractions` to `IrToLaw`, and rejects unaligned distinction
output before claim admission. Remaining closeout work is Yeet verify, PR
publish/monitor, and hosted review closeout.

## Latest Evidence

- P0/P1 - current seams confirmed: fixed spike candidates were only in
  `OfficeActionReview.service.ts`, `LangExtractService.extract` takes a
  schema-backed `LangExtractRequest`, and server Layer composition can require a
  generic `LanguageModel.LanguageModel` without provider-specific law-practice
  dependencies.
- P1/P2 - production `OfficeActionReview` now constructs law extraction targets
  (`office_action`, `claim`, `rejection_reference`, `distinction`), calls
  `LangExtractService.extract`, and passes `LangExtractResult.extractions` into
  `IrToLaw`.
- P2 - `IrToLaw` now returns typed `IrToLawExtractionError` failures for missing
  required labels or unaligned distinction evidence instead of fabricating
  fallback spans.
- P2 - deterministic server test has 3 passing cases: direct `IrToLaw`
  grounding, happy-path review through fake model output, and unaligned
  distinction rejection before admission.
- P2 - doctrine breadth is explicitly deferred to the next rung: multi-reference
  103 plus 101/112 handling stays out of this extraction-service graduation.
- P3 - local focused tests, package checks/lints, and root `bun run check` are
  green as of 2026-06-18; Yeet verify/publish/hosted closeout remain pending.

## Notes

- The fixed `OfficeActionReviewSpikeCandidates` list is retained only through
  the package test surface for deterministic mapping assertions.
- Keep tests deterministic with fake language-model output; live provider
  credentials are not required for packet completion.
- Use Yeet for branch proof, PR creation, hosted monitor, and closeout:
  `yeet verify` -> `yeet publish --pr --monitor` -> `yeet monitor --summary`
  -> `yeet closeout --summary ...`.
- The nlp `AnnotatedDocument` envelope is still span-lossy for law anchoring.
  Feed `LangExtractResult.extractions` / `GroundedExtraction[]` into `IrToLaw`.
- Fixtures must remain synthetic/public only.
