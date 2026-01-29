# Platform Layers

Master Effect platform layer provision for cross-platform applications. Use this skill when structuring applications that use @effect/platform abstractions to ensure portability across Node.js, Bun, and browser environments.

## The Golden Rule

**Application code uses abstract interfaces. Entry points provide platform-specific layers.**

```typescript
// Application code - platform agnostic
import { FileSystem, Path } from "@effect/platform"
import { Effect, pipe } from "effect"

const readConfig = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path
  const configPath = path.join("config", "app.json")
  return yield* fs.readFileString(configPath)
})

// Entry point - platform specific
import { NodeContext, NodeRuntime } from "@effect/platform-node"

declare const program: Effect.Effect<void, never, never>

pipe(
  program,
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain
)
```

```typescript
// WRONG - platform-specific imports in application code
import { readFileSync } from "fs"  // Ties code to Node.js
import { FileSystem } from "@effect/platform-node"  // Platform-specific
```

## Platform Import Patterns

### Node.js

```typescript
import { NodeContext, NodeRuntime } from "@effect/platform-node"
import { Effect, pipe } from "effect"

declare const program: Effect.Effect<void, never, never>

pipe(
  program,
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain
)
```

### Bun

```typescript
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { Effect, pipe } from "effect"

declare const program: Effect.Effect<void, never, never>

pipe(
  program,
  Effect.provide(BunContext.layer),
  BunRuntime.runMain
)
```

### Browser

```typescript
import { BrowserContext, BrowserRuntime } from "@effect/platform-browser"
import { Effect, pipe } from "effect"

declare const program: Effect.Effect<void, never, never>

pipe(
  program,
  Effect.provide(BrowserContext.layer),
  BrowserRuntime.runMain
)
```

## Context Layer Services

Each platform context (`NodeContext.layer`, `BunContext.layer`, etc.) provides these services:

| Service | Tag | Description |
|---------|-----|-------------|
| **FileSystem** | `FileSystem.FileSystem` | File I/O operations (read, write, stat, etc.) |
| **Path** | `Path.Path` | Path manipulation (join, normalize, relative, etc.) |
| **Terminal** | `Terminal.Terminal` | Terminal/console I/O with ANSI support |
| **CommandExecutor** | `CommandExecutor.CommandExecutor` | Spawn and manage child processes |

### Usage Example

```typescript
import { FileSystem, Path, Terminal, CommandExecutor } from "@effect/platform"
import { Effect } from "effect"

const buildProject = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path
  const terminal = yield* Terminal.Terminal
  const command = yield* CommandExecutor.CommandExecutor

  // Use Path for cross-platform paths
  const outDir = path.join("dist", "bundle")

  // Use FileSystem for I/O
  yield* fs.makeDirectory(outDir, { recursive: true })

  // Use Terminal for output
  yield* terminal.display("Building project...\n")

  // Use CommandExecutor for processes
  const result = yield* command.start("npm", "run", "build")
  return yield* result.exitCode
})
```

## Layer Composition Patterns

### Basic Provision

```typescript
import { NodeContext, NodeRuntime } from "@effect/platform-node"
import { Effect, pipe } from "effect"

declare const program: Effect.Effect<void, never, never>

// Single platform context provides all services
pipe(
  program,
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain
)
```

### Adding Custom Services

```typescript
import { NodeContext, NodeRuntime } from "@effect/platform-node"
import { Effect, Layer, pipe } from "effect"

declare const DatabaseLive: Layer.Layer<never, never, never>
declare const ConfigServiceLive: Layer.Layer<never, never, never>
declare const LoggerLive: Layer.Layer<never, never, never>
declare const program: Effect.Effect<void, never, never>

const AppLayer = Layer.mergeAll(
  DatabaseLive,
  ConfigServiceLive,
  LoggerLive
)

pipe(
  program,
  Effect.provide(AppLayer),
  Effect.provide(NodeContext.layer),  // Platform services last
  NodeRuntime.runMain
)
```

### Overriding Platform Services

```typescript
import { NodeContext, NodeRuntime } from "@effect/platform-node"
import { FileSystem } from "@effect/platform"
import { Effect, Layer, pipe } from "effect"

declare const program: Effect.Effect<void, never, never>

// Custom FileSystem implementation
const CustomFS = Layer.succeed(FileSystem.FileSystem, {
  /* custom implementation */
} as FileSystem.FileSystem)

pipe(
  program,
  Effect.provide(NodeContext.layer),
  Effect.provide(CustomFS),  // Override after platform layer
  NodeRuntime.runMain
)
```

## Testing with Mock Layers

**CRITICAL**: Never import platform-specific modules in tests. Use `Layer.succeed` with mock implementations.

### Mocking FileSystem

```typescript
import { FileSystem } from "@effect/platform"
import { Effect, Layer } from "effect"
import { expect, test } from "vitest"

declare const readConfig: Effect.Effect<string, never, FileSystem.FileSystem>

const MockFileSystem = Layer.succeed(
  FileSystem.FileSystem,
  FileSystem.FileSystem.of({
    readFileString: (path) => Effect.succeed(`mock content for ${path}`),
    writeFileString: (path, content) => Effect.void,
    exists: (path) => Effect.succeed(true),
    makeDirectory: (path, options) => Effect.void,
    // ... other required methods
  })
)

test("should read config", () =>
  Effect.gen(function* () {
    const result = yield* readConfig
    expect(result).toContain("mock content")
  }).pipe(
    Effect.provide(MockFileSystem),
    Effect.runPromise
  )
)
```

### Mocking Multiple Services

```typescript
import { FileSystem, Path, Terminal } from "@effect/platform"
import { Effect, Layer } from "effect"
import { test } from "vitest"

declare const program: Effect.Effect<void, never, FileSystem.FileSystem | Path.Path | Terminal.Terminal>

const TestContext = Layer.mergeAll(
  Layer.succeed(FileSystem.FileSystem, {
    readFileString: () => Effect.succeed("test"),
    // ...
  } as FileSystem.FileSystem),

  Layer.succeed(Path.Path, {
    join: (...parts) => parts.join("/"),
    normalize: (path) => path,
    // ...
  } as Path.Path),

  Layer.succeed(Terminal.Terminal, {
    display: () => Effect.void,
    readLine: () => Effect.succeed("test input"),
    // ...
  } as Terminal.Terminal)
)

test("integration test", () =>
  program.pipe(
    Effect.provide(TestContext),
    Effect.runPromise
  )
)
```

### Using TestContext for Common Mocks

```typescript
import { FileSystem, Path } from "@effect/platform"
import { Effect, TestContext } from "effect"
import { test } from "vitest"

test("with TestContext", () =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    // TestContext provides mock implementations
    yield* fs.writeFileString("test.txt", "content")
  }).pipe(
    Effect.provide(TestContext.TestContext),
    Effect.runPromise
  )
)
```

## Architecture Patterns

### Layered Application Structure

```
src/
├── domain/           # Pure domain logic (no platform deps)
├── services/         # Business services (uses abstract platform)
├── infrastructure/   # Platform adapters (if needed)
└── main/
    ├── main.ts       # Entry point with NodeContext
    └── main.test.ts  # Tests with mock contexts
```

### Service Implementation

```typescript
// services/ConfigService.ts
import { FileSystem, Path } from "@effect/platform"
import { Context, Effect, Layer, Schema } from "effect"

interface Config {
  readonly name: string
  readonly version: string
}

declare const ConfigSchema: Schema.Schema<Config>

class ConfigError extends Schema.TaggedError<ConfigError>()("ConfigError", {
  message: Schema.String
}) {}

export class ConfigService extends Context.Tag("ConfigService")<
  ConfigService,
  {
    readonly load: Effect.Effect<Config, ConfigError>
    readonly save: (config: Config) => Effect.Effect<void, ConfigError>
  }
>() {}

export const ConfigServiceLive = Layer.effect(
  ConfigService,
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path

    const load = Effect.gen(function* () {
      const configPath = path.join("config", "app.json")
      const content = yield* fs.readFileString(configPath)
      return yield* Schema.decode(ConfigSchema)(JSON.parse(content))
    })

    const save = (config: Config) =>
      Effect.gen(function* () {
        const configPath = path.join("config", "app.json")
        const content = JSON.stringify(config, null, 2)
        yield* fs.writeFileString(configPath, content)
      })

    return { load, save }
  })
)
```

### Entry Point

```typescript
// main/main.ts
import { NodeContext, NodeRuntime } from "@effect/platform-node"
import { Effect, Layer, pipe } from "effect"
import { ConfigService, ConfigServiceLive } from "../services/ConfigService.js"

const MainLayer = Layer.mergeAll(
  ConfigServiceLive,
  // ... other services
)

const program = Effect.gen(function* () {
  const config = yield* ConfigService
  yield* config.load
  // ... application logic
})

pipe(
  program,
  Effect.provide(MainLayer),
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain
)
```

## Common Patterns

### Conditional Platform Loading

```typescript
import { NodeContext, NodeRuntime } from "@effect/platform-node"
import { BunContext } from "@effect/platform-bun"
import { Effect, pipe } from "effect"

declare const program: Effect.Effect<void, never, never>

const PlatformContext =
  process.env.RUNTIME === "bun"
    ? BunContext.layer
    : NodeContext.layer

pipe(
  program,
  Effect.provide(PlatformContext),
  NodeRuntime.runMain  // Runtime matches context
)
```

### Scoped Platform Resources

```typescript
import { FileSystem, Path } from "@effect/platform"
import { Effect } from "effect"

const withTempDirectory = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path

  const tempDir = yield* Effect.acquireRelease(
    Effect.gen(function* () {
      const dir = path.join("temp", `${Date.now()}`)
      yield* fs.makeDirectory(dir, { recursive: true })
      return dir
    }),
    (dir) => fs.remove(dir, { recursive: true })
  )

  return tempDir
})
```

## Anti-Patterns

### Platform-Specific Imports in Application Code

```typescript
// WRONG - ties application to Node.js
import * as fs from "fs"
import * as path from "path"

const readConfig = () => {
  const content = fs.readFileSync(path.join("config", "app.json"), "utf8")
  return JSON.parse(content)
}
```

### Direct Platform Module Usage

```typescript
// WRONG - bypasses Effect abstractions
import { FileSystem } from "@effect/platform-node"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  // ...
})
```

### Providing Platform Layers in Application Code

```typescript
// WRONG - application code should not know about platform
import { NodeContext } from "@effect/platform-node"
import { Effect } from "effect"

declare const program: Effect.Effect<void, never, never>

export const myService = program.pipe(
  Effect.provide(NodeContext.layer)  // Should be at entry point only
)
```

## Key Principles

1. **Import abstractions, provide implementations**: Application code imports from `@effect/platform`, entry points provide platform-specific contexts
2. **One platform layer per runtime**: Use exactly one of `NodeContext.layer`, `BunContext.layer`, or `BrowserContext.layer`
3. **Platform layer last**: Provide custom services first, platform context last
4. **Mock in tests**: Use `Layer.succeed` with mock implementations, never import platform-specific modules in tests
5. **Entry point decides platform**: Only `main.ts` (or equivalent entry) should import platform-specific modules
