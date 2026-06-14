---
title: Definition.ts
nav_order: 40
parent: "@beep/nlp"
---

## Definition.ts overview

Operations/Definition - structured definitions of composable NLP operations.

An `OperationDefinition` separates an operation's metadata (name,
description), its type contract (input/output schemas), and its behavior (an
Effect-returning implementation). Dependencies `R` and errors `E` are inferred
from the implementation, following the Toolkit pattern where handlers declare
their own requirements.

Effect v4 `@beep/nlp` implementation notes:
the definition is parameterized by the DECODED value types `A`/`B` (with the
schemas carried as `Schema.Schema<A>`/`Schema.Schema<B>` metadata) rather than
by `Schema.Schema<any, any, any>` schema types — this avoids `any` and keeps the
v4 schema variance (`DecodingServices`/optionality) out of the operation algebra.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [OperationDefinition (interface)](#operationdefinition-interface)
- [type-level](#type-level)
  - [OperationInput (type alias)](#operationinput-type-alias)
  - [OperationOutput (type alias)](#operationoutput-type-alias)
---

# models

## OperationDefinition (interface)

Structured definition of an NLP operation: name + description (metadata),
input/output schemas (type contract), and an Effect-returning implementation
whose `R`/`E` are inferred from its body.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import type { OperationDefinition } from "@beep/nlp/Operations/Definition"

const definition: OperationDefinition<string, number> = {
  name: "length",
  description: "Count Unicode code units in a string.",
  inputSchema: S.String,
  outputSchema: S.Finite,
  implementation: (input) => Effect.succeed(input.length)
}

Effect.runPromise(definition.implementation("Effect")).then(console.log) // 6
```

**Signature**

```ts
export interface OperationDefinition<A, B, R = never, E = never> {
  readonly description?: string;
  readonly implementation: (input: A) => Effect.Effect<B, E, R>;
  readonly inputSchema: S.Schema<A>;
  readonly metadata?: Record<string, unknown>;
  readonly name: string;
  readonly outputSchema: S.Schema<B>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Operations/Definition.ts#L48)

Since v0.0.0

# type-level

## OperationInput (type alias)

Extract the decoded input type from an `OperationDefinition`.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import type { OperationDefinition, OperationInput } from "@beep/nlp/Operations/Definition"

const definition: OperationDefinition<unknown, number> = {
  name: "length",
  inputSchema: S.String,
  outputSchema: S.Finite,
  implementation: (input) => Effect.succeed(String(input).length)
}

const input: OperationInput<typeof definition> = "Effect"
console.log(String(input).toUpperCase()) // "EFFECT"
```

**Signature**

```ts
type OperationInput<D> = D extends OperationDefinition<infer A, unknown, unknown, unknown> ? A : never
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Operations/Definition.ts#L80)

Since v0.0.0

## OperationOutput (type alias)

Extract the decoded output type from an `OperationDefinition`.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import type { OperationDefinition, OperationOutput } from "@beep/nlp/Operations/Definition"

const definition: OperationDefinition<unknown, number> = {
  name: "length",
  inputSchema: S.String,
  outputSchema: S.Finite,
  implementation: (input) => Effect.succeed(String(input).length)
}

const output: OperationOutput<typeof definition> = 6
console.log(output + 1) // 7
```

**Signature**

```ts
type OperationOutput<D> = D extends OperationDefinition<unknown, infer B, unknown, unknown> ? B : never
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Operations/Definition.ts#L106)

Since v0.0.0