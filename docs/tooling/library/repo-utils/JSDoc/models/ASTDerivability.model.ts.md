---
title: ASTDerivability.model.ts
nav_order: 14
parent: "@beep/repo-utils"
---

## ASTDerivability.model.ts overview

JSDoc metadata models.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [ASTDerivability](#astderivability)
  - [ASTDerivability (type alias)](#astderivability-type-alias)
---

# models

## ASTDerivability

Whether this tag's content can be deterministically derived from the TypeScript AST.

This is the KEY field for the knowledge graph pipeline:
  - "full"    → Layer 1 (certainty=1.0): 100% derivable from AST, no human input needed
  - "partial" → Layer 2 (certainty=0.85-0.95): Structurally derivable but may need human context
  - "none"    → Layer 3 (certainty=0.6-0.85): Requires human authoring or LLM inference

**Example**

```ts
import { ASTDerivability } from "@beep/repo-utils/JSDoc/models/ASTDerivability.model"

console.log(ASTDerivability)
```

**Signature**

```ts
declare const ASTDerivability: AnnotatedSchema<LiteralKit<readonly ["full", "partial", "none"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/ASTDerivability.model.ts#L30)

Since v0.0.0

## ASTDerivability (type alias)

JSDoc model export.

**Example**

```ts
import type { ASTDerivability } from "@beep/repo-utils/JSDoc/models/ASTDerivability.model"

type Example = ASTDerivability
const accept = <A extends Example>(value: A): A => value
console.log(accept)
```

**Signature**

```ts
type ASTDerivability = typeof ASTDerivability.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/ASTDerivability.model.ts#L52)

Since v0.0.0