---
title: Organization.values.ts
nav_order: 11
parent: "@beep/shared-domain"
---

## Organization.values.ts overview

Concept-local Organization value vocabulary.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [LicenseTier (type alias)](#licensetier-type-alias)
  - [Settings (class)](#settings-class)
- [schemas](#schemas)
  - [LicenseTier](#licensetier)
---

# models

## LicenseTier (type alias)

Runtime type for `LicenseTier`.

**Example**

```ts
import { Organization } from "@beep/shared-domain/entities"

const printTier = (tier: Organization.LicenseTier) => console.log(tier)
console.log(printTier)
```

**Signature**

```ts
type LicenseTier = typeof LicenseTier.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entities/Organization/Organization.values.ts#L54)

Since v0.0.0

## Settings (class)

Compliance and automation settings owned by an organization.

**Example**

```ts
import { Effect } from "effect"
import { Organization } from
"@beep/shared-domain/entities"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const settings = yield* S.decodeUnknownEffect(Organization.Settings)({
    allowAgentActions: true,
    defaultRetentionDays: 90,
  })
  return settings.allowAgentActions
})
console.log(program)
```

**Signature**

```ts
declare class Settings
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entities/Organization/Organization.values.ts#L79)

Since v0.0.0

# schemas

## LicenseTier

Commercial license tier assigned to an organization.

**Example**

```ts
import { Effect } from "effect"
import { Organization } from "@beep/shared-domain/entities"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const tier = yield* S.decodeUnknownEffect(Organization.LicenseTier)("enterprise")
  return Organization.LicenseTier.is.enterprise(tier)
})
console.log(program)
```

**Signature**

```ts
declare const LicenseTier: AnnotatedSchema<LiteralKit<readonly ["solo", "team", "enterprise"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entities/Organization/Organization.values.ts#L34)

Since v0.0.0