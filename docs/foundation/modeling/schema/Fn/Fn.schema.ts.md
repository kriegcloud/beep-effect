---
title: Fn.schema.ts
nav_order: 95
parent: "@beep/schema"
---

## Fn.schema.ts overview

Callable schemas for runtime function values with schema-backed input and
output contracts.

The schema itself only validates that a value is a function. The attached
helper methods validate payloads, results, and expected effect failures at
invocation time using the provided input, output, and error schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [AnyFn (type alias)](#anyfn-type-alias)
  - [FnSchema (type alias)](#fnschema-type-alias)
  - [FnSchemaNoArg (interface)](#fnschemanoarg-interface)
  - [FnSchemaStatics (type alias)](#fnschemastatics-type-alias)
  - [FnSchemaUnary (interface)](#fnschemaunary-interface)
  - [FnType (type alias)](#fntype-type-alias)
- [validation](#validation)
  - [AnyFn](#anyfn)
  - [Fn](#fn)
  - [ThunkOf](#thunkof)
---

# models

## AnyFn (type alias)

Type for `AnyFn`.

**Signature**

```ts
type AnyFn = typeof AnyFn.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Fn/Fn.schema.ts#L470)

Since v0.0.0

## FnSchema (type alias)

Union schema type returned by `Fn`. Resolves to either
`FnSchemaNoArg` or `FnSchemaUnary` based on the input schema.

**Example**

```ts
import type { FnSchema } from "@beep/schema/Fn"
import * as S from "effect/Schema"

type FormatCount = FnSchema<typeof S.Finite, typeof S.String>
const schema = S.String satisfies FormatCount["outputSchema"]

console.log(schema.ast._tag)
```

**Signature**

```ts
type FnSchema<Input, Output, Error> = [
  Input["Type"],
] extends [never]
  ? FnSchemaNoArg<FnNoArgInput<Input>, Output, Error>
  : [Input["Type"]] extends [void]
    ? FnSchemaNoArg<FnNoArgInput<Input>, Output, Error>
    : FnSchemaUnary<Input, Output, Error>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Fn/Fn.schema.ts#L246)

Since v0.0.0

## FnSchemaNoArg (interface)

Schema surface for zero-argument (thunk-like) functions created by `Fn`.
Provides `implement`, `implementEffect`, and `implementSync` helpers.

**Example**

```ts
import type { FnSchemaNoArg } from "@beep/schema/Fn"
import * as S from "effect/Schema"

declare const schema: FnSchemaNoArg<typeof S.Never, typeof S.String, typeof S.Never>
const getValue = schema.implementSync(() => "ready")

console.log(getValue())
```

**Signature**

```ts
export interface FnSchemaNoArg<Input extends NoArgInputSchema, Output extends S.Top, Error extends S.Top>
  extends S.Codec<FnRuntime<Input, Output>, FnRuntime<Input, Output>> {
  readonly errorSchema: Error;
  readonly implement: (handler: () => Output["Type"]) => FnEffectWrapperNoArg<Output, SchemaIssue.Issue, never>;
  readonly implementEffect: FnImplementEffectNoArg<Output, Error>;
  readonly implementSync: (handler: () => Output["Type"]) => FnSyncWrapperNoArg<Output>;
  readonly inputSchema: Input;
  readonly outputSchema: Output;
  readonly Rebuild: this;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Fn/Fn.schema.ts#L185)

Since v0.0.0

## FnSchemaStatics (type alias)

Subset of the `FnSchema` surface exposing only the invocation helpers
and sub-schemas (`implement`, `implementEffect`, `implementSync`,
`inputSchema`, `outputSchema`, `errorSchema`).

**Example**

```ts
import type { FnSchemaStatics } from "@beep/schema/Fn"
import * as S from "effect/Schema"

declare const statics: FnSchemaStatics<typeof S.Finite, typeof S.String>
const format = statics.implementSync((input) => `${input}`)

console.log(format(1))
```

**Signature**

```ts
type FnSchemaStatics<Input, Output, Error> = Pick<
  FnSchema<Input, Output, Error>,
  "implement" | "implementEffect" | "implementSync" | "inputSchema" | "outputSchema" | "errorSchema"
>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Fn/Fn.schema.ts#L273)

Since v0.0.0

## FnSchemaUnary (interface)

Schema surface for unary functions created by `Fn`. Provides
`implement`, `implementEffect`, and `implementSync` helpers that decode
input and validate output at invocation time.

**Example**

```ts
import type { FnSchemaUnary } from "@beep/schema/Fn"
import * as S from "effect/Schema"

declare const schema: FnSchemaUnary<typeof S.Finite, typeof S.String, typeof S.Never>
const format = schema.implementSync((input) => `${input}`)

console.log(format(1))
```

**Signature**

```ts
export interface FnSchemaUnary<Input extends S.Top, Output extends S.Top, Error extends S.Top>
  extends S.Codec<FnRuntime<Input, Output>, FnRuntime<Input, Output>> {
  readonly errorSchema: Error;
  readonly implement: (
    handler: FnType<Input["Type"], Output["Type"]>
  ) => FnEffectWrapperUnary<Output, SchemaIssue.Issue, Input["DecodingServices"]>;
  readonly implementEffect: FnImplementEffectUnary<Input, Output, Error>;
  readonly implementSync: (handler: FnType<Input["Type"], Output["Type"]>) => FnSyncWrapperUnary<Output>;
  readonly inputSchema: Input;
  readonly outputSchema: Output;
  readonly Rebuild: this;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Fn/Fn.schema.ts#L215)

Since v0.0.0

## FnType (type alias)

Function type helper used by `Fn`. Inputs modeled with `never`,
`undefined`, or `void` produce thunk (zero-argument) call signatures;
all other input types produce unary call signatures.

**Example**

```ts
import type { FnType } from "@beep/schema/Fn"

const thunk = (() => "ready") satisfies FnType<never, string>
const unary = ((input: number) => `${input}`) satisfies FnType<number, string>

console.log(thunk(), unary(1))
```

**Signature**

```ts
type FnType<Input, Output> = [Input] extends [never]
  ? () => Output
  : [Input] extends [void]
    ? () => Output
    : (input: Input) => Output
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Fn/Fn.schema.ts#L130)

Since v0.0.0

# validation

## AnyFn

Schema for any runtime function value.

**Example**

```ts
import { AnyFn } from "@beep/schema"
import * as S from "effect/Schema"

const fn = S.decodeUnknownSync(AnyFn)(() => "hello")
console.log(fn)
```

**Signature**

```ts
declare const AnyFn: AnnotatedSchema<S.declare<Function, Function>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Fn/Fn.schema.ts#L458)

Since v0.0.0

## Fn

Creates a zero-argument function schema whose result is validated against the
provided output schema.

**Example**

```ts
import { Fn } from "@beep/schema"
import * as S from "effect/Schema"

const GetGreeting = Fn({ output: S.String })
const greeting = GetGreeting.implementSync(() => "hello")

console.log(greeting)
```

**Signature**

```ts
declare const Fn: { <Output extends S.Top, Error extends S.Top = S.Never>(options: { readonly output: Output; readonly error?: Error; }): FnSchema<typeof S.Never, Output, Error>; <Output extends S.Top, Error extends S.Top = S.Never>(options: { readonly input: typeof S.Undefined; readonly output: Output; readonly error?: Error; }): FnSchema<typeof S.Undefined, Output, Error>; <Output extends S.Top, Error extends S.Top = S.Never>(options: { readonly input: typeof S.Void; readonly output: Output; readonly error?: Error; }): FnSchema<typeof S.Void, Output, Error>; <Input extends S.Top, Output extends S.Top, Error extends S.Top = S.Never>(options: { readonly input: Input; readonly output: Output; readonly error?: Error; }): FnSchema<Input, Output, Error>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Fn/Fn.schema.ts#L657)

Since v0.0.0

## ThunkOf

Creates a thunk schema whose invocation output is validated against the
provided schema and whose `implementEffect` error channel can optionally be
validated against the provided error schema.

**Example**

```ts
import { ThunkOf } from "@beep/schema"
import * as S from "effect/Schema"

const GetGreeting = ThunkOf(S.String)
const greeting = GetGreeting.implementSync(() => "hello")

console.log(greeting)
```

**Signature**

```ts
declare const ThunkOf: { <Output extends S.Top>(output: Output): FnSchema<typeof S.Never, Output, typeof S.Never>; <Output extends S.Top, Error extends S.Top>(output: Output, error: Error): FnSchema<typeof S.Never, Output, Error>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Fn/Fn.schema.ts#L531)

Since v0.0.0