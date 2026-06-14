---
title: Utils.ts
nav_order: 23
parent: "@beep/utils"
---

## Utils.ts overview

Miscellaneous runtime utilities and structural comparison hooks.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - ["effect/Utils" (namespace export)](#effectutils-namespace-export)
  - [structuralRegion](#structuralregion)
  - [structuralRegionState](#structuralregionstate)
---

# utilities

## "effect/Utils" (namespace export)

Re-exports all named exports from the "effect/Utils" module.

**Signature**

```ts
export * from "effect/Utils"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Utils.ts#L64)

Since v0.0.0

## structuralRegion

Note: this is an experimental feature made available to allow custom matchers in tests, not to be directly used yet in user code

**Example**

```ts
import { structuralRegion } from "@beep/utils/Utils"

console.log(structuralRegion)
```

**Signature**

```ts
declare const structuralRegion: <A>(body: () => A, tester?: (a: unknown, b: unknown) => boolean) => A
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Utils.ts#L43)

Since v0.0.0

## structuralRegionState

Note: this is an experimental feature made available to allow custom matchers in tests, not to be directly used yet in user code

**Example**

```ts
import { structuralRegionState } from "@beep/utils/Utils"

console.log(structuralRegionState)
```

**Signature**

```ts
declare const structuralRegionState: { enabled: boolean; tester: ((a: unknown, b: unknown) => boolean) | undefined; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Utils.ts#L22)

Since v0.0.0