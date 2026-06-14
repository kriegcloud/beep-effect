---
title: BigDecimal.ts
nav_order: 5
parent: "@beep/schema"
---

## BigDecimal.ts overview

Reusable schemas for decoding Effect `BigDecimal` values.

**See**

- `| effect/BigDecimal`

Since v0.0.0

---
## Exports Grouped by Category
- [validation](#validation)
  - [BigDecimalFromNumber](#bigdecimalfromnumber)
---

# validation

## BigDecimalFromNumber

Schema that decodes a number into an Effect `BigDecimal` and encodes a
`BigDecimal` back to a number.

Useful at boundaries where decimal values are transported as plain JSON
numbers but consumed internally as `BigDecimal`.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { BigDecimalFromNumber } from "@beep/schema/BigDecimal"

const decode = S.decodeUnknownSync(BigDecimalFromNumber)
const value = decode(12.34)
console.log(value)
```
```

**Signature**

```ts
declare const BigDecimalFromNumber: S.decodeTo<S.BigDecimal, S.Finite, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/BigDecimal.ts#L33)

Since v0.0.0