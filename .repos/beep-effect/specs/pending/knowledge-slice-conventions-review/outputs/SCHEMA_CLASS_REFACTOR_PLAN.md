# Schema Class Refactor Plan

**Spec**: `knowledge-slice-conventions-review`  
**Date**: 2026-02-07  

## Policy Summary

- Prefer `effect/Schema` classes (`S.Class`) for data models that cross boundaries or need defaults + runtime validation.
- Keep service contracts as interfaces (used by `Context.Tag(...)`).

## Candidates

| Module | File | Symbol | Current | Proposed | Boundary | Plan | Evidence |
|---|---|---|---|---|---|---|---|
| `packages/knowledge/server` | `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts` | `WorkflowExecutionRecord` | `interface` | `S.Class` | `persist` | **Completed (2026-02-07)**: converted `WorkflowExecutionRecord` to `S.Class`, added `decodeWorkflowExecutionRecord`, and decode DB rows at `getExecution` and `findLatestBatchExecutionByBatchId` (service contract unchanged). | `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts` + `packages/knowledge/server/test/Workflow/WorkflowPersistence.schema.test.ts` + `bun run --cwd packages/knowledge/server test` PASS (2026-02-07) |
| `packages/knowledge/server` | `packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts` | `ExtractedEmailDocument` | `interface` | `S.Class` | `parse` | **Completed (2026-02-07)**: converted `EmailMetadata` + `ExtractedEmailDocument` to `S.Class` and decode documents before returning from adapter (runtime-safe construction). | `packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts` + `packages/knowledge/server/test/adapters/GmailExtractionAdapter.test.ts` + `bun run --cwd packages/knowledge/server test` PASS (2026-02-07) |

## Deferred Conversions

None. During Phase 1 and Phase 2, the only boundary-crossing “data model” interfaces identified in `packages/knowledge/*` were converted, and service-contract shapes were intentionally kept as interfaces.

## Defaulting Rules (Concrete)

- `Option` defaults: use `S.optionalWith(S.OptionFromUndefinedOr(X), { default: O.none<X> })` or a nullish variant if the input is nullish.
- Primitive defaults: use lazy defaults, e.g. `S.optionalWith(S.String, { default: () => "" })`.
- Maps: prefer `@beep/schema` helpers (e.g. `BS.MutableHashMap(...)`) where available.
