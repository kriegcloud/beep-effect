---
title: Observed.ts
nav_order: 10
parent: "@beep/observability"
---

## Observed.ts overview

Transport-safe schemas for serializing Effect errors, defects, causes, and exits.

These schemas annotate the core `S.Error`, `S.Defect`, `S.Cause`, and `S.Exit`
schemas with identity metadata for the observability package.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { ObservedError, ObservedCause } from "@beep/observability"

console.log(ObservedError)
console.log(ObservedCause)
```
```

Since v0.0.0

---
## Exports Grouped by Category
- [ObservedCause (type alias)](#observedcause-type-alias)
- [ObservedCauseReason](#observedcausereason)
- [ObservedCauseReason (type alias)](#observedcausereason-type-alias)
- [ObservedDefect](#observeddefect)
- [ObservedDefect (type alias)](#observeddefect-type-alias)
- [ObservedDefectWithStack](#observeddefectwithstack)
- [ObservedDefectWithStack (type alias)](#observeddefectwithstack-type-alias)
- [ObservedError](#observederror)
- [ObservedError (type alias)](#observederror-type-alias)
- [ObservedErrorWithStack](#observederrorwithstack)
- [ObservedErrorWithStack (type alias)](#observederrorwithstack-type-alias)
- [ObservedExit](#observedexit)
- [ObservedExit (type alias)](#observedexit-type-alias)
---

# models

## ObservedCause

A transport-safe schema for full Effect causes.

**Example**

```ts
```typescript
import { ObservedCause } from "@beep/observability"

console.log(ObservedCause)
```
```

**Signature**

```ts
declare const ObservedCause: AnnotatedSchema<S.Cause<AnnotatedSchema<S.Error>, AnnotatedSchema<S.Defect>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Observed.ts#L224)

Since v0.0.0

## ObservedCause (type alias)

Runtime type for `ObservedCause`.

**Example**

```ts
```typescript
import type { ObservedCause } from "@beep/observability"

const keepCause = (cause: ObservedCause) => cause
console.log(keepCause)
```
```

**Signature**

```ts
type ObservedCause = typeof ObservedCause.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Observed.ts#L244)

Since v0.0.0

## ObservedCauseReason

One serialized failure reason from a Cause.

**Example**

```ts
```typescript
import { ObservedCauseReason } from "@beep/observability"

console.log(ObservedCauseReason)
```
```

**Signature**

```ts
declare const ObservedCauseReason: AnnotatedSchema<S.CauseReason<AnnotatedSchema<S.Error>, AnnotatedSchema<S.Defect>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Observed.ts#L189)

Since v0.0.0

## ObservedCauseReason (type alias)

Runtime type for `ObservedCauseReason`.

**Example**

```ts
```typescript
import type { ObservedCauseReason } from "@beep/observability"

const keepReason = (reason: ObservedCauseReason) => reason
console.log(keepReason)
```
```

**Signature**

```ts
type ObservedCauseReason = typeof ObservedCauseReason.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Observed.ts#L209)

Since v0.0.0

## ObservedDefect

A transport-safe schema for defects.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { ObservedDefect } from "@beep/observability"

const decode = S.decodeUnknownSync(ObservedDefect)
const defect = decode("unexpected crash")
console.log(defect)
```
```

**Signature**

```ts
declare const ObservedDefect: AnnotatedSchema<S.Defect>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Observed.ts#L116)

Since v0.0.0

## ObservedDefect (type alias)

Runtime type for `ObservedDefect`.

**Example**

```ts
```typescript
import type { ObservedDefect } from "@beep/observability"

const keepDefect = (defect: ObservedDefect) => defect
console.log(keepDefect)
```
```

**Signature**

```ts
type ObservedDefect = typeof ObservedDefect.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Observed.ts#L136)

Since v0.0.0

## ObservedDefectWithStack

A transport-safe schema for defects that preserves stacks when possible.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { ObservedDefectWithStack } from "@beep/observability"

const decode = S.decodeUnknownSync(ObservedDefectWithStack)
const defect = decode(new Error("unexpected crash"))
console.log(defect)
```
```

**Signature**

```ts
declare const ObservedDefectWithStack: AnnotatedSchema<S.Defect>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Observed.ts#L154)

Since v0.0.0

## ObservedDefectWithStack (type alias)

Runtime type for `ObservedDefectWithStack`.

**Example**

```ts
```typescript
import type { ObservedDefectWithStack } from "@beep/observability"

const keepDefect = (defect: ObservedDefectWithStack) => defect
console.log(keepDefect)
```
```

**Signature**

```ts
type ObservedDefectWithStack = typeof ObservedDefectWithStack.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Observed.ts#L174)

Since v0.0.0

## ObservedError

A transport-safe schema for expected errors (message only, no stack).

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { ObservedError } from "@beep/observability"

const decode = S.decodeUnknownSync(ObservedError)
const err = decode({ message: "boom" })
console.log(err.message) // "boom"
```
```

**Signature**

```ts
declare const ObservedError: AnnotatedSchema<S.Error>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Observed.ts#L40)

Since v0.0.0

## ObservedError (type alias)

Runtime type for `ObservedError`.

**Example**

```ts
```typescript
import type { ObservedError } from "@beep/observability"

const readMessage = (error: ObservedError) => error.message
console.log(readMessage)
```
```

**Signature**

```ts
type ObservedError = typeof ObservedError.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Observed.ts#L60)

Since v0.0.0

## ObservedErrorWithStack

A transport-safe schema for expected errors that preserves stacks.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { ObservedErrorWithStack } from "@beep/observability"

const decode = S.decodeUnknownSync(ObservedErrorWithStack)
const err = decode(new Error("boom"))
console.log(err.message) // "boom"
```
```

**Signature**

```ts
declare const ObservedErrorWithStack: AnnotatedSchema<S.Error>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Observed.ts#L78)

Since v0.0.0

## ObservedErrorWithStack (type alias)

Runtime type for `ObservedErrorWithStack`.

**Example**

```ts
```typescript
import type { ObservedErrorWithStack } from "@beep/observability"

const readStack = (error: ObservedErrorWithStack) => error.stack
console.log(readStack)
```
```

**Signature**

```ts
type ObservedErrorWithStack = typeof ObservedErrorWithStack.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Observed.ts#L98)

Since v0.0.0

## ObservedExit

A transport-safe schema for exits carrying unknown success values.

**Example**

```ts
```typescript
import { ObservedExit } from "@beep/observability"

console.log(ObservedExit)
```
```

**Signature**

```ts
declare const ObservedExit: AnnotatedSchema<S.Exit<S.Unknown, AnnotatedSchema<S.Error>, AnnotatedSchema<S.Defect>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Observed.ts#L259)

Since v0.0.0

## ObservedExit (type alias)

Runtime type for `ObservedExit`.

**Example**

```ts
```typescript
import type { ObservedExit } from "@beep/observability"

const keepExit = (exit: ObservedExit) => exit
console.log(keepExit)
```
```

**Signature**

```ts
type ObservedExit = typeof ObservedExit.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Observed.ts#L279)

Since v0.0.0