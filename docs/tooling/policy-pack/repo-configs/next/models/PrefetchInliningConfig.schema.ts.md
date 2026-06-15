---
title: PrefetchInliningConfig.schema.ts
nav_order: 17
parent: "@beep/repo-configs"
---

## PrefetchInliningConfig.schema.ts overview

Schemas for Next.js prefetch inlining configuration.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [PrefetchInliningConfig (type alias)](#prefetchinliningconfig-type-alias)
- [schemas](#schemas)
  - [PrefetchInliningConfig](#prefetchinliningconfig)
---

# models

## PrefetchInliningConfig (type alias)

Companion type for `PrefetchInliningConfig` schema

**Example**

```ts
import type { PrefetchInliningConfig } from "@beep/repo-configs/next/models/PrefetchInliningConfig.schema"
const config = false satisfies PrefetchInliningConfig
console.log(config)
```

**Signature**

```ts
type PrefetchInliningConfig = typeof PrefetchInliningConfig.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/PrefetchInliningConfig.schema.ts#L56)

Since v0.0.0

# schemas

## PrefetchInliningConfig

Resolved form of the prefetchInlining config after normalization in
config.ts. User input (true, partial objects) is converted to this shape.

**Example**

```ts
import { PrefetchInliningConfig } from "@beep/repo-configs/next/models/PrefetchInliningConfig.schema"
const schema = PrefetchInliningConfig
console.log(schema)
```

**Signature**

```ts
declare const PrefetchInliningConfig: AnnotatedSchema<S.Union<readonly [S.Literal<false>, typeof PrefetchInliningConfigComplex]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/PrefetchInliningConfig.schema.ts#L37)

Since v0.0.0