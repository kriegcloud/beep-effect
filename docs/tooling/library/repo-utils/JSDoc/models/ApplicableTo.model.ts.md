---
title: ApplicableTo.model.ts
nav_order: 12
parent: "@beep/repo-utils"
---

## ApplicableTo.model.ts overview

JSDoc metadata models.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [ApplicableTo](#applicableto)
  - [ApplicableTo (type alias)](#applicableto-type-alias)
---

# models

## ApplicableTo

AST-level attachment surface for a documentation tag.

**Example**

```ts
import { ApplicableTo } from "@beep/repo-utils/JSDoc/models/ApplicableTo.model"

console.log(ApplicableTo)
```

**Signature**

```ts
declare const ApplicableTo: AnnotatedSchema<LiteralKit<readonly ["function", "method", "class", "classStaticBlock", "interface", "typeAlias", "enum", "enumMember", "variable", "constant", "property", "accessor", "constructor", "parameter", "signature", "indexSignature", "typeParameter", "tupleMember", "exportSpecifier", "identifier", "statement", "expression", "module", "namespace", "file", "event", "mixin", "any"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/ApplicableTo.model.ts#L24)

Since v0.0.0

## ApplicableTo (type alias)

JSDoc model export.

**Example**

```ts
import type { ApplicableTo } from "@beep/repo-utils/JSDoc/models/ApplicableTo.model"

type Example = ApplicableTo
const accept = <A extends Example>(value: A): A => value
console.log(accept)
```

**Signature**

```ts
type ApplicableTo = typeof ApplicableTo.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/ApplicableTo.model.ts#L73)

Since v0.0.0