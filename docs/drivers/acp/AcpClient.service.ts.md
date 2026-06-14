---
title: AcpClient.service.ts
nav_order: 6
parent: "@beep/acp"
---

## AcpClient.service.ts overview

ACP client service and child-process layer constructors.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [make](#make)
- [layers](#layers)
  - [layerChildProcess](#layerchildprocess)
- [models](#models)
  - [AcpClientOptions (interface)](#acpclientoptions-interface)
- [services](#services)
  - [AcpClient (class)](#acpclient-class)
  - [AcpClientShape (interface)](#acpclientshape-interface)
---

# constructors

## make

Constructs an ACP client from an Effect `Stdio` transport.

**Example**

```ts
import type * as Stdio from "effect/Stdio"
import { make } from "@beep/acp/client"

const fromStdio = (stdio: Stdio.Stdio) => make(stdio)
console.log(fromStdio)
```

**Signature**

```ts
declare const make: (stdio: Stdio.Stdio, options?: AcpClientOptions | undefined, terminationError?: Effect.Effect<AcpError.AcpRequestError | AcpError.AcpSpawnError | AcpError.AcpProcessExitedError | AcpError.AcpProtocolParseError | AcpError.AcpTransportError, never, never> | undefined) => Effect.Effect<AcpClientShape, never, Scope.Scope>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpClient.service.ts#L360)

Since v0.0.0

# layers

## layerChildProcess

Constructs an ACP client layer backed by a spawned child process.

**Example**

```ts
import type { ChildProcessSpawner } from "effect/unstable/process"
import { layerChildProcess } from "@beep/acp/client"

const fromHandle = (handle: ChildProcessSpawner.ChildProcessHandle) => layerChildProcess(handle)
console.log(fromHandle)
```

**Signature**

```ts
declare const layerChildProcess: (handle: ChildProcessSpawner.ChildProcessHandle, options?: AcpClientOptions) => Layer.Layer<AcpClient>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpClient.service.ts#L731)

Since v0.0.0

# models

## AcpClientOptions (interface)

Options for constructing an ACP client service.

**Example**

```ts
import type { AcpClientOptions } from "@beep/acp/client"

const options: AcpClientOptions = { logOutgoing: true }
```

**Signature**

```ts
export interface AcpClientOptions extends AcpProtocol.AcpProtocolLoggingOptions {
  readonly logger?: (event: AcpProtocol.AcpProtocolLogEvent) => Effect.Effect<void>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpClient.service.ts#L49)

Since v0.0.0

# services

## AcpClient (class)

Context service tag for an ACP client.

**Example**

```ts
import { Effect } from "effect"
import { AcpClient } from "@beep/acp/client"

const program = Effect.service(AcpClient)
```

**Signature**

```ts
declare class AcpClient
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpClient.service.ts#L303)

Since v0.0.0

## AcpClientShape (interface)

Service shape implemented by the ACP client driver.

**Example**

```ts
import type { AcpClientShape } from "@beep/acp/client"

const notificationsOf = (client: AcpClientShape) => client.raw.notifications
console.log(notificationsOf)
```

**Signature**

```ts
export interface AcpClientShape {
  readonly agent: {
    /**
     * Initializes the ACP session and negotiates capabilities.
     * @see https://agentclientprotocol.com/protocol/schema#initialize
     */
    readonly initialize: (
      payload: AcpSchema.InitializeRequest
    ) => Effect.Effect<AcpSchema.InitializeResponse, AcpError.AcpError>;
    /**
     * Performs ACP authentication when the agent requires it.
     * @see https://agentclientprotocol.com/protocol/schema#authenticate
     */
    readonly authenticate: (
      payload: AcpSchema.AuthenticateRequest
    ) => Effect.Effect<AcpSchema.AuthenticateResponse, AcpError.AcpError>;
    /**
     * Logs out the current ACP identity.
     * @see https://agentclientprotocol.com/protocol/schema#logout
     */
    readonly logout: (payload: AcpSchema.LogoutRequest) => Effect.Effect<AcpSchema.LogoutResponse, AcpError.AcpError>;
    /**
     * Starts a new ACP session.
     * @see https://agentclientprotocol.com/protocol/schema#session/new
     */
    readonly createSession: (
      payload: AcpSchema.NewSessionRequest
    ) => Effect.Effect<AcpSchema.NewSessionResponse, AcpError.AcpError>;
    /**
     * Loads a previously saved ACP session.
     * @see https://agentclientprotocol.com/protocol/schema#session/load
     */
    readonly loadSession: (
      payload: AcpSchema.LoadSessionRequest
    ) => Effect.Effect<AcpSchema.LoadSessionResponse, AcpError.AcpError>;
    /**
     * Lists available ACP sessions.
     * @see https://agentclientprotocol.com/protocol/schema#session/list
     */
    readonly listSessions: (
      payload: AcpSchema.ListSessionsRequest
    ) => Effect.Effect<AcpSchema.ListSessionsResponse, AcpError.AcpError>;
    /**
     * Forks an ACP session.
     * @see https://agentclientprotocol.com/protocol/schema#session/fork
     */
    readonly forkSession: (
      payload: AcpSchema.ForkSessionRequest
    ) => Effect.Effect<AcpSchema.ForkSessionResponse, AcpError.AcpError>;
    /**
     * Resumes an ACP session.
     * @see https://agentclientprotocol.com/protocol/schema#session/resume
     */
    readonly resumeSession: (
      payload: AcpSchema.ResumeSessionRequest
    ) => Effect.Effect<AcpSchema.ResumeSessionResponse, AcpError.AcpError>;
    /**
     * Closes an ACP session.
     * @see https://agentclientprotocol.com/protocol/schema#session/close
     */
    readonly closeSession: (
      payload: AcpSchema.CloseSessionRequest
    ) => Effect.Effect<AcpSchema.CloseSessionResponse, AcpError.AcpError>;
    /**
     * Selects the active model for a session.
     * @see https://agentclientprotocol.com/protocol/schema#session/set_model
     */
    readonly setSessionModel: (
      payload: AcpSchema.SetSessionModelRequest
    ) => Effect.Effect<AcpSchema.SetSessionModelResponse, AcpError.AcpError>;
    /**
     * Updates a session configuration option.
     * @see https://agentclientprotocol.com/protocol/schema#session/set_config_option
     */
    readonly setSessionConfigOption: (
      payload: AcpSchema.SetSessionConfigOptionRequest
    ) => Effect.Effect<AcpSchema.SetSessionConfigOptionResponse, AcpError.AcpError>;
    /**
     * Sends a prompt turn to the agent.
     * @see https://agentclientprotocol.com/protocol/schema#session/prompt
     */
    readonly prompt: (payload: AcpSchema.PromptRequest) => Effect.Effect<AcpSchema.PromptResponse, AcpError.AcpError>;
    /**
     * Sends a real ACP `session/cancel` notification.
     * @see https://agentclientprotocol.com/protocol/schema#session/cancel
     */
    readonly cancel: (payload: AcpSchema.CancelNotification) => Effect.Effect<void, AcpError.AcpError>;
  };
  /**
   * Registers a handler for `terminal/create`.
   * @see https://agentclientprotocol.com/protocol/schema#terminal/create
   */
  readonly handleCreateTerminal: (
    handler: (
      request: AcpSchema.CreateTerminalRequest
    ) => Effect.Effect<AcpSchema.CreateTerminalResponse, AcpError.AcpError>
  ) => Effect.Effect<void>;
  /**
   * Registers a handler for `session/elicitation`.
   * @see https://agentclientprotocol.com/protocol/schema#session/elicitation
   */
  readonly handleElicitation: (
    handler: (request: AcpSchema.ElicitationRequest) => Effect.Effect<AcpSchema.ElicitationResponse, AcpError.AcpError>
  ) => Effect.Effect<void>;
  /**
   * Registers a handler for `session/elicitation/complete`.
   * @see https://agentclientprotocol.com/protocol/schema#session/elicitation/complete
   */
  readonly handleElicitationComplete: (
    handler: (notification: AcpSchema.ElicitationCompleteNotification) => Effect.Effect<void, AcpError.AcpError>
  ) => Effect.Effect<void>;
  /**
   * Registers a typed extension notification handler.
   * @see https://agentclientprotocol.com/protocol/extensibility
   */
  readonly handleExtNotification: <A, I>(
    method: string,
    payload: S.Codec<A, I>,
    handler: (payload: A) => Effect.Effect<void, AcpError.AcpError>
  ) => Effect.Effect<void>;
  /**
   * Registers a typed extension request handler.
   * @see https://agentclientprotocol.com/protocol/extensibility
   */
  readonly handleExtRequest: <A, I>(
    method: string,
    payload: S.Codec<A, I>,
    handler: (payload: A) => Effect.Effect<unknown, AcpError.AcpError>
  ) => Effect.Effect<void>;
  /**
   * Registers a handler for `fs/read_text_file`.
   * @see https://agentclientprotocol.com/protocol/schema#fs/read_text_file
   */
  readonly handleReadTextFile: (
    handler: (
      request: AcpSchema.ReadTextFileRequest
    ) => Effect.Effect<AcpSchema.ReadTextFileResponse, AcpError.AcpError>
  ) => Effect.Effect<void>;
  /**
   * Registers a handler for `session/request_permission`.
   * @see https://agentclientprotocol.com/protocol/schema#session/request_permission
   */
  readonly handleRequestPermission: (
    handler: (
      request: AcpSchema.RequestPermissionRequest
    ) => Effect.Effect<AcpSchema.RequestPermissionResponse, AcpError.AcpError>
  ) => Effect.Effect<void>;
  /**
   * Registers a handler for `session/update`.
   * @see https://agentclientprotocol.com/protocol/schema#session/update
   */
  readonly handleSessionUpdate: (
    handler: (notification: AcpSchema.SessionNotification) => Effect.Effect<void, AcpError.AcpError>
  ) => Effect.Effect<void>;
  /**
   * Registers a handler for `terminal/kill`.
   * @see https://agentclientprotocol.com/protocol/schema#terminal/kill
   */
  readonly handleTerminalKill: (
    handler: (
      request: AcpSchema.KillTerminalRequest
    ) => Effect.Effect<AcpSchema.KillTerminalResponse | void, AcpError.AcpError>
  ) => Effect.Effect<void>;
  /**
   * Registers a handler for `terminal/output`.
   * @see https://agentclientprotocol.com/protocol/schema#terminal/output
   */
  readonly handleTerminalOutput: (
    handler: (
      request: AcpSchema.TerminalOutputRequest
    ) => Effect.Effect<AcpSchema.TerminalOutputResponse, AcpError.AcpError>
  ) => Effect.Effect<void>;
  /**
   * Registers a handler for `terminal/release`.
   * @see https://agentclientprotocol.com/protocol/schema#terminal/release
   */
  readonly handleTerminalRelease: (
    handler: (
      request: AcpSchema.ReleaseTerminalRequest
    ) => Effect.Effect<AcpSchema.ReleaseTerminalResponse | void, AcpError.AcpError>
  ) => Effect.Effect<void>;
  /**
   * Registers a handler for `terminal/wait_for_exit`.
   * @see https://agentclientprotocol.com/protocol/schema#terminal/wait_for_exit
   */
  readonly handleTerminalWaitForExit: (
    handler: (
      request: AcpSchema.WaitForTerminalExitRequest
    ) => Effect.Effect<AcpSchema.WaitForTerminalExitResponse, AcpError.AcpError>
  ) => Effect.Effect<void>;
  /**
   * Registers a fallback extension notification handler.
   * @see https://agentclientprotocol.com/protocol/extensibility
   */
  readonly handleUnknownExtNotification: (
    handler: (method: string, params: unknown) => Effect.Effect<void, AcpError.AcpError>
  ) => Effect.Effect<void>;
  /**
   * Registers a fallback extension request handler.
   * @see https://agentclientprotocol.com/protocol/extensibility
   */
  readonly handleUnknownExtRequest: (
    handler: (method: string, params: unknown) => Effect.Effect<unknown, AcpError.AcpError>
  ) => Effect.Effect<void>;
  /**
   * Registers a handler for `fs/write_text_file`.
   * @see https://agentclientprotocol.com/protocol/schema#fs/write_text_file
   */
  readonly handleWriteTextFile: (
    handler: (
      request: AcpSchema.WriteTextFileRequest
    ) => Effect.Effect<AcpSchema.WriteTextFileResponse | void, AcpError.AcpError>
  ) => Effect.Effect<void>;
  readonly raw: AcpClientRaw;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpClient.service.ts#L73)

Since v0.0.0