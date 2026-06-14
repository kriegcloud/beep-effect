---
title: ApprovalDecision.model.ts
nav_order: 24
parent: "@beep/workspace-domain"
---

## ApprovalDecision.model.ts overview

Workspace approval decision value schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [ApprovalDecision (type alias)](#approvaldecision-type-alias)
- [schemas](#schemas)
  - [ApprovalDecision](#approvaldecision)
---

# models

## ApprovalDecision (type alias)

Runtime type for `ApprovalDecision`.

**Example**

```ts
import type { ApprovalDecision } from "@beep/workspace-domain"

const value: ApprovalDecision = "pending"
console.log(value)
```

**Signature**

```ts
type ApprovalDecision = typeof ApprovalDecision.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/workspace/domain/src/values/ApprovalDecision/ApprovalDecision.model.ts#L45)

Since v0.0.0

# schemas

## ApprovalDecision

Review decision vocabulary for approval gates.

**Example**

```ts
import { ApprovalDecision } from "@beep/workspace-domain"

console.log(ApprovalDecision.is.pending("pending"))
```

**Signature**

```ts
declare const ApprovalDecision: AnnotatedSchema<LiteralKit<readonly ["pending"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/workspace/domain/src/values/ApprovalDecision/ApprovalDecision.model.ts#L25)

Since v0.0.0