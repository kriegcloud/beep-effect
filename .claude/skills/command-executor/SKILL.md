---
name: command-executor
description: Execute system commands and manage processes using Effect's ChildProcess module from effect/unstable/process. Use this skill when spawning child processes, running shell commands, capturing command output, or managing long-running processes with cleanup.
---

# Command Execution with ChildProcess

## Overview

The `ChildProcess` module provides type-safe, testable process execution with automatic resource cleanup. Use this for spawning child processes, running shell commands, capturing output, and managing process lifecycles.

**When to use this skill:**
- Running shell commands or external programs
- Spawning child processes with controlled stdio
- Capturing command output (string, lines, stream)
- Managing long-running processes with cleanup
- Setting environment variables or working directories
- Piping commands together

**Note:** This skill covers the `ChildProcess` module for process execution, NOT `effect/unstable/cli` for building CLI applications.

## Import Pattern

```typescript
import { ChildProcess } from "effect/unstable/process"
```

## Creating Commands

### Basic Command

```typescript
import { ChildProcess } from "effect/unstable/process"
import { pipe } from "effect"

declare const PROJECT_ROOT: string

// Simple command with arguments (template literal form)
const command = ChildProcess.make`echo -n test`

// Array form with arguments
const commandArray = ChildProcess.make("echo", ["-n", "test"])

// With working directory
const commandWithDir = ChildProcess.make({ cwd: "/path/to/project" })`npm install`

// With environment variables
const commandWithEnv = ChildProcess.make({
  env: { NODE_ENV: "production", API_KEY: "xyz" }
})`node script.js`

// Control stdio streams
const commandWithStdio = ChildProcess.make({
  stdout: "inherit",
  stderr: "inherit",
  cwd: PROJECT_ROOT
})`hardhat node`
```

### Command Configuration Options

```typescript
import { ChildProcess } from "effect/unstable/process"
import type { Stream } from "effect"

declare const stream: Stream.Stream<Uint8Array>

// stdout/stderr modes:
// - "inherit": Pass through to parent process
// - "pipe": Capture for programmatic access
// - "ignore": Discard output

const configuredCommand = ChildProcess.make({
  stdout: "pipe",
  stderr: "inherit",
  stdin: stream
})`some-command`
```

## Executing Commands

### Capture as String

```typescript
import { ChildProcess } from "effect/unstable/process"
import { Effect } from "effect"

const result = Effect.gen(function* () {
  const command = ChildProcess.make`echo -n hello`
  const output = yield* ChildProcess.string(command)
  // output: "hello"
  return output
})
```

### Capture as Lines

```typescript
import { ChildProcess } from "effect/unstable/process"
import { Effect } from "effect"

const result = Effect.gen(function* () {
  const command = ChildProcess.make`ls -1`
  const lines = yield* ChildProcess.lines(command)
  // lines: string[]
  return lines
})
```

### Stream Output

```typescript
import { ChildProcess } from "effect/unstable/process"
import { Effect, Stream, Console } from "effect"

const result = Effect.gen(function* () {
  const command = ChildProcess.make`tail -f app.log`

  // As line stream
  const lineStream = ChildProcess.streamLines(command)
  yield* Stream.runForEach(lineStream, (line) => Console.log(line))

  // As string stream
  const stringStream = ChildProcess.streamString(command)
  yield* Stream.runCollect(stringStream)
})
```

### Get Exit Code

```typescript
import { ChildProcess } from "effect/unstable/process"
import { Effect } from "effect"

const result = Effect.gen(function* () {
  const command = ChildProcess.make`test -f file.txt`
  const exitCode = yield* ChildProcess.exitCode(command)
  // exitCode: number (0 = success, non-zero = failure)
  return exitCode
})
```

## Process Management

### Start Process with Handle

```typescript
import { ChildProcess } from "effect/unstable/process"
import { Effect, Stream } from "effect"

declare const PROJECT_ROOT: string
declare function handleOutput(chunk: Uint8Array): Effect.Effect<void>

const program = Effect.gen(function* () {
  const command = ChildProcess.make({
    cwd: PROJECT_ROOT,
    stdout: "inherit",
    stderr: "inherit"
  })`bunx hardhat node`

  // Spawn returns a process handle
  const process = yield* ChildProcess.spawn(command)

  // Access streams (when stdout/stderr are "pipe")
  yield* Stream.runForEach(process.stdout, handleOutput)

  // Wait for exit
  const exitCode = yield* process.exitCode
  return exitCode
})
```

### Automatic Cleanup with Finalizers

```typescript
import { ChildProcess } from "effect/unstable/process"
import { Effect } from "effect"

declare const PROJECT_ROOT: string
declare const waitForHardhat: Effect.Effect<void>

const startHardhatNode = Effect.gen(function* () {
  const command = ChildProcess.make({
    cwd: PROJECT_ROOT,
    stdout: "inherit",
    stderr: "inherit"
  })`bunx hardhat node`

  const process = yield* ChildProcess.spawn(command)

  // Register cleanup - runs when scope closes
  yield* Effect.addFinalizer(() =>
    process.kill("SIGTERM").pipe(Effect.ignoreLogged)
  )

  yield* waitForHardhat
  yield* Effect.log("Hardhat node ready")
})

// Usage with Scope
const program = startHardhatNode.pipe(
  Effect.scoped  // Automatically runs finalizers when scope ends
)
```

### Scoped Process Management

```typescript
import { ChildProcess } from "effect/unstable/process"
import { Effect } from "effect"

const runWithProcess = Effect.gen(function* () {
  const command = ChildProcess.make`sleep 100`

  // Process is scoped - automatically killed when scope closes
  const process = yield* ChildProcess.spawn(command)

  // Wait for exit
  const exitCode = yield* process.exitCode

  // When this Effect completes, process is killed
  return exitCode
}).pipe(Effect.scoped)
```

## Piping Commands

```typescript
import { ChildProcess } from "effect/unstable/process"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  // Pipe commands together like shell pipelines
  const command = ChildProcess.make`echo "2\n1\n3"`.pipe(
    ChildProcess.pipeTo(ChildProcess.make`sort`),
    ChildProcess.pipeTo(ChildProcess.make`head -2`)
  )

  const lines = yield* ChildProcess.lines(command)
  // lines: ["1", "2"]
})
```

## Error Handling

Commands fail with typed `PlatformError`:

```typescript
import { ChildProcess } from "effect/unstable/process"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const command = ChildProcess.make`non-existent-command`

  const result = yield* ChildProcess.string(command).pipe(
    Effect.catchTag("SystemError", (error) => {
      // error.reason: "NotFound" | "PermissionDenied" | etc
      if (error.reason === "NotFound") {
        // Fallback to alternative command
        return ChildProcess.string(ChildProcess.make`alternative`)
      }
      return Effect.fail(error)
    })
  )
})
```

## Complete Example: E2E Test Setup

```typescript
import { Effect, Schedule, Scope, Exit, pipe } from "effect"
import { ChildProcess } from "effect/unstable/process"
import { BunServices } from "@effect/platform-bun"

declare function createPublicClient(config: { transport: unknown }): { getChainId(): Promise<number> }
declare function http(url: string): unknown

const PROJECT_ROOT = new URL("../", import.meta.url).pathname

// Check if service is ready
const checkReady = Effect.tryPromise({
  try: async () => {
    // Check if Hardhat is responding
    const client = createPublicClient({ transport: http("http://127.0.0.1:8545") })
    await client.getChainId()
    return true
  },
  catch: () => new Error("Service not ready"),
})

// Wait for service with retries
const waitForReady = pipe(
  checkReady,
  Effect.retry(
    Schedule.recurs(30).pipe(Schedule.addDelay(() => "500 millis"))
  ),
  Effect.timeout("30 seconds"),
  Effect.catch(() => Effect.fail(new Error("Failed to start")))
)

// Start long-running process
const startService = Effect.gen(function* () {
  const command = ChildProcess.make({
    cwd: PROJECT_ROOT,
    stdout: "inherit",
    stderr: "inherit"
  })`bunx hardhat node`

  const process = yield* ChildProcess.spawn(command)

  // Cleanup when scope closes
  yield* Effect.addFinalizer(() =>
    process.kill("SIGTERM").pipe(Effect.ignoreLogged)
  )

  yield* waitForReady
  yield* Effect.log("Service ready")
})

// Run deployment command
const deploy = Effect.gen(function* () {
  const command = ChildProcess.make({
    cwd: PROJECT_ROOT
  })`bunx hardhat ignition deploy ignition/modules/MyModule.ts --network localhost`

  const result = yield* ChildProcess.string(command)

  if (result.includes("Error")) {
    yield* Effect.fail(new Error("Deploy failed"))
  }
})

// Setup with scope management
const testScope = Scope.make().pipe(Effect.runSync)

const setupProgram = pipe(
  startService,
  Effect.flatMap(() => deploy),
  Effect.provide(BunServices.layer),
  Scope.extend(testScope)
)

const teardownProgram = pipe(
  Effect.gen(function* () {
    yield* Effect.log("Cleaning up...")
    yield* Scope.close(testScope, Exit.void)
  }),
  Effect.provide(BunServices.layer)
)

// Vitest global setup
export async function setup() {
  await Effect.runPromise(setupProgram)
}

export async function teardown() {
  await Effect.runPromise(teardownProgram)
}
```

## Key Patterns

### 1. Use ChildProcess.spawn for Process Handles

```typescript
import { ChildProcess } from "effect/unstable/process"

declare const command: ChildProcess.Command

// Spawn the command to get a handle
const process = yield* ChildProcess.spawn(command)
```

### 2. Use Finalizers for Cleanup

```typescript
import { Effect } from "effect"

declare const process: { kill(signal: string): Effect.Effect<void> }

// Register cleanup that runs when scope closes
yield* Effect.addFinalizer(() =>
  process.kill("SIGTERM").pipe(Effect.ignoreLogged)
)
```

### 3. Scope Long-Running Processes

```typescript
import { ChildProcess } from "effect/unstable/process"
import { Effect } from "effect"

declare const command: ChildProcess.Command

// Wrap in Effect.scoped to ensure cleanup
const program = Effect.gen(function* () {
  const process = yield* ChildProcess.spawn(command)
  // ...
}).pipe(Effect.scoped)
```

### 4. Control stdio Based on Needs

```typescript
import { ChildProcess } from "effect/unstable/process"

// Inherit for visibility (dev/debug)
const withInherit = ChildProcess.make({ stdout: "inherit" })`some-command`

// Pipe for programmatic access (default)
const withPipe = ChildProcess.make`some-command`
```

### 5. Handle Errors with catchTag

```typescript
import { ChildProcess } from "effect/unstable/process"
import { Effect } from "effect"

declare const command: ChildProcess.Command

const result = yield* ChildProcess.string(command).pipe(
  Effect.catchTag("SystemError", (error) => {
    // Handle specific error reasons
    if (error.reason === "NotFound") { /* ... */ return Effect.succeed("") }
    if (error.reason === "PermissionDenied") { /* ... */ return Effect.succeed("") }
    return Effect.succeed("")
  })
)
```

## Testing

Commands are testable using mock layers:

```typescript
import { it } from "@effect/vitest"
import { Layer, Effect } from "effect"
import { ChildProcess } from "effect/unstable/process"
import { ChildProcessSpawner } from "effect/unstable/process/ChildProcessSpawner"

it.effect("runs command", () =>
  Effect.gen(function* () {
    const output = yield* ChildProcess.string(ChildProcess.make`echo test`)
    expect(output).toBe("test")
  }).pipe(
    Effect.provide(
      Layer.succeed(ChildProcessSpawner, {
        spawn: () => Effect.succeed(/* mock handle */)
      } as any)
    )
  )
)
```

## Common Gotchas

### 1. Don't Forget to Scope Process Management

```typescript nocheck
import { ChildProcess } from "effect/unstable/process"
import { Effect } from "effect"

declare const command: ChildProcess.Command

// ❌ WRONG - process leaks if program fails
const wrongWay = Effect.gen(function* () {
  const process = yield* ChildProcess.spawn(command)
  // ...
})
```

```typescript
import { ChildProcess } from "effect/unstable/process"
import { Effect } from "effect"

declare const command: ChildProcess.Command

// ✅ CORRECT - cleanup guaranteed
const rightWay = Effect.gen(function* () {
  const process = yield* ChildProcess.spawn(command)
  yield* Effect.addFinalizer(() => process.kill("SIGTERM").pipe(Effect.ignoreLogged))
  // ...
})
```

### 2. Choose Correct stdio Mode

```typescript nocheck
import { ChildProcess } from "effect/unstable/process"

// ❌ WRONG - can't capture output with "inherit"
const wrongCommand = ChildProcess.make({ stdout: "inherit" })`some-command`
const wrongOutput = yield* ChildProcess.string(wrongCommand)  // Empty!
```

```typescript
import { ChildProcess } from "effect/unstable/process"

// ✅ CORRECT - use "pipe" (default) to capture
const rightCommand = ChildProcess.make`some-command`
const rightOutput = yield* ChildProcess.string(rightCommand)
```

### 3. Use ignoreLogged for Finalizer Errors

```typescript nocheck
import { Effect } from "effect"

declare const process: { kill(signal: string): Effect.Effect<void> }

// ❌ WRONG - finalizer errors can mask original errors
yield* Effect.addFinalizer(() => process.kill("SIGTERM"))
```

```typescript
import { Effect } from "effect"

declare const process: { kill(signal: string): Effect.Effect<void> }

// ✅ CORRECT - log but don't fail on cleanup errors
yield* Effect.addFinalizer(() => process.kill("SIGTERM").pipe(Effect.ignoreLogged))
```

## Related Skills

- **platform-abstraction**: File I/O, Path, FileSystem services
- **effect-testing**: Testing Effect programs with @effect/vitest
- **error-handling**: Typed error handling patterns with catchTag
