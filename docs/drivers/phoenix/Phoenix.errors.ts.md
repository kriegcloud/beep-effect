---
title: Phoenix.errors.ts
nav_order: 3
parent: "@beep/phoenix"
---

## Phoenix.errors.ts overview

Typed technical errors for the Phoenix driver boundary.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [PhoenixError (class)](#phoenixerror-class)
  - [PhoenixErrorOptions (class)](#phoenixerroroptions-class)
  - [PhoenixErrorReason](#phoenixerrorreason)
  - [PhoenixErrorReason (type alias)](#phoenixerrorreason-type-alias)
  - [PhoenixOperation](#phoenixoperation)
  - [PhoenixOperation (type alias)](#phoenixoperation-type-alias)
---

# errors

## PhoenixError (class)

Technical failure raised by the Phoenix driver boundary.

**Example**

```ts
import { PhoenixError } from "@beep/phoenix"

const error = PhoenixError.operation("doctor", "transport")
console.log(error.operation)
```

**Signature**

```ts
declare class PhoenixError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.errors.ts#L124)

Since v0.0.0

## PhoenixErrorOptions (class)

Options used when constructing Phoenix driver errors.

**Example**

```ts
import { PhoenixErrorOptions } from "@beep/phoenix"

const options = PhoenixErrorOptions.make({ cause: "network" })
console.log(options)
```

**Signature**

```ts
declare class PhoenixErrorOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.errors.ts#L101)

Since v0.0.0

## PhoenixErrorReason

Technical error reasons emitted by the Phoenix driver.

**Example**

```ts
import { PhoenixErrorReason } from "@beep/phoenix"

console.log(PhoenixErrorReason.Enum.transport)
```

**Signature**

```ts
declare const PhoenixErrorReason: AnnotatedSchema<LiteralKit<readonly ["config", "response decoding", "transport"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.errors.ts#L73)

Since v0.0.0

## PhoenixErrorReason (type alias)

Type for `PhoenixErrorReason`.

**Signature**

```ts
type PhoenixErrorReason = typeof PhoenixErrorReason.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.errors.ts#L85)

Since v0.0.0

## PhoenixOperation

Driver operation names surfaced in `PhoenixError` diagnostics.

**Example**

```ts
import { PhoenixOperation } from "@beep/phoenix"

console.log(PhoenixOperation.Enum.createDataset)
```

**Signature**

```ts
declare const PhoenixOperation: AnnotatedSchema<LiteralKit<readonly ["addAnnotation", "appendDatasetExamples", "createDataset", "createExperiment", "createPrompt", "doctor", "getDatasetExamples", "getDatasetInfo", "getExperimentInfo", "getPrompt", "init"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.errors.ts#L33)

Since v0.0.0

## PhoenixOperation (type alias)

Type for `PhoenixOperation`.

**Signature**

```ts
type PhoenixOperation = typeof PhoenixOperation.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.errors.ts#L57)

Since v0.0.0