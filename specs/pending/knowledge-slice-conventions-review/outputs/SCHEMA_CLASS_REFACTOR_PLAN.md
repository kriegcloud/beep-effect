# Schema Class Refactor Plan

**Spec**: `knowledge-slice-conventions-review`  
**Date**: 2026-02-07  

## Policy Summary

- Prefer `effect/Schema` classes (`S.Class`) for data models that cross boundaries or need defaults + runtime validation.
- Keep service contracts as interfaces (used by `Context.Tag(...)`).

## Candidates

| Module | File | Symbol | Current | Proposed | Boundary | Plan | Evidence |
|---|---|---|---|---|---|---|---|
| `packages/knowledge/server` | `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts` | `WorkflowExecutionRecord` | `interface` | `S.Class` | `persist` | Define `S.Class` with `input/output` JSON shape, decode rows at `getExecution`/`requireBatchExecutionByBatchId` boundaries; keep service contract unchanged. | Add tests that fail on invalid row shapes and verify default/null handling. |
| `packages/knowledge/server` | `packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts` | `ExtractedEmailDocument` | `interface` | `S.Class` | `parse` | Introduce schema class for extracted email payload; decode external API data before emitting `ExtractedEmailDocument` (runtime-safe construction). | Add adapter tests validating decode failures + defaults. |

## Defaulting Rules (Concrete)

- `Option` defaults: use `S.optionalWith(S.OptionFromUndefinedOr(X), { default: O.none<X> })` or a nullish variant if the input is nullish.
- Primitive defaults: use lazy defaults, e.g. `S.optionalWith(S.String, { default: () => "" })`.
- Maps: prefer `@beep/schema` helpers (e.g. `BS.MutableHashMap(...)`) where available.
