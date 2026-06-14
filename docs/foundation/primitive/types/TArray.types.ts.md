---
title: TArray.types.ts
nav_order: 2
parent: "@beep/types"
---

## TArray.types.ts overview

Extracts the element type from a tuple or array type.

**Example**

```ts
```typescript
import type { TArray } from "@beep/types"

type NumberElement = TArray.Elem<readonly [1, 2, 3]>
// 1 | 2 | 3

type StringElement = TArray.Elem<string[]>
// string

const elements: readonly [NumberElement, StringElement] = [1, "name"]
console.log(elements)
```
```

Since v0.0.0

---
## Exports Grouped by Category

---

# utilities

## Elem (type alias)

Extracts the element type from a tuple or array type.

**Example**

```ts
```typescript
import type { TArray } from "@beep/types"

type NumberElement = TArray.Elem<readonly [1, 2, 3]>
// 1 | 2 | 3

type StringElement = TArray.Elem<string[]>
// string

const elements: readonly [NumberElement, StringElement] = [1, "name"]
console.log(elements)
```
```

**Signature**

```ts
type Elem<T> = T extends readonly (infer U)[] ? U : never
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/types/src/TArray.types.ts#L29)

Since v0.0.0