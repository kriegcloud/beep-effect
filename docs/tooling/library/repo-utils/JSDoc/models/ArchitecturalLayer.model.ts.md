---
title: ArchitecturalLayer.model.ts
nav_order: 13
parent: "@beep/repo-utils"
---

## ArchitecturalLayer.model.ts overview

Architectural layer taxonomy model definitions.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [ArchitecturalLayer](#architecturallayer)
  - [ArchitecturalLayer (type alias)](#architecturallayer-type-alias)
---

# models

## ArchitecturalLayer

Architectural layer mappings across established patterns.
Enables cross-framework queries such as "show me all code in the
domain core that depends on infrastructure".

**Example**

```ts
import { ArchitecturalLayer } from "@beep/repo-utils/JSDoc/models/ArchitecturalLayer.model"

console.log(ArchitecturalLayer)
```

**Signature**

```ts
declare const ArchitecturalLayer: AnnotatedSchema<LiteralKit<readonly ["DomainEntity", "UseCase", "InterfaceAdapter", "FrameworkDriver", "Port", "Adapter", "Core", "CrossCutting"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/ArchitecturalLayer.model.ts#L27)

Since v0.0.0

## ArchitecturalLayer (type alias)

Inferred type for `ArchitecturalLayer`.

**Example**

```ts
import type { ArchitecturalLayer } from "@beep/repo-utils/JSDoc/models/ArchitecturalLayer.model"

type Example = ArchitecturalLayer
const accept = <A extends Example>(value: A): A => value
console.log(accept)
```

**Signature**

```ts
type ArchitecturalLayer = typeof ArchitecturalLayer.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/ArchitecturalLayer.model.ts#L57)

Since v0.0.0