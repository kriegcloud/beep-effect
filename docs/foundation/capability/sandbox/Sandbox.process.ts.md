---
title: Sandbox.process.ts
nav_order: 20
parent: "@beep/sandbox"
---

## Sandbox.process.ts overview

Effect-native process execution helpers for sandbox infrastructure.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [SandboxProcessLive](#sandboxprocesslive)
- [models](#models)
  - [ProcessCommand (class)](#processcommand-class)
  - [ProcessResult (class)](#processresult-class)
- [services](#services)
  - [SandboxProcess (class)](#sandboxprocess-class)
  - [SandboxProcessShape (interface)](#sandboxprocessshape-interface)
---

# layers

## SandboxProcessLive

Live process service backed by `effect/unstable/process`.

**Example**

```ts
import { SandboxProcessLive } from "@beep/sandbox/Sandbox.process"

console.log(SandboxProcessLive)
```

**Signature**

```ts
declare const SandboxProcessLive: Layer.Layer<SandboxProcess, never, ChildProcessSpawner.ChildProcessSpawner>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.process.ts#L254)

Since v0.0.0

# models

## ProcessCommand (class)

Command request for `SandboxProcess`.

**Example**

```ts
import { ProcessCommand } from "@beep/sandbox"

const command = ProcessCommand.make({ command: "git", args: ["status"] })
console.log(command.command)
```

**Signature**

```ts
declare class ProcessCommand
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.process.ts#L116)

Since v0.0.0

## ProcessResult (class)

Structured process output.

**Example**

```ts
import { ProcessResult } from "@beep/sandbox"

const result = ProcessResult.make({ exitCode: 0, stderr: "", stdout: "ok" })
console.log(result.stdout)
```

**Signature**

```ts
declare class ProcessResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.process.ts#L91)

Since v0.0.0

# services

## SandboxProcess (class)

Process service used by sandbox runtime code.

**Example**

```ts
import { SandboxProcess } from "@beep/sandbox"

console.log(SandboxProcess.key)
```

**Signature**

```ts
declare class SandboxProcess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.process.ts#L168)

Since v0.0.0

## SandboxProcessShape (interface)

Process service shape used by sandbox providers and git helpers.

**Example**

```ts
import type { SandboxProcessShape } from "@beep/sandbox/Sandbox.process"

const value = {} as SandboxProcessShape
console.log(value)
```

**Signature**

```ts
export interface SandboxProcessShape {
  readonly run: (command: ProcessCommand) => Effect.Effect<ProcessResult, ExecHostError>;
  readonly runShell: (
    command: string,
    options?: Partial<Omit<ProcessCommand, "args" | "command">>
  ) => Effect.Effect<ProcessResult, ExecHostError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.process.ts#L147)

Since v0.0.0