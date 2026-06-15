---
title: weak-registry.ts
nav_order: 8
parent: "@beep/form"
---

## weak-registry.ts overview

Small registry abstraction used by form atom caches.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [createWeakRegistry](#createweakregistry)
- [models](#models)
  - [WeakRegistry (interface)](#weakregistry-interface)
---

# constructors

## createWeakRegistry

Creates an Effect collection-backed registry for atom caches.

**Example**

```ts
import { createWeakRegistry } from "@beep/form/core/internal/weak-registry"

const registry = createWeakRegistry<{ readonly value: string }>()
registry.set("name", { value: "Ada" })
console.log(registry.get("name")?.value) // "Ada"
```

**Signature**

```ts
declare const createWeakRegistry: <V extends object>() => WeakRegistry<V>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/internal/weak-registry.ts#L48)

Since v0.0.0

# models

## WeakRegistry (interface)

String-keyed registry used to cache atom instances.

**Example**

```ts
import type { WeakRegistry } from "@beep/form/core/internal/weak-registry"

type RegistryKeys = keyof WeakRegistry<{ readonly value: string }>
const key: RegistryKeys = "get"
console.log(key) // "get"
```

**Signature**

```ts
export interface WeakRegistry<V extends object> {
  readonly clear: () => void;
  readonly delete: (key: string) => boolean;
  readonly get: (key: string) => V | undefined;
  readonly set: (key: string, value: V) => void;
  readonly values: () => Iterable<V>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/internal/weak-registry.ts#L25)

Since v0.0.0