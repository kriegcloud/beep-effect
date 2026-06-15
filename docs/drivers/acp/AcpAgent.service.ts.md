---
title: AcpAgent.service.ts
nav_order: 5
parent: "@beep/acp"
---

## AcpAgent.service.ts overview

ACP agent service and agent-side layer constructors.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [make](#make)
- [layers](#layers)
  - [layer](#layer)
  - [layerStdio](#layerstdio)
- [models](#models)
  - [AcpAgentOptions (interface)](#acpagentoptions-interface)
- [services](#services)
  - [AcpAgent (class)](#acpagent-class)
  - [AcpAgentShape (interface)](#acpagentshape-interface)
---

# constructors

## make

Constructs an ACP agent from an Effect `Stdio` transport.

**Example**

```ts
import type * as Stdio from "effect/Stdio"
import { make } from "@beep/acp/agent"

const fromStdio = (stdio: Stdio.Stdio) => make(stdio)
console.log(fromStdio)
```

**Signature**

```ts
declare const make: (stdio: Stdio.Stdio, options?: AcpAgentOptions | undefined) => Effect.Effect<AcpAgentShape, never, Scope.Scope>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpAgent.service.ts#L286)

Since v0.0.0

# layers

## layer

Constructs a layer for an ACP agent over the provided transport.

**Example**

```ts
import type * as Stdio from "effect/Stdio"
import { layer } from "@beep/acp/agent"

const fromStdio = (stdio: Stdio.Stdio) => layer(stdio)
console.log(fromStdio)
```

**Signature**

```ts
declare const layer: (stdio: Stdio.Stdio, options?: AcpAgentOptions) => Layer.Layer<AcpAgent>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpAgent.service.ts#L611)

Since v0.0.0

## layerStdio

Constructs a layer that reads its transport from the `Stdio` service.

**Example**

```ts
import { layerStdio } from "@beep/acp/agent"

const live = layerStdio()
```

**Signature**

```ts
declare const layerStdio: (options?: AcpAgentOptions) => Layer.Layer<AcpAgent, never, Stdio.Stdio>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpAgent.service.ts#L627)

Since v0.0.0

# models

## AcpAgentOptions (interface)

Options for constructing an ACP agent service.

**Example**

```ts
import type { AcpAgentOptions } from "@beep/acp/agent"

const options: AcpAgentOptions = { logIncoming: true }
```

**Signature**

```ts
export interface AcpAgentOptions extends AcpProtocol.AcpProtocolLoggingOptions {
  readonly logger?: (event: AcpProtocol.AcpProtocolLogEvent) => Effect.Effect<void>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpAgent.service.ts#L45)

Since v0.0.0

# services

## AcpAgent (class)

Context service tag for an ACP agent.

**Example**

```ts
import { Effect } from "effect"
import { AcpAgent } from "@beep/acp/agent"

const program = Effect.service(AcpAgent)
```

**Signature**

```ts
declare class AcpAgent
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpAgent.service.ts#L234)

Since v0.0.0

## AcpAgentShape (interface)

Service shape implemented by the ACP agent driver.

**Example**

```ts
import type { AcpAgentShape } from "@beep/acp/agent"

const notificationsOf = (agent: AcpAgentShape) => agent.raw.notifications
console.log(notificationsOf)
```

**Signature**

```ts
export interface AcpAgentShape {
  readonly client: {
    /**
     * Requests client permission for an operation.
     * @see https://agentclientprotocol.com/protocol/schema#session/request_permission
     */
    readonly requestPermission: (
      payload: AcpSchema.RequestPermissionRequest
    ) => Effect.Effect<AcpSchema.RequestPermissionResponse, AcpError.AcpError>;
    /**
     * Requests structured user input from the client.
     * @see https://agentclientprotocol.com/protocol/schema#session/elicitation
     */
    readonly elicit: (
      payload: AcpSchema.ElicitationRequest
    ) => Effect.Effect<AcpSchema.ElicitationResponse, AcpError.AcpError>;
    /**
     * Requests file contents from the client.
     * @see https://agentclientprotocol.com/protocol/schema#fs/read_text_file
     */
    readonly readTextFile: (
      payload: AcpSchema.ReadTextFileRequest
    ) => Effect.Effect<AcpSchema.ReadTextFileResponse, AcpError.AcpError>;
    /**
     * Writes a text file through the client.
     * @see https://agentclientprotocol.com/protocol/schema#fs/write_text_file
     */
    readonly writeTextFile: (
      payload: AcpSchema.WriteTextFileRequest
    ) => Effect.Effect<AcpSchema.WriteTextFileResponse, AcpError.AcpError>;
    /**
     * Creates a terminal on the client side.
     * @see https://agentclientprotocol.com/protocol/schema#terminal/create
     */
    readonly createTerminal: (
      payload: AcpSchema.CreateTerminalRequest
    ) => Effect.Effect<AcpTerminal.AcpTerminal, AcpError.AcpError>;
    /**
     * Sends a `session/update` notification to the client.
     * @see https://agentclientprotocol.com/protocol/schema#session/update
     */
    readonly sessionUpdate: (payload: AcpSchema.SessionNotification) => Effect.Effect<void, AcpError.AcpError>;
    /**
     * Sends a `session/elicitation/complete` notification to the client.
     * @see https://agentclientprotocol.com/protocol/schema#session/elicitation/complete
     */
    readonly elicitationComplete: (
      payload: AcpSchema.ElicitationCompleteNotification
    ) => Effect.Effect<void, AcpError.AcpError>;
    /**
     * Sends an ACP extension request to the client.
     * @see https://agentclientprotocol.com/protocol/extensibility
     */
    readonly extRequest: (method: string, payload: unknown) => Effect.Effect<unknown, AcpError.AcpError>;
    /**
     * Sends an ACP extension notification to the client.
     * @see https://agentclientprotocol.com/protocol/extensibility
     */
    readonly extNotification: (method: string, payload: unknown) => Effect.Effect<void, AcpError.AcpError>;
  };
  /**
   * Registers a handler for `authenticate`.
   * @see https://agentclientprotocol.com/protocol/schema#authenticate
   */
  readonly handleAuthenticate: (
    handler: (
      request: AcpSchema.AuthenticateRequest
    ) => Effect.Effect<AcpSchema.AuthenticateResponse, AcpError.AcpError>
  ) => Effect.Effect<void>;
  /**
   * Registers a handler for `session/cancel`.
   * @see https://agentclientprotocol.com/protocol/schema#session/cancel
   */
  readonly handleCancel: (
    handler: (notification: AcpSchema.CancelNotification) => Effect.Effect<void, AcpError.AcpError>
  ) => Effect.Effect<void>;
  readonly handleCloseSession: (
    handler: (
      request: AcpSchema.CloseSessionRequest
    ) => Effect.Effect<AcpSchema.CloseSessionResponse, AcpError.AcpError>
  ) => Effect.Effect<void>;
  readonly handleCreateSession: (
    handler: (request: AcpSchema.NewSessionRequest) => Effect.Effect<AcpSchema.NewSessionResponse, AcpError.AcpError>
  ) => Effect.Effect<void>;
  readonly handleExtNotification: <A, I>(
    method: string,
    payload: S.Codec<A, I>,
    handler: (payload: A) => Effect.Effect<void, AcpError.AcpError>
  ) => Effect.Effect<void>;
  readonly handleExtRequest: <A, I>(
    method: string,
    payload: S.Codec<A, I>,
    handler: (payload: A) => Effect.Effect<unknown, AcpError.AcpError>
  ) => Effect.Effect<void>;
  readonly handleForkSession: (
    handler: (request: AcpSchema.ForkSessionRequest) => Effect.Effect<AcpSchema.ForkSessionResponse, AcpError.AcpError>
  ) => Effect.Effect<void>;
  /**
   * Registers a handler for `initialize`.
   * @see https://agentclientprotocol.com/protocol/schema#initialize
   */
  readonly handleInitialize: (
    handler: (request: AcpSchema.InitializeRequest) => Effect.Effect<AcpSchema.InitializeResponse, AcpError.AcpError>
  ) => Effect.Effect<void>;
  readonly handleListSessions: (
    handler: (
      request: AcpSchema.ListSessionsRequest
    ) => Effect.Effect<AcpSchema.ListSessionsResponse, AcpError.AcpError>
  ) => Effect.Effect<void>;
  readonly handleLoadSession: (
    handler: (request: AcpSchema.LoadSessionRequest) => Effect.Effect<AcpSchema.LoadSessionResponse, AcpError.AcpError>
  ) => Effect.Effect<void>;
  readonly handleLogout: (
    handler: (request: AcpSchema.LogoutRequest) => Effect.Effect<AcpSchema.LogoutResponse, AcpError.AcpError>
  ) => Effect.Effect<void>;
  readonly handlePrompt: (
    handler: (request: AcpSchema.PromptRequest) => Effect.Effect<AcpSchema.PromptResponse, AcpError.AcpError>
  ) => Effect.Effect<void>;
  readonly handleResumeSession: (
    handler: (
      request: AcpSchema.ResumeSessionRequest
    ) => Effect.Effect<AcpSchema.ResumeSessionResponse, AcpError.AcpError>
  ) => Effect.Effect<void>;
  readonly handleSetSessionConfigOption: (
    handler: (
      request: AcpSchema.SetSessionConfigOptionRequest
    ) => Effect.Effect<AcpSchema.SetSessionConfigOptionResponse, AcpError.AcpError>
  ) => Effect.Effect<void>;
  readonly handleSetSessionModel: (
    handler: (
      request: AcpSchema.SetSessionModelRequest
    ) => Effect.Effect<AcpSchema.SetSessionModelResponse, AcpError.AcpError>
  ) => Effect.Effect<void>;
  readonly handleUnknownExtNotification: (
    handler: (method: string, params: unknown) => Effect.Effect<void, AcpError.AcpError>
  ) => Effect.Effect<void>;
  readonly handleUnknownExtRequest: (
    handler: (method: string, params: unknown) => Effect.Effect<unknown, AcpError.AcpError>
  ) => Effect.Effect<void>;
  readonly raw: {
    /**
     * Stream of inbound ACP notifications observed on the connection.
     */
    readonly notifications: Stream.Stream<AcpProtocol.AcpIncomingNotification>;
    /**
     * Sends a generic ACP extension request.
     * @see https://agentclientprotocol.com/protocol/extensibility
     */
    readonly request: (method: string, payload: unknown) => Effect.Effect<unknown, AcpError.AcpError>;
    /**
     * Sends a generic ACP extension notification.
     * @see https://agentclientprotocol.com/protocol/extensibility
     */
    readonly notify: (method: string, payload: unknown) => Effect.Effect<void, AcpError.AcpError>;
  };
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpAgent.service.ts#L63)

Since v0.0.0