# Effect CLI

Build type-safe command-line applications with Effect CLI module for argument parsing, validation, and dependency injection.

## Import Pattern

```typescript
import { Command, Args, Options } from "@effect/cli"
```

## Command Creation

Use `Command.make` to create commands with typed arguments and options:

```typescript
import { Command, Args, Options } from "@effect/cli"
import { Console } from "effect"

const command = Command.make(
  "greet",
  {
    name: Args.text({ name: "name" }),
    times: Options.integer("times").pipe(Options.withDefault(1))
  },
  ({ name, times }) => Console.log(`Hello ${name}!`.repeat(times))
)
```

**Handler signature**: Receives an object with all parsed args and options.

## Positional Arguments (Args)

Arguments are **required by default** and parsed in order.

### Basic Types

```typescript
import { Args } from "@effect/cli"

Args.text({ name: "username" })        // string
Args.integer({ name: "count" })        // number (integer)
Args.float({ name: "amount" })         // number (float)
Args.boolean({ name: "enabled" })      // boolean
Args.date({ name: "deadline" })        // Date
```

### File System Arguments

```typescript
import { Args } from "@effect/cli"

Args.file({ name: "input" })           // path to existing file
Args.directory({ name: "output" })     // path to existing directory
```

### Choice Arguments

```typescript
import { Args } from "@effect/cli"

Args.choice({ name: "env" }, ["dev", "staging", "prod"])
```

### Argument Combinators

Chain these on any Args type:

```typescript
import { Args } from "@effect/cli"

// Make optional (returns Option<T>)
Args.text({ name: "config" }).pipe(Args.optional)

// Repeated (returns Array<T>)
Args.text({ name: "file" }).pipe(Args.repeated)

// Cardinality constraints
Args.text({ name: "file" }).pipe(Args.atLeast(1))
Args.text({ name: "file" }).pipe(Args.atMost(3))
Args.text({ name: "file" }).pipe(Args.between(1, 5))

// Default value
Args.integer({ name: "port" }).pipe(Args.withDefault(8080))

// Description for help text
Args.text({ name: "user" }).pipe(
  Args.withDescription("Username to authenticate")
)
```

## Named Options (Flags)

Options are **named flags** with `--name` or `-alias` syntax.

### Basic Types

```typescript
import { Options } from "@effect/cli"

Options.boolean("verbose")             // --verbose
Options.text("config")                 // --config=value
Options.integer("port")                // --port=8080
Options.float("ratio")                 // --ratio=0.5
Options.date("since")                  // --since=2024-01-01
```

### Advanced Options

```typescript
import { Options } from "@effect/cli"

// File system options
Options.file("input")                  // --input=file.txt
Options.directory("output")            // --output=./dist

// Choice from allowed values
Options.choice("env", ["dev", "prod"]) // --env=dev

// Key-value map
Options.keyValueMap("header")          // --header key=value
```

### Option Combinators

```typescript
import { Options } from "@effect/cli"

// Short alias
Options.boolean("verbose").pipe(Options.withAlias("v"))
// Usage: --verbose or -v

// Default value
Options.integer("port").pipe(Options.withDefault(3000))

// Make optional (returns Option<T>)
Options.text("token").pipe(Options.optional)

// Description for help text
Options.text("config").pipe(
  Options.withDescription("Path to configuration file")
)
```

### Critical Rule: Options Before Args

**Options MUST precede positional arguments** in CLI invocation:

```bash
# CORRECT
mycli --verbose --port=8080 file1.txt file2.txt

# WRONG
mycli file1.txt --verbose file2.txt --port=8080
```

## Subcommands

Create command hierarchies with `Command.withSubcommands`:

```typescript
import { Command, Args } from "@effect/cli"
import { Console } from "effect"

const init = Command.make("init", {}, () =>
  Console.log("Initializing...")
)

const deploy = Command.make("deploy", {
  env: Args.choice({ name: "env" }, ["dev", "prod"])
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
import { Command, Options } from "@effect/cli"
import { Console, Effect } from "effect"

const parent = Command.make("parent", {
  verbose: Options.boolean("verbose")
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
import { Command, Args } from "@effect/cli"
import { Effect, Context, Layer } from "effect"

declare const HttpClient: Context.Tag<unknown, { get: (url: string) => Effect.Effect<unknown> }>
declare const HttpClientLive: Layer.Layer<unknown>

const command = Command.make("fetch", {
  url: Args.text({ name: "url" })
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
import { Command } from "@effect/cli"
import { Effect, Context } from "effect"

declare const DatabaseService: Context.Tag<unknown, unknown>
declare const makeDatabaseService: () => unknown

Command.provideEffect(DatabaseService,
  Effect.succeed(makeDatabaseService())
)
```

### Sync Provision

```typescript
import { Command } from "@effect/cli"
import { Context } from "effect"

declare const ConfigService: Context.Tag<unknown, unknown>
declare const makeConfigService: () => unknown

Command.provideSync(ConfigService, makeConfigService())
```

## Running Commands

Execute with `Command.run` and app metadata:

```typescript
import { Command } from "@effect/cli"
import { Effect } from "effect"

declare const command: Command.Command<unknown>

const main = Command.run(command, {
  name: "myapp",
  version: "1.0.0"
})

Effect.runPromise(main(process.argv))
```

Auto-generates help text and handles `--help`, `--version` flags.

## Complete Example

```typescript
import { Command, Args, Options } from "@effect/cli"
import { Effect, Console } from "effect"

declare const performDeployment: (env: string, services: Array<string>) => Effect.Effect<void>

const deploy = Command.make(
  "deploy",
  {
    // Positional arg
    environment: Args.choice({
      name: "environment"
    }, ["dev", "staging", "prod"]),

    // Optional args
    services: Args.text({ name: "service" }).pipe(
      Args.repeated,
      Args.withDescription("Services to deploy")
    ),

    // Named options (must come before args in usage)
    verbose: Options.boolean("verbose").pipe(
      Options.withAlias("v"),
      Options.withDescription("Enable verbose logging")
    ),

    dryRun: Options.boolean("dry-run").pipe(
      Options.withDefault(false)
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

1. **Arguments are positional and required** - Use `Args.optional` or `Args.withDefault` for optionality
2. **Options are named and optional** - Use `Options.withDefault` for defaults
3. **Options before args** - In CLI invocation: `cmd --opt=val arg1 arg2`
4. **Use pipe for combinators** - Chain modifications with `.pipe(...)`
5. **Effect.gen for handlers** - Handlers return `Effect<A, E, R>`
6. **Dependency injection** - Use `Command.provide*` for services
7. **Auto-generated help** - `--help` flag added automatically
