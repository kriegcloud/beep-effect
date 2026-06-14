---
title: XAi.errors.ts
nav_order: 3
parent: "@beep/xai"
---

## XAi.errors.ts overview

Typed technical errors for the xAI driver boundary.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [XAiError (class)](#xaierror-class)
  - [XAiErrorOptions (class)](#xaierroroptions-class)
  - [XAiErrorReason](#xaierrorreason)
  - [XAiErrorReason (type alias)](#xaierrorreason-type-alias)
---

# errors

## XAiError (class)

Technical failure raised by the xAI driver boundary.

**Example**

```ts
import { XAiError, XAI_ENDPOINTS } from "@beep/xai"

const error = XAiError.fromDescriptor(XAI_ENDPOINTS[0], "transport")
console.log(error.reason)
```

**Signature**

```ts
declare class XAiError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.errors.ts#L83)

Since v0.0.0

## XAiErrorOptions (class)

Options used when constructing xAI driver errors.

**Example**

```ts
import { XAiErrorOptions } from "@beep/xai"

const options = XAiErrorOptions.make({ status: 500 })
console.log(options)
```

**Signature**

```ts
declare class XAiErrorOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.errors.ts#L207)

Since v0.0.0

## XAiErrorReason

Technical error reasons emitted by the xAI driver.

**Example**

```ts
import type { XAiErrorReason } from "@beep/xai"

const reason: XAiErrorReason = "response status"
console.log(reason)
```

**Signature**

```ts
declare const XAiErrorReason: AnnotatedSchema<LiteralKit<readonly ["config", "multipart encoding", "request encoding", "response decoding", "response status", "sse decoding", "transport", "websocket"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.errors.ts#L36)

Since v0.0.0

## XAiErrorReason (type alias)

Type for `XAiErrorReason`.

**Example**

```ts
import type { XAiErrorReason } from "@beep/xai"

const reason: XAiErrorReason = "transport"
console.log(reason)
```

**Signature**

```ts
type XAiErrorReason = typeof XAiErrorReason.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.errors.ts#L65)

Since v0.0.0