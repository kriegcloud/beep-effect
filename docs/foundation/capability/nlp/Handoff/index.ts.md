---
title: index.ts
nav_order: 33
parent: "@beep/nlp"
---

## index.ts overview

Numeric value between 0 and 1 inclusive, shared by handoff confidence fields.

**Example**

```ts
import { UnitInterval } from "@beep/nlp/Handoff"

console.log(UnitInterval)
```

Since v0.0.0

---
## Exports Grouped by Category
- [interop](#interop)
  - [Contract (namespace export)](#contract-namespace-export)
- [validation](#validation)
  - [UnitInterval](#unitinterval)
---

# interop

## Contract (namespace export)

Re-exports all named exports from the "./Contract.ts" module as `Contract`.

**Example**

```ts
```typescript
import { Contract } from "@beep/nlp/Handoff"

console.log(Contract.AnnotatedDocument)
```
```

**Signature**

```ts
export * as Contract from "./Contract.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Handoff/index.ts#L40)

Since v0.0.0

# validation

## UnitInterval

Numeric value between 0 and 1 inclusive, shared by handoff confidence fields.

**Example**

```ts
import { UnitInterval } from "@beep/nlp/Handoff"

console.log(UnitInterval)
```

**Signature**

```ts
declare const UnitInterval: AnnotatedSchema<Finite>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Handoff/index.ts#L25)

Since v0.0.0