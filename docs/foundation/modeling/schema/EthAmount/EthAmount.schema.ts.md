---
title: EthAmount.schema.ts
nav_order: 75
parent: "@beep/schema"
---

## EthAmount.schema.ts overview

ETH-denominated amount transported as a non-negative JSON number.

Decodes into Effect `BigDecimal` for arithmetic safety.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [EthAmount (type alias)](#ethamount-type-alias)
- [schemas](#schemas)
  - [Schema](#schema)
- [validation](#validation)
  - [EthAmount](#ethamount)
---

# models

## EthAmount (type alias)

Type for `EthAmount`.

**Signature**

```ts
type EthAmount = typeof EthAmount.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EthAmount/EthAmount.schema.ts#L71)

Since v0.0.0

# schemas

## Schema

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Schema: AnnotatedSchema<S.decodeTo<S.BigDecimal, S.Finite & SchemaStatics<S.Finite>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EthAmount/EthAmount.schema.ts#L79)

Since v0.0.0

# validation

## EthAmount

ETH-denominated amount decoded from a non-negative JSON number into Effect
`BigDecimal`.

**Example**

```ts
import { EthAmount } from "@beep/schema/EthAmount"
import * as S from "effect/Schema"

const amount = S.decodeUnknownSync(EthAmount)(1.5)
console.log(amount)
```

**Signature**

```ts
declare const EthAmount: AnnotatedSchema<S.decodeTo<S.BigDecimal, S.Finite & SchemaStatics<S.Finite>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EthAmount/EthAmount.schema.ts#L55)

Since v0.0.0