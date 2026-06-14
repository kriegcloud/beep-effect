---
title: index.ts
nav_order: 41
parent: "@beep/nlp"
---

## index.ts overview

Composable operation builders and the categorical combinators (map/flatMap/
product/zipWith/traverse/aggregate).

**Example**

```ts
```typescript
import { Composable } from "@beep/nlp/Operations"

console.log(typeof Composable.makeOperation)
```
```

Since v0.0.0

---
## Exports Grouped by Category
- [Definition (namespace export)](#definition-namespace-export)
---

# use-cases

## Composable (namespace export)

Re-exports all named exports from the "./Composable.ts" module as `Composable`.

**Example**

```ts
```typescript
import { Composable } from "@beep/nlp/Operations"

console.log(typeof Composable.makeOperation)
```
```

**Signature**

```ts
export * as Composable from "./Composable.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Operations/index.ts#L29)

Since v0.0.0

## Definition (namespace export)

Re-exports all named exports from the "./Definition.ts" module as `Definition`.

**Example**

```ts
```typescript
import type { Definition } from "@beep/nlp/Operations"

type Op = Definition.OperationDefinition<never, never>
```
```

**Signature**

```ts
export * as Definition from "./Definition.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Operations/index.ts#L43)

Since v0.0.0