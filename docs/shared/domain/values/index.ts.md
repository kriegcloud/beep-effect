---
title: index.ts
nav_order: 32
parent: "@beep/shared-domain"
---

## index.ts overview

LocalDate - Value object representing a local date.

**Example**

```ts
import { LocalDate } from "@beep/shared-domain/values"

console.log(LocalDate.today().toISOString())
```

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [LocalDate (namespace export)](#localdate-namespace-export)
- [value-objects](#value-objects)
  - [OnePasswordReference (namespace export)](#onepasswordreference-namespace-export)
---

# models

## LocalDate (namespace export)

Re-exports all named exports from the "./LocalDate/index.ts" module as `LocalDate`.

**Example**

```ts
import { LocalDate } from "@beep/shared-domain/values"

console.log(LocalDate.today().toISOString())
```

**Signature**

```ts
export * as LocalDate from "./LocalDate/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/index.ts#L21)

Since v0.0.0

# value-objects

## OnePasswordReference (namespace export)

Re-exports all named exports from the "./OnePasswordReference/index.ts" module as `OnePasswordReference`.

**Example**

```ts
import { OnePasswordReference } from "@beep/shared-domain/values"

console.log(OnePasswordReference.OnePasswordReference)
```

**Signature**

```ts
export * as OnePasswordReference from "./OnePasswordReference/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/index.ts#L35)

Since v0.0.0