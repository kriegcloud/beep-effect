---
title: AcpProtocol.service.ts
nav_order: 7
parent: "@beep/acp"
---

## AcpProtocol.service.ts overview

Patched ACP JSON-RPC transport primitives.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [makeAcpPatchedProtocol](#makeacppatchedprotocol)
- [models](#models)
  - [AcpIncomingNotification (type alias)](#acpincomingnotification-type-alias)
  - [AcpProtocolLogEvent (type alias)](#acpprotocollogevent-type-alias)
  - [AcpProtocolLoggingOptions (class)](#acpprotocolloggingoptions-class)
- [observability](#observability)
  - [AcpProtocolLogEvent](#acpprotocollogevent)
- [protocols](#protocols)
  - [AcpPatchedProtocol (interface)](#acppatchedprotocol-interface)
  - [AcpPatchedProtocolOptions (interface)](#acppatchedprotocoloptions-interface)
- [schemas](#schemas)
  - [AcpIncomingNotification](#acpincomingnotification)
---

# constructors

## makeAcpPatchedProtocol

Builds the patched ACP protocol over an Effect `Stdio` transport.

**Example**

```ts
import { Effect } from "effect"
import { Stdio } from "effect"
import * as HashSet from "effect/HashSet"
import { makeAcpPatchedProtocol } from "@beep/acp/protocol"

const program = Effect.flatMap(Effect.service(Stdio.Stdio), (stdio) =>
  makeAcpPatchedProtocol({
    stdio,
    serverRequestMethods: HashSet.empty()
  })
)
```

**Signature**

```ts
declare const makeAcpPatchedProtocol: (options: AcpPatchedProtocolOptions) => Effect.Effect<AcpPatchedProtocol, never, Scope.Scope>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpProtocol.service.ts#L304)

Since v0.0.0

# models

## AcpIncomingNotification (type alias)

Type for `AcpIncomingNotification`.

**Example**

```ts
import type { AcpIncomingNotification } from "@beep/acp/protocol"

const tagOf = (notification: AcpIncomingNotification) => notification._tag
console.log(tagOf)
```

**Signature**

```ts
type AcpIncomingNotification = typeof AcpIncomingNotification.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpProtocol.service.ts#L219)

Since v0.0.0

## AcpProtocolLogEvent (type alias)

Structured log event emitted by the ACP protocol adapter.

**Example**

```ts
import type { AcpProtocolLogEvent } from "@beep/acp/protocol"

const event: AcpProtocolLogEvent = {
  direction: "incoming",
  stage: "raw",
  payload: "{}"
}
console.log(event.stage)
```

**Signature**

```ts
type AcpProtocolLogEvent = typeof AcpProtocolLogEvent.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpProtocol.service.ts#L147)

Since v0.0.0

## AcpProtocolLoggingOptions (class)

Schema-backed ACP protocol logging flags.

**Example**

```ts
import { AcpProtocolLoggingOptions } from "@beep/acp/protocol"

const options = AcpProtocolLoggingOptions.make({ logIncoming: true })
console.log(options.logIncoming)
```

**Signature**

```ts
declare class AcpProtocolLoggingOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpProtocol.service.ts#L163)

Since v0.0.0

# observability

## AcpProtocolLogEvent

Structured log event emitted by the ACP protocol adapter.

**Example**

```ts
import { AcpProtocolLogEvent } from "@beep/acp/protocol"

console.log(AcpProtocolLogEvent.ast)
```

**Signature**

```ts
declare const AcpProtocolLogEvent: S.toTaggedUnion<"direction", readonly [S.Class<AcpProtocolLogEventMember<"incoming">, S.Struct<{ readonly direction: S.tag<"incoming">; readonly payload: S.Unknown; readonly stage: LiteralKit<readonly ["raw", "decoded", "decode_failed"], undefined>; }>, {}>, S.Class<AcpProtocolLogEventMember<"outgoing">, S.Struct<{ readonly direction: S.tag<"outgoing">; readonly payload: S.Unknown; readonly stage: LiteralKit<readonly ["raw", "decoded", "decode_failed"], undefined>; }>, {}>]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpProtocol.service.ts#L97)

Since v0.0.0

# protocols

## AcpPatchedProtocol (interface)

Runtime protocol handles used by ACP clients and agents.

**Example**

```ts
import type { AcpPatchedProtocol } from "@beep/acp/protocol"

const notificationsOf = (protocol: AcpPatchedProtocol) => protocol.incoming
console.log(notificationsOf)
```

**Signature**

```ts
export interface AcpPatchedProtocol {
  readonly clientProtocol: RpcClient.Protocol["Service"];
  readonly incoming: Stream.Stream<AcpIncomingNotification>;
  readonly notify: {
    (method: string, payload: unknown): Effect.Effect<void, AcpError.AcpError>;
    (method: string): (payload: unknown) => Effect.Effect<void, AcpError.AcpError>;
  };
  readonly request: {
    (method: string, payload: unknown): Effect.Effect<unknown, AcpError.AcpError>;
    (method: string): (payload: unknown) => Effect.Effect<unknown, AcpError.AcpError>;
  };
  readonly serverProtocol: RpcServer.Protocol["Service"];
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpProtocol.service.ts#L262)

Since v0.0.0

## AcpPatchedProtocolOptions (interface)

Options used to create the patched ACP protocol.

**Example**

```ts
import * as HashSet from "effect/HashSet"
import type { AcpPatchedProtocolOptions } from "@beep/acp/protocol"

const methods = HashSet.empty<string>()
const hasServerMethods = (options: Omit<AcpPatchedProtocolOptions, "stdio">) =>
  HashSet.size(options.serverRequestMethods) >= HashSet.size(methods)
console.log(hasServerMethods)
```

**Signature**

```ts
export interface AcpPatchedProtocolOptions extends AcpProtocolLoggingOptions {
  readonly logger?: (event: AcpProtocolLogEvent) => Effect.Effect<void>;
  readonly onExtRequest?: (method: string, params: unknown) => Effect.Effect<unknown, AcpError.AcpError>;
  readonly onNotification?: (notification: AcpIncomingNotification) => Effect.Effect<void, AcpError.AcpError>;
  readonly onTermination?: (error: AcpError.AcpError) => Effect.Effect<void>;
  readonly serverRequestMethods: HashSet.HashSet<string>;
  readonly stdio: Stdio.Stdio;
  readonly terminationError?: Effect.Effect<AcpError.AcpError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpProtocol.service.ts#L238)

Since v0.0.0

# schemas

## AcpIncomingNotification

Schema for notifications decoded from the ACP peer stream.

**Example**

```ts
import { AcpIncomingNotification } from "@beep/acp/protocol"

console.log(AcpIncomingNotification.ast)
```

**Signature**

```ts
declare const AcpIncomingNotification: AnnotatedSchema<S.TaggedUnion<{ readonly SessionUpdate: S.TaggedStruct<"SessionUpdate", { readonly method: S.Literal<"session/update">; readonly params: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly sessionId: S.String; readonly update: S.Union<readonly [S.Struct<{ readonly sessionUpdate: S.Literal<"user_message_chunk">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; readonly messageId: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"agent_message_chunk">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; readonly messageId: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"agent_thought_chunk">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; readonly messageId: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"tool_call">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.optionalKey<S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"content">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; }>, S.Struct<{ readonly type: S.Literal<"diff">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly newText: S.String; readonly oldText: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly path: S.String; }>, S.Struct<{ readonly type: S.Literal<"terminal">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly terminalId: S.String; }>]>>>>; readonly kind: S.optionalKey<S.Literals<readonly ["read", "edit", "delete", "move", "search", "execute", "think", "fetch", "switch_mode", "other"]>>; readonly locations: S.optionalKey<S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly line: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly path: S.String; }>>>>; readonly rawInput: S.optionalKey<S.Unknown>; readonly rawOutput: S.optionalKey<S.Unknown>; readonly status: S.optionalKey<S.Literals<readonly ["pending", "in_progress", "completed", "failed"]>>; readonly title: S.String; readonly toolCallId: S.String; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"tool_call_update">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"content">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.Union<readonly [S.Struct<{ readonly type: S.Literal<"text">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly text: S.String; }>, S.Struct<{ readonly type: S.Literal<"image">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; readonly uri: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly type: S.Literal<"audio">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly data: S.String; readonly mimeType: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource_link">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly size: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>, S.Struct<{ readonly type: S.Literal<"resource">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly annotations: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly audience: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Literals<readonly ["assistant", "user"]>>>, S.Null]>>; readonly lastModified: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly priority: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; }>>, S.Null]>>; readonly resource: AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly text: S.String; readonly uri: S.String; }>, S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly blob: S.String; readonly mimeType: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly uri: S.String; }>]>>; }>]>; }>, S.Struct<{ readonly type: S.Literal<"diff">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly newText: S.String; readonly oldText: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly path: S.String; }>, S.Struct<{ readonly type: S.Literal<"terminal">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly terminalId: S.String; }>]>>>, S.Null]>>; readonly kind: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Literals<readonly ["read", "edit", "delete", "move", "search", "execute", "think", "fetch", "switch_mode", "other"]>>, S.Null]>>; readonly locations: S.optionalKey<S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly line: S.optionalKey<S.Union<readonly [S.Finite, S.Null]>>; readonly path: S.String; }>>>, S.Null]>>; readonly rawInput: S.optionalKey<S.Unknown>; readonly rawOutput: S.optionalKey<S.Unknown>; readonly status: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Literals<readonly ["pending", "in_progress", "completed", "failed"]>>, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly toolCallId: S.String; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"plan">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly entries: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly content: S.String; readonly priority: S.Literals<readonly ["high", "medium", "low"]>; readonly status: S.Literals<readonly ["pending", "in_progress", "completed"]>; }>>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"available_commands_update">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly availableCommands: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.String; readonly input: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly hint: S.String; }>]>>, S.Null]>>; readonly name: S.String; }>>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"current_mode_update">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly currentModeId: S.String; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"config_option_update">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly configOptions: S.$Array<AnnotatedSchema<S.Union<readonly [S.Struct<{ readonly type: S.Literal<"select">; readonly currentValue: S.String; readonly options: S.Union<readonly [S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>, S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly group: S.String; readonly name: S.String; readonly options: S.$Array<AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly name: S.String; readonly value: S.String; }>>>; }>>>]>; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>, S.Struct<{ readonly type: S.Literal<"boolean">; readonly currentValue: S.Boolean; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly category: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<"mode">, S.Literal<"model">, S.Literal<"thought_level">, S.String]>>, S.Null]>>; readonly description: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly id: S.String; readonly name: S.String; }>]>>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"session_info_update">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly title: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; readonly updatedAt: S.optionalKey<S.Union<readonly [S.String, S.Null]>>; }>, S.Struct<{ readonly sessionUpdate: S.Literal<"usage_update">; readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly cost: S.optionalKey<S.Union<readonly [AnnotatedSchema<S.Struct<{ readonly amount: S.Finite; readonly currency: S.String; }>>, S.Null]>>; readonly size: S.Finite; readonly used: S.Finite; }>]>; }>>; }>; readonly ElicitationComplete: S.TaggedStruct<"ElicitationComplete", { readonly method: S.Literal<"session/elicitation/complete">; readonly params: AnnotatedSchema<S.Struct<{ readonly _meta: S.optionalKey<S.Union<readonly [S.$Record<S.String, S.Unknown>, S.Null]>>; readonly elicitationId: S.String; }>>; }>; readonly ExtNotification: S.TaggedStruct<"ExtNotification", { readonly method: S.String; readonly params: S.Unknown; }>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpProtocol.service.ts#L186)

Since v0.0.0