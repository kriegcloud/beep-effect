# effect/unstable/cli/Flag Surface

Total exports: 35

| Export | Kind | Overview |
|---|---|---|
| `atLeast` | `const` | Requires a flag to be specified at least a minimum number of times. |
| `atMost` | `const` | Limits a flag to be specified at most a maximum number of times. |
| `between` | `const` | Constrains a flag to be specified between a minimum and maximum number of times. |
| `boolean` | `const` | Creates a boolean flag that can be enabled or disabled. |
| `choice` | `const` | Simpler variant of `choiceWithValue` which maps each string to itself. |
| `choiceWithValue` | `const` | Constructs option parameters that represent a choice between several inputs. Each tuple maps a string flag value to an associated typed value. |
| `date` | `const` | Creates a date flag that accepts date input in ISO format. |
| `directory` | `const` | Creates a directory path flag that accepts directory paths with optional existence validation. |
| `file` | `const` | Creates a file path flag that accepts file paths with optional existence validation. |
| `fileParse` | `const` | Creates a flag that reads and parses the content of the specified file. |
| `fileSchema` | `const` | Creates a flag that reads and validates file content using the specified schema. |
| `fileText` | `const` | Creates a flag that reads and returns file content as a string. |
| `filter` | `const` | Filters a flag value based on a predicate, failing with a custom error if the predicate returns false. |
| `filterMap` | `const` | Transforms and filters a flag value, failing with a custom error if the transformation returns None. |
| `Flag` | `interface` | Represents a command-line flag. |
| `float` | `const` | Creates a float flag that accepts decimal number input. |
| `integer` | `const` | Creates an integer flag that accepts whole number input. |
| `keyValuePair` | `const` | Creates a flag that parses key=value pairs. Useful for options that accept configuration values. |
| `map` | `const` | Transforms the parsed value of a flag using a mapping function. |
| `mapEffect` | `const` | Transforms the parsed value using an Effect that can perform IO operations. |
| `mapTryCatch` | `const` | Transforms the parsed value using a function that might throw, with error handling. |
| `none` | `const` | Creates an empty sentinel flag that always fails to parse. This is useful for creating placeholder flags or for combinators. |
| `optional` | `const` | Makes a flag optional, returning an Option type that can be None if not provided. |
| `orElse` | `const` | Provides an alternative flag if the first one fails to parse. |
| `orElseResult` | `const` | Tries to parse with the first flag, then the second, returning a Result that indicates which succeeded. |
| `path` | `const` | Creates a path flag that accepts file system path input with validation options. |
| `redacted` | `const` | Creates a redacted flag that securely handles sensitive string input. |
| `string` | `const` | Creates a string flag that accepts text input. |
| `withAlias` | `const` | Adds an alias to a flag, allowing it to be referenced by multiple names. |
| `withDefault` | `const` | Provides a default value for a flag when it's not specified. |
| `withDescription` | `const` | Adds a description to a flag for help documentation. |
| `withFallbackConfig` | `const` | Adds a fallback config that is loaded when a required flag is missing. |
| `withFallbackPrompt` | `const` | Adds a fallback prompt that is shown when a required flag is missing. |
| `withMetavar` | `const` | Sets a custom metavar (placeholder name) for the flag in help documentation. |
| `withSchema` | `const` | Validates and transforms a flag value using a Schema codec. |
