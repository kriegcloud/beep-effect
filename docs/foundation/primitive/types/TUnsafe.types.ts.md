---
title: TUnsafe.types.ts
nav_order: 4
parent: "@beep/types"
---

## TUnsafe.types.ts overview

Repository-wide escape hatch for the `any` type.

All code that requires `any` should import this alias so unsafe usage
remains visible, auditable, and centralized.

**Example**

```ts
```typescript
import type { TUnsafe } from "@beep/types"

const log = (value: TUnsafe.Any) => console.log(value)
log("hello")
```
```

Since v0.0.0
biome-ignore lint/suspicious/noExplicitAny: Let this be the only `any` in the repository.

---
## Exports Grouped by Category

---

# utilities

## Any (type alias)

Repository-wide escape hatch for the `any` type.

All code that requires `any` should import this alias so unsafe usage
remains visible, auditable, and centralized.

**Example**

```ts
```typescript
import type { TUnsafe } from "@beep/types"

const log = (value: TUnsafe.Any) => console.log(value)
log("hello")
```
```

**Signature**

```ts
type Any = any
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/types/src/TUnsafe.types.ts#L26)

Since v0.0.0
biome-ignore lint/suspicious/noExplicitAny: Let this be the only `any` in the repository.