---
title: Libpff.errors.ts
nav_order: 2
parent: "@beep/libpff"
---

## Libpff.errors.ts overview

Typed technical errors for the libpff driver boundary.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [makeLibpffError](#makelibpfferror)
- [errors](#errors)
  - [LibpffError (class)](#libpfferror-class)
  - [LibpffErrorReason](#libpfferrorreason)
  - [LibpffErrorReason (type alias)](#libpfferrorreason-type-alias)
---

# constructors

## makeLibpffError

Create a libpff technical error with a typed reason.

**Example**

```ts
import { makeLibpffError } from "@beep/libpff"

const error = makeLibpffError("engine-unavailable")
console.log(error.reason)
```

**Signature**

```ts
declare const makeLibpffError: (reason: LibpffErrorReason, options?: { readonly cause?: string; readonly exitCode?: NonNegativeInt; }) => LibpffError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/libpff/src/Libpff.errors.ts#L113)

Since v0.0.0

# errors

## LibpffError (class)

Technical failure raised inside the libpff driver boundary.

**Example**

```ts
import { LibpffError } from "@beep/libpff"

const error = LibpffError.fromReason("engine-unavailable")
console.log(error.reason)
```

**Signature**

```ts
declare class LibpffError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/libpff/src/Libpff.errors.ts#L71)

Since v0.0.0

## LibpffErrorReason

Technical libpff failure reasons.

**Example**

```ts
import { LibpffErrorReason } from "@beep/libpff"

console.log(LibpffErrorReason)
```

**Signature**

```ts
declare const LibpffErrorReason: AnnotatedSchema<LiteralKit<readonly ["config", "engine-unavailable", "output-limit", "process", "timeout"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/libpff/src/Libpff.errors.ts#L29)

Since v0.0.0

## LibpffErrorReason (type alias)

Type for `LibpffErrorReason`.

**Example**

```ts
import type { LibpffErrorReason } from "@beep/libpff"

const reason: LibpffErrorReason = "engine-unavailable"
console.log(reason)
```

**Signature**

```ts
type LibpffErrorReason = typeof LibpffErrorReason.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/libpff/src/Libpff.errors.ts#L55)

Since v0.0.0