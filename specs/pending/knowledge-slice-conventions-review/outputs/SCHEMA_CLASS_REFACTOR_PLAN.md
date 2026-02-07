# Schema Class Refactor Plan

**Spec**: `knowledge-slice-conventions-review`  
**Date**: 2026-02-07  

## Policy Summary

- Prefer `effect/Schema` classes (`S.Class`) for data models that cross boundaries or need defaults + runtime validation.
- Keep service contracts as interfaces (used by `Context.Tag(...)`).

## Candidates

| Module | File | Symbol | Current | Proposed | Boundary | Plan | Evidence |
|---|---|---|---|---|---|---|---|
| `___` | `___` | `___` | `interface` | `S.Class` | `rpc/llm/persist/parse` | `defaults + decode site` | `tests` |

## Defaulting Rules (Concrete)

- `Option` defaults: use `S.optionalWith(S.OptionFromUndefinedOr(X), { default: O.none<X> })` or a nullish variant if the input is nullish.
- Primitive defaults: use lazy defaults, e.g. `S.optionalWith(S.String, { default: () => "" })`.
- Maps: prefer `@beep/schema` helpers (e.g. `BS.MutableHashMap(...)`) where available.

