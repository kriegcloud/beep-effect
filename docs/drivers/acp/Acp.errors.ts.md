---
title: Acp.errors.ts
nav_order: 3
parent: "@beep/acp"
---

## Acp.errors.ts overview

Typed technical errors for the ACP driver boundary.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [AcpError](#acperror)
  - [AcpError (type alias)](#acperror-type-alias)
  - [AcpProcessExitedError (class)](#acpprocessexitederror-class)
  - [AcpProtocolParseError (class)](#acpprotocolparseerror-class)
  - [AcpRequestError (class)](#acprequesterror-class)
    - [fromProtocolError (static method)](#fromprotocolerror-static-method)
    - [parseError (static method)](#parseerror-static-method)
    - [invalidRequest (static method)](#invalidrequest-static-method)
    - [methodNotFound (static method)](#methodnotfound-static-method)
    - [invalidParams (static method)](#invalidparams-static-method)
    - [internalError (static method)](#internalerror-static-method)
    - [authRequired (static method)](#authrequired-static-method)
    - [resourceNotFound (static method)](#resourcenotfound-static-method)
    - [toProtocolError (method)](#toprotocolerror-method)
  - [AcpSpawnError (class)](#acpspawnerror-class)
  - [AcpTransportError (class)](#acptransporterror-class)
---

# errors

## AcpError

Union of typed technical failures emitted by the ACP driver.

**Example**

```ts
import { AcpError, AcpRequestError } from "@beep/acp/errors"
import * as S from "effect/Schema"

const isAcpError = S.is(AcpError)
console.log(isAcpError(AcpRequestError.methodNotFound("x/test")))
```

**Signature**

```ts
declare const AcpError: S.toTaggedUnion<"_tag", readonly [typeof AcpRequestError, typeof AcpSpawnError, typeof AcpProcessExitedError, typeof AcpProtocolParseError, typeof AcpTransportError]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/Acp.errors.ts#L405)

Since v0.0.0

## AcpError (type alias)

Type for `AcpError`.

**Example**

```ts
import type { AcpError } from "@beep/acp/errors"

const inspect = (error: AcpError) => error._tag
console.log(inspect)
```

**Signature**

```ts
type AcpError = typeof AcpError.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/Acp.errors.ts#L427)

Since v0.0.0

## AcpProcessExitedError (class)

Failure raised when an ACP process exits before the protocol completes.

**Example**

```ts
import { AcpProcessExitedError } from "@beep/acp/errors"

const error = AcpProcessExitedError.make({ code: 1 })
console.log(error.message)
```

**Signature**

```ts
declare class AcpProcessExitedError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/Acp.errors.ts#L63)

Since v0.0.0

## AcpProtocolParseError (class)

Failure raised when ACP wire data cannot be encoded or decoded.

**Example**

```ts
import { AcpProtocolParseError } from "@beep/acp/errors"

const error = AcpProtocolParseError.make({ detail: "bad json" })
console.log(error.message)
```

**Signature**

```ts
declare class AcpProtocolParseError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/Acp.errors.ts#L92)

Since v0.0.0

## AcpRequestError (class)

JSON-RPC request failure returned by an ACP peer.

**Example**

```ts
import { AcpRequestError } from "@beep/acp/errors"

const error = AcpRequestError.methodNotFound("x/missing")
console.log(error.code)
```

**Signature**

```ts
declare class AcpRequestError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/Acp.errors.ts#L158)

Since v0.0.0

### fromProtocolError (static method)

Convert an ACP protocol error payload into a typed driver error.

**Example**

```ts
import { AcpRequestError } from "@beep/acp/errors"

const error = AcpRequestError.fromProtocolError({
  code: -32601,
  message: "Method not found"
})
console.log(error.message)
```

**Signature**

```ts
declare const fromProtocolError: (error: AcpSchema.Error) => AcpRequestError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/Acp.errors.ts#L190)

Since v0.0.0

### parseError (static method)

Create a JSON-RPC parse error.

**Example**

```ts
import { AcpRequestError } from "@beep/acp/errors"

const error = AcpRequestError.parseError()
console.log(error.code)
```

**Signature**

```ts
declare const parseError: (message?: string, data?: unknown) => AcpRequestError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/Acp.errors.ts#L214)

Since v0.0.0

### invalidRequest (static method)

Create a JSON-RPC invalid request error.

**Example**

```ts
import { AcpRequestError } from "@beep/acp/errors"

const error = AcpRequestError.invalidRequest()
console.log(error.code)
```

**Signature**

```ts
declare const invalidRequest: (message?: string, data?: unknown) => AcpRequestError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/Acp.errors.ts#L238)

Since v0.0.0

### methodNotFound (static method)

Create a JSON-RPC method-not-found error.

**Example**

```ts
import { AcpRequestError } from "@beep/acp/errors"

const error = AcpRequestError.methodNotFound("x/test")
console.log(error.message)
```

**Signature**

```ts
declare const methodNotFound: (method: string) => AcpRequestError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/Acp.errors.ts#L262)

Since v0.0.0

### invalidParams (static method)

Create a JSON-RPC invalid params error.

**Example**

```ts
import { AcpRequestError } from "@beep/acp/errors"

const error = AcpRequestError.invalidParams("Invalid payload")
console.log(error.code)
```

**Signature**

```ts
declare const invalidParams: (message?: string, data?: unknown) => AcpRequestError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/Acp.errors.ts#L283)

Since v0.0.0

### internalError (static method)

Create a JSON-RPC internal error.

**Example**

```ts
import { AcpRequestError } from "@beep/acp/errors"

const error = AcpRequestError.internalError()
console.log(error.code)
```

**Signature**

```ts
declare const internalError: (message?: string, data?: unknown) => AcpRequestError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/Acp.errors.ts#L307)

Since v0.0.0

### authRequired (static method)

Create an ACP authentication-required request error.

**Example**

```ts
import { AcpRequestError } from "@beep/acp/errors"

const error = AcpRequestError.authRequired()
console.log(error.code)
```

**Signature**

```ts
declare const authRequired: (message?: string, data?: unknown) => AcpRequestError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/Acp.errors.ts#L331)

Since v0.0.0

### resourceNotFound (static method)

Create an ACP resource-not-found request error.

**Example**

```ts
import { AcpRequestError } from "@beep/acp/errors"

const error = AcpRequestError.resourceNotFound()
console.log(error.code)
```

**Signature**

```ts
declare const resourceNotFound: (message?: string, data?: unknown) => AcpRequestError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/Acp.errors.ts#L355)

Since v0.0.0

### toProtocolError (method)

Convert this driver error to the ACP protocol error payload.

**Example**

```ts
import { AcpRequestError } from "@beep/acp/errors"

const payload = AcpRequestError.methodNotFound("x/test").toProtocolError()
console.log(payload.message)
```

**Signature**

```ts
declare const toProtocolError: () => { readonly code: number; readonly message: string; readonly data?: unknown; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/Acp.errors.ts#L379)

Since v0.0.0

## AcpSpawnError (class)

Failure raised when an ACP child process cannot be spawned.

**Example**

```ts
import { AcpSpawnError } from "@beep/acp/errors"

const error = AcpSpawnError.make({ command: "acp-agent" })
console.log(error.message)
```

**Signature**

```ts
declare class AcpSpawnError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/Acp.errors.ts#L32)

Since v0.0.0

## AcpTransportError (class)

Failure raised by the ACP transport boundary.

**Example**

```ts
import { AcpTransportError } from "@beep/acp/errors"

const error = AcpTransportError.make({ detail: "stream closed" })
console.log(error.detail)
```

**Signature**

```ts
declare class AcpTransportError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/Acp.errors.ts#L133)

Since v0.0.0