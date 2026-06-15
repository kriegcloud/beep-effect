---
title: SubresourceIntegrityPlugin.schema.ts
nav_order: 20
parent: "@beep/repo-configs"
---

## SubresourceIntegrityPlugin.schema.ts overview

Schemas for Next.js subresource integrity plugin configuration.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [SubresourceIntegrityAlgorithm (type alias)](#subresourceintegrityalgorithm-type-alias)
- [schemas](#schemas)
  - [SubresourceIntegrityAlgorithm](#subresourceintegrityalgorithm)
---

# models

## SubresourceIntegrityAlgorithm (type alias)

Supported subresource integrity hash algorithm.

**Example**

```ts
import type { SubresourceIntegrityAlgorithm } from "@beep/repo-configs/next/models/SubresourceIntegrityPlugin.schema"
const algorithm = "sha384" satisfies SubresourceIntegrityAlgorithm
console.log(algorithm)
```

**Signature**

```ts
type SubresourceIntegrityAlgorithm = typeof SubresourceIntegrityAlgorithm.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/SubresourceIntegrityPlugin.schema.ts#L42)

Since v0.0.0

# schemas

## SubresourceIntegrityAlgorithm

Supported subresource integrity hash algorithms.

**Example**

```ts
import { SubresourceIntegrityAlgorithm } from "@beep/repo-configs/next/models/SubresourceIntegrityPlugin.schema"
const algorithm = SubresourceIntegrityAlgorithm
console.log(algorithm)
```

**Signature**

```ts
declare const SubresourceIntegrityAlgorithm: AnnotatedSchema<LiteralKit<readonly ["sha256", "sha384", "sha512"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/SubresourceIntegrityPlugin.schema.ts#L24)

Since v0.0.0