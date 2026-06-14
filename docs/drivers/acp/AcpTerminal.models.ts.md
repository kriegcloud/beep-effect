---
title: AcpTerminal.models.ts
nav_order: 9
parent: "@beep/acp"
---

## AcpTerminal.models.ts overview

ACP terminal handle helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [makeTerminal](#maketerminal)
- [models](#models)
  - [AcpTerminal (interface)](#acpterminal-interface)
  - [MakeTerminalOptions (interface)](#maketerminaloptions-interface)
---

# constructors

## makeTerminal

Constructs an ACP terminal helper from terminal request effects.

**Example**

```ts
import { makeTerminal, type MakeTerminalOptions } from "@beep/acp/terminal"

const fromOptions = (options: MakeTerminalOptions) => makeTerminal(options)
console.log(fromOptions)
```

**Signature**

```ts
declare const makeTerminal: (options: MakeTerminalOptions) => AcpTerminal
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpTerminal.models.ts#L84)

Since v0.0.0

# models

## AcpTerminal (interface)

Handle for a terminal created through ACP.

**Example**

```ts
import type { AcpTerminal } from "@beep/acp/terminal"

const terminalIdOf = (terminal: AcpTerminal) => terminal.terminalId
console.log(terminalIdOf)
```

**Signature**

```ts
export interface AcpTerminal {
  /** Terminates the terminal process.
   * Spec: https://agentclientprotocol.com/protocol/schema#terminal/kill
   */
  readonly kill: Effect.Effect<AcpSchema.KillTerminalResponse, AcpError.AcpError>;
  /** Reads buffered output from the terminal.
   * Spec: https://agentclientprotocol.com/protocol/schema#terminal/output
   */
  readonly output: Effect.Effect<AcpSchema.TerminalOutputResponse, AcpError.AcpError>;
  /** Releases the terminal handle from the ACP session.
   * Spec: https://agentclientprotocol.com/protocol/schema#terminal/release
   */
  readonly release: Effect.Effect<AcpSchema.ReleaseTerminalResponse, AcpError.AcpError>;
  readonly sessionId: string;
  readonly terminalId: string;
  /** Waits for terminal exit and returns the exit result.
   * Spec: https://agentclientprotocol.com/protocol/schema#terminal/wait_for_exit
   */
  readonly waitForExit: Effect.Effect<AcpSchema.WaitForTerminalExitResponse, AcpError.AcpError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpTerminal.models.ts#L26)

Since v0.0.0

## MakeTerminalOptions (interface)

Options used to construct an ACP terminal handle.

**Example**

```ts
import type { MakeTerminalOptions } from "@beep/acp/terminal"

const sessionIdOf = (options: MakeTerminalOptions) => options.sessionId
console.log(sessionIdOf)
```

**Signature**

```ts
export interface MakeTerminalOptions {
  readonly kill: Effect.Effect<AcpSchema.KillTerminalResponse, AcpError.AcpError>;
  readonly output: Effect.Effect<AcpSchema.TerminalOutputResponse, AcpError.AcpError>;
  readonly release: Effect.Effect<AcpSchema.ReleaseTerminalResponse, AcpError.AcpError>;
  readonly sessionId: string;
  readonly terminalId: string;
  readonly waitForExit: Effect.Effect<AcpSchema.WaitForTerminalExitResponse, AcpError.AcpError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/AcpTerminal.models.ts#L61)

Since v0.0.0