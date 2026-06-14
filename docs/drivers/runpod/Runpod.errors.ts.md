---
title: Runpod.errors.ts
nav_order: 4
parent: "@beep/runpod"
---

## Runpod.errors.ts overview

Typed technical errors for the Runpod driver boundary.

Since v0.1.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [RunpodDocsError (class)](#runpoddocserror-class)
  - [RunpodDocsErrorReason](#runpoddocserrorreason)
  - [RunpodDocsErrorReason (type alias)](#runpoddocserrorreason-type-alias)
  - [RunpodError (class)](#runpoderror-class)
  - [RunpodErrorReason](#runpoderrorreason)
  - [RunpodErrorReason (type alias)](#runpoderrorreason-type-alias)
- [models](#models)
  - [RunpodDocsErrorOptions (class)](#runpoddocserroroptions-class)
  - [RunpodErrorOptions (class)](#runpoderroroptions-class)
  - [RunpodRawErrorOptions (class)](#runpodrawerroroptions-class)
---

# errors

## RunpodDocsError (class)

Technical failure raised by the Runpod documentation index driver boundary.

**Example**

```ts
import { RunpodDocsError } from "@beep/runpod"

const error = RunpodDocsError.fromReason("parse")
console.log(error.reason)
```

**Signature**

```ts
declare class RunpodDocsError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/runpod/src/Runpod.errors.ts#L204)

Since v0.1.0

## RunpodDocsErrorReason

Technical error reasons emitted by the Runpod documentation index driver.

**Example**

```ts
import { RunpodDocsErrorReason } from "@beep/runpod"

console.log(RunpodDocsErrorReason.ast)
```

**Signature**

```ts
declare const RunpodDocsErrorReason: AnnotatedSchema<LiteralKit<readonly ["config", "parse", "response decoding", "response status", "transport"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/runpod/src/Runpod.errors.ts#L74)

Since v0.1.0

## RunpodDocsErrorReason (type alias)

Type for `RunpodDocsErrorReason`.

**Example**

```ts
import type { RunpodDocsErrorReason } from "@beep/runpod"

const reason: RunpodDocsErrorReason = "parse"
console.log(reason)
```

**Signature**

```ts
type RunpodDocsErrorReason = typeof RunpodDocsErrorReason.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/runpod/src/Runpod.errors.ts#L100)

Since v0.1.0

## RunpodError (class)

Technical failure raised by the Runpod REST API driver boundary.

**Example**

```ts
import { RunpodError } from "@beep/runpod"

const error = RunpodError.config("missing RUNPOD_API_KEY")
console.log(error.reason)
```

**Signature**

```ts
declare class RunpodError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/runpod/src/Runpod.errors.ts#L118)

Since v0.1.0

## RunpodErrorReason

Technical error reasons emitted by the Runpod REST API driver.

**Example**

```ts
import { RunpodErrorReason } from "@beep/runpod"

console.log(RunpodErrorReason.ast)
```

**Signature**

```ts
declare const RunpodErrorReason: AnnotatedSchema<LiteralKit<readonly ["config", "request encoding", "response decoding", "response status", "transport"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/runpod/src/Runpod.errors.ts#L33)

Since v0.1.0

## RunpodErrorReason (type alias)

Type for `RunpodErrorReason`.

**Example**

```ts
import type { RunpodErrorReason } from "@beep/runpod"

const reason: RunpodErrorReason = "transport"
console.log(reason)
```

**Signature**

```ts
type RunpodErrorReason = typeof RunpodErrorReason.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/runpod/src/Runpod.errors.ts#L59)

Since v0.1.0

# models

## RunpodDocsErrorOptions (class)

Options used when constructing Runpod documentation driver errors.

**Example**

```ts
import { RunpodDocsErrorOptions } from "@beep/runpod"

const options = RunpodDocsErrorOptions.make({
  url: "https://docs.runpod.io/llms.txt"
})
console.log(options.url)
```

**Signature**

```ts
declare class RunpodDocsErrorOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/runpod/src/Runpod.errors.ts#L310)

Since v0.1.0

## RunpodErrorOptions (class)

Options used when constructing Runpod driver errors.

**Example**

```ts
import { RunpodErrorOptions } from "@beep/runpod"

const options = RunpodErrorOptions.make({ status: 401 })
console.log(options.status)
```

**Signature**

```ts
declare class RunpodErrorOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/runpod/src/Runpod.errors.ts#L253)

Since v0.1.0

## RunpodRawErrorOptions (class)

Options used when constructing Runpod driver errors for raw requests.

**Example**

```ts
import { RunpodRawErrorOptions } from "@beep/runpod"

const options = RunpodRawErrorOptions.make({
  method: "GET",
  path: "/health",
  reason: "transport"
})
console.log(options.path)
```

**Signature**

```ts
declare class RunpodRawErrorOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/runpod/src/Runpod.errors.ts#L281)

Since v0.1.0