---
title: Matter.values.ts
nav_order: 10
parent: "@beep/law-practice-domain"
---

## Matter.values.ts overview

Matter value schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [MatterType (type alias)](#mattertype-type-alias)
- [schemas](#schemas)
  - [MatterType](#mattertype)
---

# models

## MatterType (type alias)

Runtime type for `MatterType`.

**Example**

```ts
import type { MatterType } from "@beep/law-practice-domain"

const value: MatterType = "patent_application"
console.log(value)
```

**Signature**

```ts
type MatterType = typeof MatterType.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/law-practice/domain/src/entities/Matter/Matter.values.ts#L46)

Since v0.0.0

# schemas

## MatterType

Matter type vocabulary represented in proof seeds.

**Example**

```ts
import { MatterType } from "@beep/law-practice-domain"

console.log(MatterType.is.patent_application("patent_application"))
```

**Signature**

```ts
declare const MatterType: AnnotatedSchema<LiteralKit<readonly ["patent_application"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/law-practice/domain/src/entities/Matter/Matter.values.ts#L26)

Since v0.0.0