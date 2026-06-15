---
title: Schema.ts
nav_order: 3
parent: "@beep/test-utils"
---

## Schema.ts overview

Schema property-test helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [schema](#schema)
  - [assertSchemaArbitraryDecodesToSelf](#assertschemaarbitrarydecodestoself)
---

# schema

## assertSchemaArbitraryDecodesToSelf

Assert that a schema-derived arbitrary only emits values accepted by the same schema without transformation.

Decoded values are compared structurally so object and class schemas can use the helper.

**Example**

```ts
import { assertSchemaArbitraryDecodesToSelf } from "@beep/test-utils"
import * as S from "effect/Schema"

const Status = S.Literal("ready")
assertSchemaArbitraryDecodesToSelf(Status, { numRuns: 4 })
```

**Signature**

```ts
declare const assertSchemaArbitraryDecodesToSelf: <Schema extends S.Decoder<unknown>>(schema: Schema, options?: { readonly numRuns?: number; }) => void
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/test-kit/test-utils/src/Schema.ts#L30)

Since v0.0.0