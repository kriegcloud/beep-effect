---
title: Specification.model.ts
nav_order: 22
parent: "@beep/repo-utils"
---

## Specification.model.ts overview

JSDoc metadata models.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [Specification](#specification)
  - [Specification (type alias)](#specification-type-alias)
---

# models

## Specification

Enumerates canonical standards that define a documentation tag.

**Example**

```ts
import { Specification } from "@beep/repo-utils/JSDoc/models/Specification.model"

console.log(Specification)
```

**Signature**

```ts
declare const Specification: AnnotatedSchema<LiteralKit<readonly ["jsdoc3", "tsdocCore", "tsdocExtended", "tsdocDiscretionary", "typescript", "closure", "apiExtractor", "typedoc", "custom"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/Specification.model.ts#L24)

Since v0.0.0

## Specification (type alias)

Union of canonical documentation standards represented by `Specification`.

**Example**

```ts
import type { Specification } from "@beep/repo-utils/JSDoc/models/Specification.model"

type Example = Specification
const accept = <A extends Example>(value: A): A => value
console.log(accept)
```

**Signature**

```ts
type Specification = typeof Specification.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/Specification.model.ts#L63)

Since v0.0.0