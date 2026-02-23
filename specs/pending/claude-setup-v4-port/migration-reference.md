# Migration Reference: claude-setup v3 → v4

> Complete API mapping for every v3 pattern found in `.repos/claude-setup`.
>
> **PRIMARY REFERENCE:** `tooling/cli/` — a working v4 workspace package in this repo that uses every API needed. Check it FIRST for real, tested patterns.
>
> Verify against `tooling/cli/`, `.repos/effect-smol`, or `graphiti-memory` (effect-v4 graph) before applying.

## 1. Import Path Changes

These are mechanical find-and-replace operations.

### Removed Packages (merged into core)

```diff
- import * as Schema from "@effect/schema"
- import * as S from "@effect/schema/Schema"
+ import * as Schema from "effect/Schema"
+ import * as S from "effect/Schema"

- import { Args, Command, Options } from "@effect/cli"
+ import { Argument, Command, Flag } from "effect/unstable/cli"

- import { Command, CommandExecutor } from "@effect/platform"
+ import { ChildProcess } from "effect/unstable/process"

- import { FileSystem, Path } from "@effect/platform"
+ import { FileSystem, Path } from "effect"

- import { Terminal } from "@effect/platform"
+ import { Terminal } from "effect"
```

### Kept Packages (version bump only)

```diff
- import { BunContext, BunRuntime } from "@effect/platform-bun"
+ import { BunContext, BunRuntime } from "@effect/platform-bun"
  // Same import, just version ^4.0.0-beta.11 via catalog:
```

### Core Effect Imports (unchanged)

```ts
// These stay the same — just ensure version is v4
import { Effect, Console, Option, Array, String, pipe, Record, Order, Config, Layer, Data } from "effect"
```

## 2. Service & Layer Migration

### Context.Tag → ServiceMap.Service

```diff
- import { Context } from "effect"
+ import { ServiceMap } from "effect"

  // Function syntax
- const Database = Context.GenericTag<Database>("Database")
+ const Database = ServiceMap.Service<Database>("Database")

  // Class syntax — note the argument order change
- class AgentConfig extends Context.Tag("AgentConfig")<
-   AgentConfig,
-   { readonly projectDir: string }
- >() {}
+ class AgentConfig extends ServiceMap.Service<AgentConfig, {
+   readonly projectDir: string
+ }>()("AgentConfig") {}
```

### Layer Convention

```diff
  // Layer naming
- static Default = Layer.effect(this, ...)
- static Live = Layer.effect(this, ...)
+ static layer = Layer.effect(this, ...)

  // No more dependencies array
- class Logger extends Effect.Service<Logger>()("Logger", {
-   effect: Effect.gen(function*() { ... }),
-   dependencies: [Config.Default]
- }) {}
+ class Logger extends ServiceMap.Service<Logger, Logger.Shape>()("Logger", {
+   make: Effect.gen(function*() { ... })
+ }) {
+   static layer = Layer.effect(this, this.make).pipe(
+     Layer.provide(Config.layer)
+   )
+ }
```

### Service Access

```diff
  // yield* still works (preferred):
  const config = yield* AgentConfig

  // Static proxy accessors REMOVED in v4
- const result = AgentConfig.doSomething()
+ const result = AgentConfig.use((svc) => svc.doSomething())
  // Or (preferred):
+ const svc = yield* AgentConfig
+ const result = svc.doSomething()
```

## 3. Error Type Migration

### Data.TaggedError → Schema.TaggedErrorClass

**Working example:** `tooling/cli/src/commands/tsconfig-sync.ts` — `TsconfigSyncDriftError`

```diff
- import { Data } from "effect"
+ import { Schema } from "effect"

- class MyError extends Data.TaggedError("MyError")<{
-   readonly reason: string
- }> {}
+ class MyError extends Schema.TaggedErrorClass<MyError>(
+   "@beep/claude-setup/MyError"   // Service-style identifier (1st call)
+ )(
+   "MyError",                      // Tag name (2nd call)
+   { reason: Schema.String },      // Schema fields, NOT TS types
+   {                                // Annotations
+     identifier: "MyError",
+     title: "My Error",
+     description: "Description of this error",
+   }
+ ) {}
```

**Note:** The first call takes a service-style identifier string. The second call takes `(tag, fields, annotations)`. See `tooling/cli/src/commands/tsconfig-sync.ts` for the exact pattern used in this repo.

**Note:** `Schema.TaggedErrorClass` takes Schema field definitions (not TypeScript types). This means:
- `string` → `S.String`
- `number` → `S.Number`
- `boolean` → `S.Boolean`
- `readonly string[]` → `S.Array(S.String)`
- `unknown` → `S.Unknown`
- Optional fields → `S.optional(S.String)`

## 4. Schema API Changes

### Decode/Encode

```diff
  // decodeUnknown — signature may change
- const decoded = yield* Schema.decodeUnknown(MySchema)(rawData)
+ const decoded = yield* Schema.decodeUnknown(MySchema)(rawData)
  // Verify exact signature against .repos/effect-smol/packages/effect/src/Schema.ts

  // decode → decodeEffect (if used in Effect context)
- const decoded = yield* Schema.decode(MySchema)(input)
+ const decoded = yield* Schema.decodeEffect(MySchema)(input)
```

### Schema Construction (mostly unchanged)

```ts
// These patterns are stable across v3→v4:
Schema.Struct({ ... })
Schema.Literal("a", "b")
Schema.Union([Schema.String, Schema.Number])
Schema.Array(Schema.String)
Schema.Record({ key: Schema.String, value: Schema.Unknown })
Schema.optional(Schema.String)
```

### Schema.Data removed

```diff
- const MyData = Schema.Struct({ ... }).pipe(Schema.Data)
+ const MyData = Schema.Struct({ ... })
  // Data integration changed — verify if Schema.Data still exists in v4
```

## 5. Command Execution Migration

### @effect/platform Command → effect/unstable/process ChildProcess

The v3 `Command` builder pattern from `@effect/platform` is replaced by the `ChildProcess` template tag API from `effect/unstable/process`.

**Note:** `tooling/cli/` imports `NodeChildProcessSpawner` for its Layer but doesn't call `ChildProcess.make` directly in its command handlers (it uses `FileSystem` instead). The hooks in claude-setup DO execute shell commands (git, bun, etc.), so they need the ChildProcess migration. Verify the exact API against `.repos/effect-smol/packages/effect/src/unstable/process/ChildProcess.ts`.

```diff
- import { Command, CommandExecutor } from "@effect/platform"
+ import { ChildProcess } from "effect/unstable/process"

  // Simple command
- const result = pipe(
-   Command.make("git", "status"),
-   Command.workingDirectory("/repo"),
-   Command.string,
-   Effect.catchAll(() => Effect.succeed("(unavailable)"))
- )
+ const result = Effect.gen(function*() {
+   const handle = yield* ChildProcess.make({ cwd: "/repo" })`git status`
+   const chunks = yield* Stream.runCollect(handle.stdout)
+   return chunks.join("")
+ }).pipe(
+   Effect.scoped,
+   Effect.catchAll(() => Effect.succeed("(unavailable)"))
+ )

  // Command with arguments
- const result = pipe(
-   Command.make("git", "log", "--oneline", "-10"),
-   Command.string
- )
+ const handle = yield* ChildProcess.make`git log --oneline -10`

  // Piping commands
- const result = pipe(
-   Command.make("cat", "file.txt"),
-   Command.pipeTo(Command.make("grep", "pattern")),
-   Command.string
- )
+ const pipeline = ChildProcess.make`cat file.txt`.pipe(
+   ChildProcess.pipeTo(ChildProcess.make`grep pattern`)
+ )
+ const handle = yield* pipeline
```

**Key differences:**
- Template tag API instead of `Command.make("cmd", "arg1", "arg2")`
- Options (`cwd`, `env`) passed as first arg: `ChildProcess.make({ cwd: "/tmp" })\`cmd\``
- Output via `handle.stdout` (Stream) + `Stream.runCollect`, not `Command.string`
- Requires `Effect.scoped` for resource cleanup
- Spawning is via `yield*` (Yieldable protocol)

**Layer setup for ChildProcess** (from `tooling/cli/src/bin.ts`):
```ts
import { NodeChildProcessSpawner } from "@effect/platform-node"
// Add to your layer composition:
const layers = Layer.mergeAll(NodeChildProcessSpawner.layer, /* ... other layers */)
```

## 6. CLI Migration (@effect/cli → effect/unstable/cli)

**Reference: `tooling/cli/src/commands/`** — every pattern below is taken from working v4 code in this repo.

### Import Changes

```diff
- import { Args, Command, Options } from "@effect/cli"
+ import { Argument, Command, Flag } from "effect/unstable/cli"
```

### Command.make — 3-argument signature

v3 used various overloads. v4 uses a consistent 3-arg pattern: `(name, config, handler)`.

```diff
  // v3: @effect/cli
- const crawlCommand = Command.make("crawl", { input: inputArg, verbose: verboseOpt })
- const crawlHandler = crawlCommand.pipe(
-   Command.withHandler(({ input, verbose }) => Effect.gen(function*() { ... }))
- )

  // v4: effect/unstable/cli (from tooling/cli/src/commands/tsconfig-sync.ts)
+ const crawlCommand = Command.make(
+   "crawl",
+   {
+     input: Argument.string("input").pipe(Argument.withDescription("Input file")),
+     verbose: Flag.boolean("verbose").pipe(
+       Flag.withAlias("v"),
+       Flag.withDescription("Verbose output")
+     ),
+   },
+   Effect.fn(function* ({ input, verbose }) {
+     // Handler body — config destructured as first arg
+     const fs = yield* FileSystem.FileSystem
+     // ...
+   })
+ ).pipe(Command.withDescription("Crawl and process input file"))
```

### Flag API (replaces Options)

```ts
// Boolean flag (from tooling/cli/src/commands/purge.ts)
Flag.boolean("lock").pipe(
  Flag.withAlias("l"),
  Flag.withDescription("Also remove root bun.lock")
)

// String flag with default (from tooling/cli/src/commands/create-package/handler.ts)
Flag.string("type").pipe(
  Flag.withDescription("Package type: library, tool, or app"),
  Flag.withDefault("library")
)

// Optional string flag (from tooling/cli/src/commands/tsconfig-sync.ts)
Flag.string("filter").pipe(
  Flag.withDescription("Limit to a package name"),
  Flag.optional  // Result is Option<string>, unwrap with O.getOrUndefined()
)
```

### Argument API (replaces Args)

```ts
// Positional argument (from tooling/cli/src/commands/create-package/handler.ts)
Argument.string("name").pipe(
  Argument.withDescription("Package name (e.g. my-utils)")
)
```

### Subcommands (from tooling/cli/src/commands/root.ts)

```ts
export const rootCommand = Command.make("beep-cli").pipe(
  Command.withDescription("CLI tool for managing beep-effect monorepo packages"),
  Command.withSubcommands([
    topoSortCommand,
    createPackageCommand,
    codegenCommand,
  ])
)
```

### Running Commands

```ts
// Production entry (from tooling/cli/src/bin.ts)
const program = Command.run(rootCommand, { version: "0.0.0" }).pipe(
  Effect.provide(DerivedLayers)
)
Effect.runPromise(program).catch(console.error)

// Testing (from tooling/cli/test/topo-sort.test.ts)
const run = Command.runWith(topoSortCommand, { version: "0.0.0" })
yield* run([])  // pass CLI args as string array
```

### Layer Setup for CLI (from tooling/cli/src/bin.ts)

```ts
import { NodeFileSystem, NodePath, NodeTerminal, NodeChildProcessSpawner } from "@effect/platform-node"

const BaseLayers = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer, NodeTerminal.layer)
const DerivedLayers = Layer.mergeAll(
  NodeChildProcessSpawner.layer,
  FetchHttpClient.layer,
  FsUtilsLive
).pipe(Layer.provideMerge(BaseLayers))
```

### Complete v3→v4 CLI Mapping

| v3 (@effect/cli) | v4 (effect/unstable/cli) | Notes |
|-------------------|--------------------------|-------|
| `Args.text(name)` | `Argument.string(name)` | Positional arg |
| `Args.file(opts)` | `Argument.string(name)` | No dedicated file type — validate in handler |
| `Options.boolean(name)` | `Flag.boolean(name)` | |
| `Options.text(name)` | `Flag.string(name)` | |
| `Options.withAlias(opt, char)` | `Flag.withAlias(char)` | Piped |
| `Options.withDescription(...)` | `Flag.withDescription(...)` | Piped |
| `Options.withDefault(...)` | `Flag.withDefault(value)` | Piped |
| `Options.optional(...)` | `Flag.optional` | Piped, result is `Option<T>` |
| `Command.make(name, opts)` | `Command.make(name, config, handler)` | Handler is 3rd arg, not piped |
| `Command.withHandler(...)` | N/A — handler is 3rd arg | |
| `Command.run(cmd, opts)` | `Command.run(cmd, { version })` | Same concept |

## 7. Error Handling API Changes

```diff
  // catchAll → catch
- Effect.catchAll((e) => ...)
+ Effect.catch((e) => ...)

  // catchSome → catchFilter
- Effect.catchSome((e) => e._tag === "NotFound" ? Option.some(handler) : Option.none())
+ Effect.catchFilter(Filter.fromPredicate((e) => e._tag === "NotFound"), handler)

  // catchTag — unchanged
  Effect.catchTag("MyError", (e) => ...)

  // catchTags — unchanged
  Effect.catchTags({ MyError: (e) => ..., OtherError: (e) => ... })
```

## 8. Forking Changes

```diff
- Effect.fork(myEffect)
+ Effect.forkChild(myEffect)

- Effect.forkDaemon(myEffect)
+ Effect.forkDetach(myEffect)
```

## 9. Generator Context Changes

```diff
  // If using `this` in Effect.gen:
- Effect.gen(this, function*() { this.something })
+ Effect.gen({ self: this }, function*() { this.something })
```

## 10. Equality Changes

Default equality is now structural (not reference). This is mostly transparent but may affect:
- Custom `Equal` implementations
- Map/Set key comparisons
- Test assertions comparing objects

## 11. Yieldable Changes

Some types that were yieldable in v3 are NOT directly yieldable in v4:

```diff
  // Ref
- const value = yield* myRef
+ const value = yield* Ref.get(myRef)

  // Deferred
- const value = yield* myDeferred
+ const value = yield* Deferred.await(myDeferred)

  // Fiber
- const value = yield* myFiber
+ const value = yield* Fiber.join(myFiber)
```

## 12. Misc Changes

```diff
  // Scope.extend → Scope.provide
- Scope.extend(myEffect, scope)
+ Scope.provide(myEffect, scope)

  // Exception → Error naming
- Cause.NoSuchElementException
+ Cause.NoSuchElementError

- Cause.TimeoutException
+ Cause.TimeoutError

  // FiberRef → ServiceMap.Reference
- FiberRef.currentLogLevel
+ References.CurrentLogLevel
```
