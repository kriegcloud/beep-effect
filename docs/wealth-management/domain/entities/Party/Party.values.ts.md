---
title: Party.values.ts
nav_order: 10
parent: "@beep/wealth-management-domain"
---

## Party.values.ts overview

Party value schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [PartyType (type alias)](#partytype-type-alias)
- [schemas](#schemas)
  - [PartyType](#partytype)
---

# models

## PartyType (type alias)

Runtime type for `PartyType`.

**Example**

```ts
import type { PartyType } from "@beep/wealth-management-domain"

const value: PartyType = "person"
console.log(value)
```

**Signature**

```ts
type PartyType = typeof PartyType.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/wealth-management/domain/src/entities/Party/Party.values.ts#L46)

Since v0.0.0

# schemas

## PartyType

Fixture party type vocabulary.

**Example**

```ts
import { PartyType } from "@beep/wealth-management-domain"

console.log(PartyType.is.person("person"))
```

**Signature**

```ts
declare const PartyType: AnnotatedSchema<LiteralKit<readonly ["person"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/wealth-management/domain/src/entities/Party/Party.values.ts#L26)

Since v0.0.0