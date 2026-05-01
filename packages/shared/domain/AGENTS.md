# @beep/shared-domain Agent Guide

## Purpose & Fit

- Shared-kernel domain language for cross-slice product concepts, values,
  schemas, and pure behavior.
- This package contains shared entity constructors, shared identity vocabulary,
  the Organization proof, and shared value-object modules. New exports must meet
  the shared-kernel promotion bar.

## Surface Map

| Surface                                      | Key exports   | Notes                                                    |
|----------------------------------------------|---------------|----------------------------------------------------------|
| entry module                                 | `VERSION`, `Aggregates`, `Entities`, `BaseEntity`, `EntityId`, `EntityRef`, `Principal`, `SourceKind`, `Identity`, `Values` | Current package root. |
| `src/aggregates/index.ts`                    | empty module  | Future shared aggregate roots and aggregate vocabulary.  |
| `src/entities/index.ts`                      | `Organization` | Shared identity-bearing concepts.                       |
| `src/entities/Organization/`                 | `Model`, value schemas, behavior helpers | Shared Organization concept. |
| `src/entity/index.ts`                        | `BaseEntity`, `EntityId`, `EntityRef`, `Principal`, `primitives`, `SourceKind` | Shared entity constructor barrel. |
| `src/entity/primitives.ts`                   | `Sha256`, `Ed25519Signature`, `EncryptionKeyId`, `HybridLogicalClock`, `VectorClock` | Shared driver-neutral entity primitive schemas. |
| `src/identity/index.ts`                      | `Shared`      | Shared entity-id modules and identity vocabulary.        |
| `src/values/index.ts`                        | `LocalDate`   | Shared value-object barrel.                              |
| `src/values/LocalDate/index.ts`              | `LocalDate` exports | Shared `LocalDate` value-object barrel.              |
| `src/values/LocalDate/LocalDate.model.ts`    | `Model`       | Shared `LocalDate` schema/model.                         |
| `src/values/LocalDate/LocalDate.behavior.ts` | behavior helpers | Pure `LocalDate` behavior.                            |

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
- Persisted entity models use `BaseEntity.Class` from
  `@beep/shared-domain/entity/BaseEntity` for shared product
  invariants and `@beep/schema/EntitySchema` persisted descriptors for
  storage-neutral persistence metadata.
- New exported models need schema annotations, JSDoc, tests, and docgen-clean
  examples when behavior is added.

## Verifications

- `bunx turbo run check --filter=@beep/shared-domain`
- `bunx turbo run test --filter=@beep/shared-domain`
- `bunx turbo run docgen --filter=@beep/shared-domain`
- `bunx turbo run lint --filter=@beep/shared-domain`
