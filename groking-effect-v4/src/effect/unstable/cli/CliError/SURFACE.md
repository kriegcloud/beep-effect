# effect/unstable/cli/CliError Surface

Total exports: 10

| Export | Kind | Overview |
|---|---|---|
| `CliError` | `type` | Union type representing all possible CLI error conditions. |
| `DuplicateOption` | `class` | Error thrown when duplicate option names are detected between parent and child commands. |
| `InvalidValue` | `class` | Error thrown when an option or argument value is invalid. |
| `isCliError` | `const` | Type guard to check if a value is a CLI error. |
| `MissingArgument` | `class` | Error thrown when a required positional argument is missing. |
| `MissingOption` | `class` | Error thrown when a required option is missing. |
| `ShowHelp` | `class` | Control flow indicator when help is requested via --help flag. This is not an error but uses the error channel for control flow. |
| `UnknownSubcommand` | `class` | Error thrown when an unknown subcommand is encountered. |
| `UnrecognizedOption` | `class` | Error thrown when an unrecognized option is encountered. |
| `UserError` | `class` | Wrapper for user (handler) errors to unify under CLI error channel when desired. |
