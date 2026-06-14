---
title: ClaimLifecycle.model.ts
nav_order: 11
parent: "@beep/epistemic-domain"
---

## ClaimLifecycle.model.ts overview

Claim lifecycle value schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [ClaimLifecycle (type alias)](#claimlifecycle-type-alias)
- [schemas](#schemas)
  - [ClaimLifecycle](#claimlifecycle)
---

# models

## ClaimLifecycle (type alias)

Runtime type for `ClaimLifecycle`.

**Example**

```ts
import type { ClaimLifecycle } from "@beep/epistemic-domain"

const value: ClaimLifecycle = "candidate"
console.log(value)
```

**Signature**

```ts
type ClaimLifecycle = typeof ClaimLifecycle.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/epistemic/domain/src/values/ClaimLifecycle/ClaimLifecycle.model.ts#L45)

Since v0.0.0

# schemas

## ClaimLifecycle

Candidate lifecycle vocabulary for claim outputs.

**Example**

```ts
import { ClaimLifecycle } from "@beep/epistemic-domain"

console.log(ClaimLifecycle.is.candidate("candidate"))
```

**Signature**

```ts
declare const ClaimLifecycle: AnnotatedSchema<LiteralKit<readonly ["candidate"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/epistemic/domain/src/values/ClaimLifecycle/ClaimLifecycle.model.ts#L25)

Since v0.0.0