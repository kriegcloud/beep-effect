---
title: react-invariant.ts
nav_order: 11
parent: "@beep/ui"
---

## react-invariant.ts overview

React invariant helpers for UI composition boundaries.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [ReactContextInvariantError (class)](#reactcontextinvarianterror-class)
- [models](#models)
  - [ReactContextInvariantOptions (class)](#reactcontextinvariantoptions-class)
- [utilities](#utilities)
  - [requireReactContext](#requirereactcontext)
---

# errors

## ReactContextInvariantError (class)

Error thrown when a React context hook is used outside its provider.

**Example**

```ts
import { ReactContextInvariantError } from "@beep/ui/lib/react-invariant"

const error = ReactContextInvariantError.make({ message: "missing provider" })
console.log(error.message)
```

**Signature**

```ts
declare class ReactContextInvariantError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/lib/react-invariant.ts#L53)

Since v0.0.0

# models

## ReactContextInvariantOptions (class)

React context invariant options class.

**Example**

```ts
import { ReactContextInvariantOptions } from "@beep/ui/lib/react-invariant"

console.log(ReactContextInvariantOptions)
```

**Signature**

```ts
declare class ReactContextInvariantOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/lib/react-invariant.ts#L28)

Since v0.0.0

# utilities

## requireReactContext

Require that a React context hook has been called under its provider.

**Example**

```ts
import { requireReactContext } from "@beep/ui/lib/react-invariant"

const value = requireReactContext("ok", { message: "missing provider" })
console.log(value) // "ok"
```

**Signature**

```ts
declare const requireReactContext: { <Value>(context: Value | null, options: ReactContextInvariantOptions): Value; (options: ReactContextInvariantOptions): <Value>(context: Value | null) => Value; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/lib/react-invariant.ts#L79)

Since v0.0.0