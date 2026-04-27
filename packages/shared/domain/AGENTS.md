# @beep/domain Agent Guide

## Purpose & Fit

- Shared-kernel domain language for cross-slice product concepts, values,
  schemas, and pure behavior.
- This package is currently scaffolded around `VERSION` plus domain-kind modules
  for aggregates, entities, identity, values, and `values/LocalDate`. New
  exports must meet the shared-kernel promotion bar.

## Surface Map

| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | `VERSION` | Current package entry point. |
| `src/aggregates/index.ts` | empty module | Future shared aggregate roots and aggregate vocabulary. |
| `src/entities/index.ts` | empty module | Future shared identity-bearing concepts. |
| `src/identity/index.ts` | empty module | Future shared entity-id modules and identity vocabulary. |
| `src/values/index.ts` | empty module | Future shared value-object barrel. |
| `src/values/LocalDate/index.ts` | empty module | Future shared `LocalDate` value-object barrel. |
| `src/values/LocalDate/LocalDate.model.ts` | module header | Future shared `LocalDate` schema/model. |
| `src/values/LocalDate/LocalDate.behavior.ts` | empty file | Future pure `LocalDate` behavior. |

## Add Here

- Schema-first shared value objects and rich domain models.
- Pure behavior, policies, invariants, guards, and domain events.
- Driver-neutral vocabulary that multiple slices intentionally share.

## Keep Out

- Slice-private models, config access, persistence, UI, server/client adapters,
  drivers, workflow orchestration, and generic foundation helpers.

## Laws

- Domain stays pure and driver-neutral.
- Domain may depend only on allowed shared-kernel language and foundation
  primitive/modeling packages.
- New exported models need schema annotations, JSDoc, tests, and docgen-clean
  examples when behavior is added.

## Verifications

- `bunx turbo run check --filter=@beep/domain`
- `bunx turbo run test --filter=@beep/domain`
- `bunx turbo run lint --filter=@beep/domain`
