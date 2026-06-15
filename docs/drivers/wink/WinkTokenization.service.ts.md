---
title: WinkTokenization.service.ts
nav_order: 11
parent: "@beep/wink"
---

## WinkTokenization.service.ts overview

Wink-backed tokenization layer.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [SentenceSpanFailure (class)](#sentencespanfailure-class)
- [layers](#layers)
  - [WinkTokenization](#winktokenization)
  - [WinkTokenizationLive](#winktokenizationlive)
---

# errors

## SentenceSpanFailure (class)

Typed failure used when wink sentence spans cannot be aligned to token indexes.

**Example**

```ts
import { SentenceSpanFailure } from "@beep/wink"

const failure = SentenceSpanFailure.make({
  reason: "Unable to derive a stable sentence token span.",
  sentenceIndex: 0,
  sentenceText: "Hello world."
})

console.log(failure.reason)
```

**Signature**

```ts
declare class SentenceSpanFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkTokenization.service.ts#L57)

Since v0.0.0

# layers

## WinkTokenization

Engine-dependent layer implementing the core tokenization service with wink.

**Example**

```ts
import { Effect, Layer } from "effect"
import { Tokenization } from "@beep/nlp/Core"
import { WinkEngineLive } from "@beep/wink"
import { WinkTokenization } from "@beep/wink"

const program = Effect.gen(function* () {
  const tokenization = yield* Tokenization
  return yield* tokenization.sentences("One sentence. Then another.")
})

Effect.runPromise(
  program.pipe(Effect.provide(WinkTokenization.pipe(Layer.provide(WinkEngineLive))))
).then((sentences) => console.log(sentences.length))
```

**Signature**

```ts
declare const WinkTokenization: Layer.Layer<Tokenization, never, WinkEngine>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkTokenization.service.ts#L374)

Since v0.0.0

## WinkTokenizationLive

Live tokenization layer with the wink engine already provided.

**Example**

```ts
import { Effect } from "effect"
import { Tokenization } from "@beep/nlp/Core"
import { WinkTokenizationLive } from "@beep/wink"

const program = Effect.gen(function* () {
  const tokenization = yield* Tokenization
  return yield* tokenization.tokenCount("Count these wink tokens.")
})

Effect.runPromise(program.pipe(Effect.provide(WinkTokenizationLive))).then(console.log)
```

**Signature**

```ts
declare const WinkTokenizationLive: Layer.Layer<Tokenization, WinkEngineError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkTokenization.service.ts#L396)

Since v0.0.0