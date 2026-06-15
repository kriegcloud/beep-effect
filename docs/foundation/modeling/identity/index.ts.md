---
title: index.ts
nav_order: 2
parent: "@beep/identity"
---

## index.ts overview

Identity system core -- composers, annotations, and branded types.

**Example**

```ts
```typescript
import { make } from "@beep/identity"

const { $MyPkgId } = make("my-pkg")
console.log($MyPkgId.make("Service"))
```
```

Since v0.0.0

---
## Exports Grouped by Category
- [identifiers](#identifiers)
  - ["./Id.ts" (namespace export)](#idts-namespace-export)
---

# configuration

## "./packages.ts" (namespace export)

Re-exports all named exports from the "./packages.ts" module.

**Example**

```ts
```typescript
import { $DataId } from "@beep/identity"

console.log($DataId.make("CurrencyCodes"))
```
```

**Signature**

```ts
export * from "./packages.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/index.ts#L45)

Since v0.0.0

# identifiers

## "./Id.ts" (namespace export)

Re-exports all named exports from the "./Id.ts" module.

**Example**

```ts
```typescript
import { make } from "@beep/identity"

const { $MyPkgId } = make("my-pkg")
console.log($MyPkgId.make("Service"))
```
```

**Signature**

```ts
export * from "./Id.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/index.ts#L31)

Since v0.0.0