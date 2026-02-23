# Effect CLI

Build type-safe command-line applications with Effect's unstable CLI module for argument parsing, validation, and dependency injection.

## Import Pattern

```typescript
import { Command, Argument, Flag } from "effect/unstable/cli"
```

## Command Creation

Use `Command.make` to create commands with typed arguments and flags:

```typescript
import { Command, Argument, Flag } from "effect/unstable/cli"
import { Console } from "effect"

const command = Command.make(
  "greet",
  {
    name: Argument.string("name"),
    times: Flag.integer("times").pipe(Flag.withDefault(1))
  },
  ({ name, times }) => Console.log(`Hello ${name}!`.repeat(times))
)
```

**Handler signature**: Receives an object with all parsed args and flags.

## Positional Arguments (Argument)

Arguments are **required by default** and parsed in order.

### Basic Types

```typescript
import { Argument } from "effect/unstable/cli"

Argument.string("username")           // string
Argument.integer("count")            // number (integer)
Argument.float("amount")             // number (float)
Argument.date("deadline")            // Date
```

### File System Arguments

```typescript
import { Argument } from "effect/unstable/cli"

Argument.file("input")               // path to existing file
Argument.directory("output")         // path to existing directory
```

### Choice Arguments

```typescript
import { Argument } from "effect/unstable/cli"

Argument.choice("env", ["dev", "staging", "prod"])
```

### Argument Combinators

Chain these on any Argument type:

```typescript
import { Argument } from "effect/unstable/cli"

// Make optional (returns Option<T>)
Argument.string("config").pipe(Argument.optional)

// Variadic (returns ReadonlyArray<T>)
Argument.string("file").pipe(Argument.variadic())

// Cardinality constraints
Argument.string("file").pipe(Argument.atLeast(1))
Argument.string("file").pipe(Argument.atMost(3))
Argument.string("file").pipe(Argument.between(1, 5))

// Default value
Argument.integer("port").pipe(Argument.withDefault(8080))

// Description for help text
Argument.string("user").pipe(
  Argument.withDescription("Username to authenticate")
)
```

## Named Flags

Flags are **named options** with `--name` or `-alias` syntax.

### Basic Types

```typescript
import { Flag } from "effect/unstable/cli"

Flag.boolean("verbose")               // --verbose
Flag.string("config")                  // --config=value
Flag.integer("port")                   // --port=8080
Flag.float("ratio")                    // --ratio=0.5
Flag.date("since")                     // --since=2024-01-01
```

### Advanced Flags

```typescript
import { Flag } from "effect/unstable/cli"

// File system flags
Flag.file("input")                     // --input=file.txt
Flag.directory("output")               // --output=./dist

// Choice from allowed values
Flag.choice("env", ["dev", "prod"])    // --env=dev

// Key-value pair
Flag.keyValuePair("header")           // --header key=value
```

### Flag Combinators

```typescript
import { Flag } from "effect/unstable/cli"

// Short alias
Flag.boolean("verbose").pipe(Flag.withAlias("v"))
// Usage: --verbose or -v

// Default value
Flag.integer("port").pipe(Flag.withDefault(3000))

// Make optional (returns Option<T>)
Flag.string("token").pipe(Flag.optional)

// Description for help text
Flag.string("config").pipe(
  Flag.withDescription("Path to configuration file")
)
```

### Relaxed Option Placement

In v4, flags can appear **before, after, or between** positional arguments:

```bash
# All valid
mycli --verbose --port=8080 file1.txt file2.txt
mycli file1.txt --verbose file2.txt --port=8080
mycli file1.txt file2.txt --verbose --port=8080
```

## Subcommands

Create command hierarchies with `Command.withSubcommands`:

```typescript
import { Command, Argument } from "effect/unstable/cli"
import { Console } from "effect"

const init = Command.make("init", {}, () =>
  Console.log("Initializing...")
)

const deploy = Command.make("deploy", {
  env: Argument.choice("env", ["dev", "prod"])
}, ({ env }) =>
  Console.log(`Deploying to ${env}`)
)

const app = Command.make("app", {}).pipe(
  Command.withSubcommands([init, deploy])
)

// Usage: app init | app deploy prod
```

### Access Parent Command Config

Use `yield*` to access parent command context:

```typescript
import { Command, Flag } from "effect/unstable/cli"
import { Console, Effect } from "effect"

const parent = Command.make("parent", {
  verbose: Flag.boolean("verbose")
}, () => Effect.void)

const child = Command.make("child", {}, function* () {
  const { verbose } = yield* parent
  if (verbose) yield* Console.log("Verbose mode enabled")
})

const app = parent.pipe(Command.withSubcommands([child]))
```

## Dependency Injection

Provide services to command handlers via Effect's dependency injection:

### Layer Provision

```typescript
import { Command, Argument } from "effect/unstable/cli"
import { Effect, ServiceMap, Layer } from "effect"

declare const HttpClient: ServiceMap.Service<{ get: (url: string) => Effect.Effect<unknown> }>
declare const HttpClientLive: Layer.Layer<unknown>

const command = Command.make("fetch", {
  url: Argument.string("url")
}, ({ url }) =>
  Effect.gen(function* () {
    const client = yield* HttpClient
    return yield* client.get(url)
  })
).pipe(
  Command.provide(HttpClientLive)
)
```

### Effect Provision

```typescript
import { Command } from "effect/unstable/cli"
import { Effect, ServiceMap } from "effect"

declare const DatabaseService: ServiceMap.Service<unknown>
declare const makeDatabaseService: () => unknown

Command.provideEffect(DatabaseService,
  Effect.succeed(makeDatabaseService())
)
```

### Sync Provision

```typescript
import { Command } from "effect/unstable/cli"
import { ServiceMap } from "effect"

declare const ConfigService: ServiceMap.Service<unknown>
declare const makeConfigService: () => unknown

Command.provideSync(ConfigService, makeConfigService())
```

## Running Commands

Execute with `Command.run` and app metadata:

```typescript
import { Command } from "effect/unstable/cli"
import { Effect } from "effect"

declare const command: Command.Command<string, unknown>

const main = Command.run(command, {
  name: "myapp",
  version: "1.0.0"
})

Effect.runPromise(main(process.argv))
```

Auto-generates help text and handles `--help`, `--version` flags.

## Complete Example

```typescript
import { Command, Argument, Flag } from "effect/unstable/cli"
import { Effect, Console } from "effect"

declare const performDeployment: (env: string, services: ReadonlyArray<string>) => Effect.Effect<void>

const deploy = Command.make(
  "deploy",
  {
    // Positional arg
    environment: Argument.choice("environment", ["dev", "staging", "prod"]),

    // Variadic args
    services: Argument.string("service").pipe(
      Argument.variadic(),
      Argument.withDescription("Services to deploy")
    ),

    // Named flags
    verbose: Flag.boolean("verbose").pipe(
      Flag.withAlias("v"),
      Flag.withDescription("Enable verbose logging")
    ),

    dryRun: Flag.boolean("dry-run").pipe(
      Flag.withDefault(false)
    )
  },
  ({ environment, services, verbose, dryRun }) =>
    Effect.gen(function* () {
      if (verbose) {
        yield* Console.log(`Deploying to ${environment}`)
        yield* Console.log(`Services: ${services.join(", ")}`)
      }

      if (dryRun) {
        yield* Console.log("Dry run - no changes made")
      } else {
        // Actual deployment logic
        yield* performDeployment(environment, services)
      }
    })
)

const main = Command.run(deploy, {
  name: "deploy-tool",
  version: "1.0.0"
})

// Usage:
// deploy-tool --verbose --dry-run staging api gateway
// deploy-tool -v prod api
```

## Key Patterns

1. **Arguments are positional and required** - Use `Argument.optional` or `Argument.withDefault` for optionality
2. **Flags are named and optional** - Use `Flag.withDefault` for defaults
3. **Relaxed placement** - Flags can appear before, after, or between arguments
4. **Use pipe for combinators** - Chain modifications with `.pipe(...)`
5. **Effect.gen for handlers** - Handlers return `Effect<A, E, R>`
6. **Dependency injection** - Use `Command.provide*` for services
7. **Auto-generated help** - `--help` flag added automatically
