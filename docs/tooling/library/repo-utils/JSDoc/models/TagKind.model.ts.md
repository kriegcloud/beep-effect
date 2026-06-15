---
title: TagKind.model.ts
nav_order: 36
parent: "@beep/repo-utils"
---

## TagKind.model.ts overview

JSDoc metadata models.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [TagKind](#tagkind)
  - [TagKind (type alias)](#tagkind-type-alias)
---

# models

## TagKind

Classifies a tag by its syntactic placement in documentation text.

**Example**

```ts
import { TagKind } from "@beep/repo-utils/JSDoc/models/TagKind.model"
console.log(TagKind)
```

**Signature**

```ts
declare const TagKind: AnnotatedSchema<LiteralKit<readonly ["block", "inline", "modifier"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TagKind.model.ts#L24)

Since v0.0.0

## TagKind (type alias)

Union of supported documentation tag placement kinds.

**Example**

```ts
import type { TagKind } from "@beep/repo-utils/JSDoc/models/TagKind.model"
type Example = TagKind
const accept = <A extends Example>(value: A): A => value
console.log(accept)
```

**Signature**

```ts
type TagKind = typeof TagKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/TagKind.model.ts#L51)

Since v0.0.0