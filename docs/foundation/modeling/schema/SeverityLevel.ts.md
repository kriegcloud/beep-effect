---
title: SeverityLevel.ts
nav_order: 198
parent: "@beep/schema"
---

## SeverityLevel.ts overview

Shared generic severity domains.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [SeverityLevel (type alias)](#severitylevel-type-alias)
- [validation](#validation)
  - [SeverityLevel](#severitylevel)
---

# models

## SeverityLevel (type alias)

Type for `SeverityLevel`.

**Example**

```ts
import type { SeverityLevel } from "@beep/schema/SeverityLevel"

const severity: SeverityLevel = "critical"
```

**Signature**

```ts
type SeverityLevel = typeof SeverityLevel.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SeverityLevel.ts#L49)

Since v0.0.0

# validation

## SeverityLevel

Generic four-level severity scale: `"low"`, `"medium"`, `"high"`, `"critical"`.

**Example**

```ts
import * as S from "effect/Schema"
import { SeverityLevel } from "@beep/schema/SeverityLevel"

const level = S.decodeUnknownSync(SeverityLevel)("high")
console.log(level) // "high"
```

**Signature**

```ts
declare const SeverityLevel: AnnotatedSchema<LiteralKit<readonly ["low", "medium", "high", "critical"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SeverityLevel.ts#L30)

Since v0.0.0