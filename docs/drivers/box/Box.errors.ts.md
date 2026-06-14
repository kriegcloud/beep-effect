---
title: Box.errors.ts
nav_order: 3
parent: "@beep/box"
---

## Box.errors.ts overview

Typed technical errors for the Box driver boundary.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [BoxApiFailureContext (class)](#boxapifailurecontext-class)
  - [BoxError (class)](#boxerror-class)
  - [BoxErrorOptions (class)](#boxerroroptions-class)
- [models](#models)
  - [BoxErrorReason (type alias)](#boxerrorreason-type-alias)
- [schemas](#schemas)
  - [BoxErrorReason](#boxerrorreason)
---

# errors

## BoxApiFailureContext (class)

Sanitized context copied from Box API failures.

**Example**

```ts
import { BoxApiFailureContext } from "@beep/box"

const context = BoxApiFailureContext.make({ values: { reason: "invalid" } })
console.log(context.values)
```

**Signature**

```ts
declare class BoxApiFailureContext
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.errors.ts#L79)

Since v0.0.0

## BoxError (class)

Technical failure raised by the Box driver boundary.

**Example**

```ts
import { BoxError } from "@beep/box"

const error = BoxError.fromReason("transport", { method: "files.getFileById" })
console.log(error.reason)
```

**Signature**

```ts
declare class BoxError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.errors.ts#L143)

Since v0.0.0

## BoxErrorOptions (class)

Options used when constructing Box driver errors.

**Example**

```ts
import { BoxErrorOptions } from "@beep/box"

const options = BoxErrorOptions.make({ method: "files.getFileById" })
console.log(options.method)
```

**Signature**

```ts
declare class BoxErrorOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.errors.ts#L102)

Since v0.0.0

# models

## BoxErrorReason (type alias)

Type for `BoxErrorReason`.

**Example**

```ts
import type { BoxErrorReason } from "@beep/box"

const reason: BoxErrorReason = "transport"
console.log(reason)
```

**Signature**

```ts
type BoxErrorReason = typeof BoxErrorReason.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.errors.ts#L63)

Since v0.0.0

# schemas

## BoxErrorReason

Technical error reasons emitted by the Box driver.

**Example**

```ts
import { BoxErrorReason } from "@beep/box"

console.log(BoxErrorReason.is.transport("transport"))
```

**Signature**

```ts
declare const BoxErrorReason: AnnotatedSchema<LiteralKit<readonly ["config", "request encoding", "response decoding", "response status", "sdk shape", "sdk thrown", "stream", "transport"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/Box.errors.ts#L34)

Since v0.0.0