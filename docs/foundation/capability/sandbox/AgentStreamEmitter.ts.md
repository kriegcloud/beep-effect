---
title: AgentStreamEmitter.ts
nav_order: 2
parent: "@beep/sandbox"
---

## AgentStreamEmitter.ts overview

Agent stream event emitter service.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [callbackAgentStreamEmitterLayer](#callbackagentstreamemitterlayer)
  - [noopAgentStreamEmitterLayer](#noopagentstreamemitterlayer)
- [models](#models)
  - [AgentStreamEvent](#agentstreamevent)
  - [AgentStreamEvent (type alias)](#agentstreamevent-type-alias)
  - [AgentStreamEvent (namespace)](#agentstreamevent-namespace)
    - [Encoded (type alias)](#encoded-type-alias)
- [services](#services)
  - [AgentStreamEmitter (class)](#agentstreamemitter-class)
  - [AgentStreamEmitterShape (interface)](#agentstreamemittershape-interface)
---

# layers

## callbackAgentStreamEmitterLayer

Build a layer that forwards each event to the provided callback.
The callback is invoked synchronously inside an `Effect.sync`; any error
thrown by the callback is caught and discarded so observability failures
cannot kill the run.

**Example**

```ts
import { callbackAgentStreamEmitterLayer } from "@beep/sandbox/AgentStreamEmitter"

console.log(callbackAgentStreamEmitterLayer)
```

**Signature**

```ts
declare const callbackAgentStreamEmitterLayer: (onEvent: (event: AgentStreamEvent) => void) => Layer.Layer<AgentStreamEmitter>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/AgentStreamEmitter.ts#L146)

Since v0.0.0

## noopAgentStreamEmitterLayer

Agent stream emitter layer that discards events.

**Example**

```ts
import { noopAgentStreamEmitterLayer } from "@beep/sandbox/AgentStreamEmitter"

console.log(noopAgentStreamEmitterLayer)
```

**Signature**

```ts
declare const noopAgentStreamEmitterLayer: Layer.Layer<AgentStreamEmitter, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/AgentStreamEmitter.ts#L124)

Since v0.0.0

# models

## AgentStreamEvent

A single event in the agent's output stream, surfaced to callers of `run()`
so they can forward it to their own observability system.

Emitted only in log-to-file mode when an `onAgentStreamEvent` callback is
provided via `logging`. See `run()`.

**Example**

```ts
import { AgentStreamEvent } from "@beep/sandbox/AgentStreamEmitter"

console.log(AgentStreamEvent)
```

**Signature**

```ts
declare const AgentStreamEvent: AnnotatedSchema<S.TaggedUnion<{ readonly Text: S.TaggedStruct<"Text", { readonly message: S.String; readonly iteration: S.Finite; readonly timestamp: S.DateTimeUtcFromDate; }>; readonly ToolCall: S.TaggedStruct<"ToolCall", { readonly name: S.String; readonly formattedArgs: S.String; readonly iteration: S.Finite; readonly timestamp: S.DateTimeUtcFromDate; }>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/AgentStreamEmitter.ts#L31)

Since v0.0.0

## AgentStreamEvent (type alias)

Runtime type for `AgentStreamEvent`.

**Signature**

```ts
type AgentStreamEvent = typeof AgentStreamEvent.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/AgentStreamEmitter.ts#L58)

Since v0.0.0

## AgentStreamEvent (namespace)

Encoded agent stream event helpers.

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/AgentStreamEmitter.ts#L66)

Since v0.0.0

### Encoded (type alias)

Encoded representation of `AgentStreamEvent`.

**Signature**

```ts
type Encoded = typeof AgentStreamEvent.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/AgentStreamEmitter.ts#L73)

Since v0.0.0

# services

## AgentStreamEmitter (class)

Agent stream emitter service.

**Example**

```ts
import { AgentStreamEmitter } from "@beep/sandbox/AgentStreamEmitter"

console.log(AgentStreamEmitter)
```

**Signature**

```ts
declare class AgentStreamEmitter
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/AgentStreamEmitter.ts#L107)

Since v0.0.0

## AgentStreamEmitterShape (interface)

Agent stream emitter service shape.

**Example**

```ts
import type { AgentStreamEmitterShape } from "@beep/sandbox/AgentStreamEmitter"

const value = {} as AgentStreamEmitterShape
console.log(value)
```

**Signature**

```ts
export interface AgentStreamEmitterShape {
  readonly emit: (event: AgentStreamEvent) => Effect.Effect<void>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/AgentStreamEmitter.ts#L90)

Since v0.0.0