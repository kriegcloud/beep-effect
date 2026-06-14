---
title: PatentAsset.values.ts
nav_order: 13
parent: "@beep/law-practice-domain"
---

## PatentAsset.values.ts overview

Patent asset value schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [PatentAssetStatus (type alias)](#patentassetstatus-type-alias)
- [schemas](#schemas)
  - [PatentAssetStatus](#patentassetstatus)
---

# models

## PatentAssetStatus (type alias)

Runtime type for `PatentAssetStatus`.

**Example**

```ts
import type { PatentAssetStatus } from "@beep/law-practice-domain"

const value: PatentAssetStatus = "pre_filing"
console.log(value)
```

**Signature**

```ts
type PatentAssetStatus = typeof PatentAssetStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/law-practice/domain/src/entities/PatentAsset/PatentAsset.values.ts#L46)

Since v0.0.0

# schemas

## PatentAssetStatus

Patent asset status vocabulary represented in proof seeds.

**Example**

```ts
import { PatentAssetStatus } from "@beep/law-practice-domain"

console.log(PatentAssetStatus.is.pre_filing("pre_filing"))
```

**Signature**

```ts
declare const PatentAssetStatus: AnnotatedSchema<LiteralKit<readonly ["pre_filing"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/law-practice/domain/src/entities/PatentAsset/PatentAsset.values.ts#L26)

Since v0.0.0