---
title: WinkObservability.ts
nav_order: 9
parent: "@beep/wink"
---

## WinkObservability.ts overview

Observability helpers for the wink NLP driver.

Since v0.0.0

---
## Exports Grouped by Category
- [observability](#observability)
  - [WinkToolObservationOptions (class)](#winktoolobservationoptions-class)
  - [WinkWorkflowObservationOptions (class)](#winkworkflowobservationoptions-class)
  - [makeWinkToolError](#makewinktoolerror)
  - [mapWinkToolError](#mapwinktoolerror)
  - [observeWinkTool](#observewinktool)
  - [observeWinkWorkflow](#observewinkworkflow)
  - [textLengthAttribute](#textlengthattribute)
  - [withWinkAttributes](#withwinkattributes)
---

# observability

## WinkToolObservationOptions (class)

Tool observation options used when mapping driver failures to AI tool errors.

**Example**

```ts
import { WinkToolObservationOptions } from "@beep/wink"

const options = WinkToolObservationOptions.make({
  operation: "query",
  toolName: "QueryCorpus"
})

console.log(options.toolName)
```

**Signature**

```ts
declare class WinkToolObservationOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkObservability.ts#L108)

Since v0.0.0

## WinkWorkflowObservationOptions (class)

Workflow observation options shared by wink services and tool handlers.

Use `attributes` for span/log detail and `metricAttributes` for
low-cardinality metric dimensions.

**Example**

```ts
import { Effect } from "effect"
import { observeWinkWorkflow } from "@beep/wink"

const observed = Effect.succeed("ok").pipe(
  observeWinkWorkflow({ name: "tokenize" })
)

console.log(observed)
```

**Signature**

```ts
declare class WinkWorkflowObservationOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkObservability.ts#L77)

Since v0.0.0

## makeWinkToolError

Convert an expected wink driver failure into an AI tool error payload.

**Example**

```ts
import { makeWinkToolError } from "@beep/wink"

const error = makeWinkToolError({
  operation: "query",
  toolName: "QueryCorpus"
}, new Error("Corpus not found"))

console.log(error.retryable)
```

**Signature**

```ts
declare const makeWinkToolError: (options: WinkToolObservationOptions, error: unknown) => typeof AiToolError.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkObservability.ts#L225)

Since v0.0.0

## mapWinkToolError

Map the error channel of a wink-backed tool effect to `AiToolError`.

**Example**

```ts
import { Effect } from "effect"
import { mapWinkToolError } from "@beep/wink"

const program = Effect.fail(new Error("bad corpus")).pipe(
  mapWinkToolError({ operation: "query", toolName: "QueryCorpus" })
)

console.log(program)
```

**Signature**

```ts
declare const mapWinkToolError: { <A, E, R>(effect: Effect.Effect<A, E, R>, options: WinkToolObservationOptions): Effect.Effect<A, typeof AiToolError.Type, R>; (options: WinkToolObservationOptions): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, typeof AiToolError.Type, R>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkObservability.ts#L271)

Since v0.0.0

## observeWinkTool

Observe a wink-backed AI tool and surface expected failures as structured
tool errors.

**Example**

```ts
import { Effect } from "effect"
import { observeWinkTool } from "@beep/wink"

const observed = Effect.succeed("ok").pipe(
  observeWinkTool({ operation: "tokenize", toolName: "Tokenize" })
)

console.log(observed)
```

**Signature**

```ts
declare const observeWinkTool: { <A, E, R>(effect: Effect.Effect<A, E, R>, options: WinkToolObservationOptions): Effect.Effect<A, typeof AiToolError.Type, R>; (options: WinkToolObservationOptions): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, typeof AiToolError.Type, R>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkObservability.ts#L310)

Since v0.0.0

## observeWinkWorkflow

Observe a wink workflow with standard metrics and span annotations.

**Example**

```ts
import { Effect } from "effect"
import { observeWinkWorkflow } from "@beep/wink"

const program = Effect.succeed(1).pipe(
  observeWinkWorkflow({ name: "vectorize" })
)

console.log(program)
```

**Signature**

```ts
declare const observeWinkWorkflow: { <A, E, R>(effect: Effect.Effect<A, E, R>, options: WinkWorkflowObservationOptions): Effect.Effect<A, E, R>; (options: WinkWorkflowObservationOptions): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkObservability.ts#L182)

Since v0.0.0

## textLengthAttribute

Build a span-safe text length annotation without recording raw text.

**Example**

```ts
import { textLengthAttribute } from "@beep/wink"

console.log(textLengthAttribute("query", "refund policy"))
```

**Signature**

```ts
declare const textLengthAttribute: (name: string, text: string) => Record<string, string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkObservability.ts#L133)

Since v0.0.0

## withWinkAttributes

Merge extra string attributes into a wink observability attribute record.

**Example**

```ts
import { withWinkAttributes } from "@beep/wink"

const attrs = withWinkAttributes(
  { tool_name: "Tokenize" },
  { operation: "tokenize" }
)

console.log(attrs.operation)
```

**Signature**

```ts
declare const withWinkAttributes: { (attributes: Record<string, string>, extra: Record<string, string>): Record<string, string>; (extra: Record<string, string>): (attributes: Record<string, string>) => Record<string, string>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkObservability.ts#L155)

Since v0.0.0