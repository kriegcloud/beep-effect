---
title: LawPractice.ts
nav_order: 26
parent: "@beep/shared-domain"
---

## LawPractice.ts overview

Law-practice slice entity-id registry.

Since v0.0.0

---
## Exports Grouped by Category
- [entity-ids](#entity-ids)
  - [LegalClientId](#legalclientid)
  - [LegalClientId (type alias)](#legalclientid-type-alias)
  - [LegalContactId](#legalcontactid)
  - [LegalContactId (type alias)](#legalcontactid-type-alias)
  - [MatterId](#matterid)
  - [MatterId (type alias)](#matterid-type-alias)
  - [PatentAssetId](#patentassetid)
  - [PatentAssetId (type alias)](#patentassetid-type-alias)
---

# entity-ids

## LegalClientId

Legal client entity identifier.

**Example**

```ts
import * as LawPractice from "@beep/shared-domain/identity/LawPractice"

console.log(LawPractice.LegalClientId.entityType)
```

**Signature**

```ts
declare const LegalClientId: EntityId.EntityId<"law_practice", "legal_client", "law_practice_legal_client", "law_practice.legal_client", "LawPracticeLegalClient", "LawPracticeLegalClientId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/LawPractice.ts#L27)

Since v0.0.0

## LegalClientId (type alias)

Runtime type for `LegalClientId`.

**Example**

```ts
import { Effect } from "effect"
import * as LawPractice from "@beep/shared-domain/identity/LawPractice"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id: LawPractice.LegalClientId = yield* S.decodeUnknownEffect(LawPractice.LegalClientId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type LegalClientId = typeof LegalClientId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/LawPractice.ts#L50)

Since v0.0.0

## LegalContactId

Legal contact entity identifier.

**Example**

```ts
import * as LawPractice from "@beep/shared-domain/identity/LawPractice"

console.log(LawPractice.LegalContactId.entityType)
```

**Signature**

```ts
declare const LegalContactId: EntityId.EntityId<"law_practice", "legal_contact", "law_practice_legal_contact", "law_practice.legal_contact", "LawPracticeLegalContact", "LawPracticeLegalContactId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/LawPractice.ts#L65)

Since v0.0.0

## LegalContactId (type alias)

Runtime type for `LegalContactId`.

**Example**

```ts
import { Effect } from "effect"
import * as LawPractice from "@beep/shared-domain/identity/LawPractice"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id: LawPractice.LegalContactId = yield* S.decodeUnknownEffect(LawPractice.LegalContactId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type LegalContactId = typeof LegalContactId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/LawPractice.ts#L88)

Since v0.0.0

## MatterId

Matter entity identifier.

**Example**

```ts
import * as LawPractice from "@beep/shared-domain/identity/LawPractice"

console.log(LawPractice.MatterId.entityType)
```

**Signature**

```ts
declare const MatterId: EntityId.EntityId<"law_practice", "matter", "law_practice_matter", "law_practice.matter", "LawPracticeMatter", "LawPracticeMatterId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/LawPractice.ts#L103)

Since v0.0.0

## MatterId (type alias)

Runtime type for `MatterId`.

**Example**

```ts
import { Effect } from "effect"
import * as LawPractice from "@beep/shared-domain/identity/LawPractice"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id: LawPractice.MatterId = yield* S.decodeUnknownEffect(LawPractice.MatterId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type MatterId = typeof MatterId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/LawPractice.ts#L126)

Since v0.0.0

## PatentAssetId

Patent asset entity identifier.

**Example**

```ts
import * as LawPractice from "@beep/shared-domain/identity/LawPractice"

console.log(LawPractice.PatentAssetId.entityType)
```

**Signature**

```ts
declare const PatentAssetId: EntityId.EntityId<"law_practice", "patent_asset", "law_practice_patent_asset", "law_practice.patent_asset", "LawPracticePatentAsset", "LawPracticePatentAssetId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/LawPractice.ts#L141)

Since v0.0.0

## PatentAssetId (type alias)

Runtime type for `PatentAssetId`.

**Example**

```ts
import { Effect } from "effect"
import * as LawPractice from "@beep/shared-domain/identity/LawPractice"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id: LawPractice.PatentAssetId = yield* S.decodeUnknownEffect(LawPractice.PatentAssetId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type PatentAssetId = typeof PatentAssetId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/LawPractice.ts#L164)

Since v0.0.0