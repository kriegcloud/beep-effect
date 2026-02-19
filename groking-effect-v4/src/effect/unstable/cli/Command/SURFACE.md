# effect/unstable/cli/Command Surface

Total exports: 16

| Export | Kind | Overview |
|---|---|---|
| `Command` | `interface` | Represents a CLI command with its configuration, handler, and metadata. |
| `CommandContext` | `interface` | Service context for a specific command, enabling subcommands to access their parent's parsed configuration. |
| `Environment` | `type` | The environment required by CLI commands, including file system and path operations. |
| `Error` | `type` | A utility type to extract the error type from a `Command`. |
| `isCommand` | `const` | No summary found in JSDoc. |
| `make` | `const` | Creates a Command from a name, optional config, optional handler function, and optional description. |
| `ParsedTokens` | `interface` | Represents the parsed tokens from command-line input before validation. |
| `provide` | `const` | Provides the handler of a command with the services produced by a layer that optionally depends on the command-line input to be created. |
| `provideEffect` | `const` | Provides the handler of a command with the service produced by an effect that optionally depends on the command-line input to be created. |
| `provideEffectDiscard` | `const` | Allows for execution of an effect, which optionally depends on command-line input to be created, prior to executing the handler of a command. |
| `provideSync` | `const` | Provides the handler of a command with the implementation of a service that optionally depends on the command-line input to be constructed. |
| `run` | `const` | Runs a command with the provided input arguments. |
| `runWith` | `const` | Runs a command with explicitly provided arguments instead of using process.argv. |
| `withDescription` | `const` | Sets the description for a command. |
| `withHandler` | `const` | Adds or replaces the handler for a command. |
| `withSubcommands` | `const` | Adds subcommands to a command, creating a hierarchical command structure. |
