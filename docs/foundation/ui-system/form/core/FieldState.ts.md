---
title: FieldState.ts
nav_order: 3
parent: "@beep/form"
---

## FieldState.ts overview

Render-facing form field state models.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [ArrayFieldOperations (interface)](#arrayfieldoperations-interface)
  - [FieldState (interface)](#fieldstate-interface)
- [type-level](#type-level)
  - [FieldValue (type alias)](#fieldvalue-type-alias)
---

# models

## ArrayFieldOperations (interface)

Render-facing operations for array fields.

**Example**

```ts
import type { ArrayFieldOperations } from "@beep/form/core/FieldState"

const items: ArrayFieldOperations<string>["items"] = ["A"]
console.log(items.length) // 1
```

**Signature**

```ts
export interface ArrayFieldOperations<TItem> {
  readonly append: (value?: TItem) => void;
  readonly items: ReadonlyArray<TItem>;
  readonly move: {
    (from: number, to: number): void;
    (to: number): (from: number) => void;
  };
  readonly remove: (index: number) => void;
  readonly swap: {
    (indexA: number, indexB: number): void;
    (indexB: number): (indexA: number) => void;
  };
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/FieldState.ts#L76)

Since v0.0.0

## FieldState (interface)

Render-facing state and handlers for a single form field.

**Example**

```ts
import type { FieldState } from "@beep/form/core/FieldState"
import * as O from "effect/Option"

const field: FieldState<string> = {
  value: "Ada",
  error: O.none(),
  isDirty: false,
  isTouched: false,
  isValidating: false,
  onBlur: () => {},
  onChange: console.log,
  path: "name"
}
console.log(field.path) // "name"
```

**Signature**

```ts
export interface FieldState<E> {
  readonly error: O.Option<string>;
  readonly isDirty: boolean;
  readonly isTouched: boolean;
  readonly isValidating: boolean;
  readonly onBlur: () => void;
  readonly onChange: (value: E) => void;
  readonly path: string;
  readonly value: E;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/FieldState.ts#L51)

Since v0.0.0

# type-level

## FieldValue (type alias)

Encoded value type for either a schema or an already-materialized value.

**Example**

```ts
import type { FieldValue } from "@beep/form/core/FieldState"
import * as S from "effect/Schema"

const value: FieldValue<typeof S.String> = "Ada"
console.log(value) // "Ada"
```

**Signature**

```ts
type FieldValue<T> = T extends S.Top ? S.Codec.Encoded<T> : T
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/FieldState.ts#L25)

Since v0.0.0