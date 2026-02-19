# effect/unstable/cli/Argument Surface

Total exports: 33

| Export | Kind | Overview |
|---|---|---|
| `Argument` | `interface` | Represents a positional command-line argument. |
| `atLeast` | `const` | Creates a variadic argument that requires at least n values. |
| `atMost` | `const` | Creates a variadic argument that accepts at most n values. |
| `between` | `const` | Creates a variadic argument that accepts between min and max values. |
| `choice` | `const` | Creates a positional choice argument. |
| `choiceWithValue` | `const` | Creates a positional choice argument with custom value mapping. |
| `date` | `const` | Creates a positional date argument. |
| `directory` | `const` | Creates a positional directory path argument. |
| `file` | `const` | Creates a positional file path argument. |
| `fileParse` | `const` | Creates a positional argument that reads and validates file content using a schema. |
| `fileSchema` | `const` | Creates a positional argument that reads and validates file content using a schema. |
| `fileText` | `const` | Creates a positional argument that reads file content as a string. |
| `filter` | `const` | Filters parsed values, failing with a custom error message if the predicate returns false. |
| `filterMap` | `const` | Filters and transforms parsed values, failing with a custom error message if the filter function returns None. |
| `float` | `const` | Creates a positional float argument. |
| `integer` | `const` | Creates a positional integer argument. |
| `map` | `const` | Transforms the parsed value of a positional argument. |
| `mapEffect` | `const` | Transforms the parsed value of a positional argument using an effectful function. |
| `mapTryCatch` | `const` | Transforms the parsed value of a positional argument using a function that may throw. |
| `none` | `const` | Creates an empty sentinel argument that always fails to parse. |
| `optional` | `const` | Makes a positional argument optional. |
| `orElse` | `const` | Provides a fallback argument to use if this argument fails to parse. |
| `orElseResult` | `const` | Provides a fallback argument, wrapping results in Result to distinguish which succeeded. |
| `path` | `const` | Creates a positional path argument. |
| `redacted` | `const` | Creates a positional redacted argument that obscures its value. |
| `string` | `const` | Creates a positional string argument. |
| `variadic` | `const` | Creates a variadic positional argument that accepts multiple values. |
| `withDefault` | `const` | Provides a default value for a positional argument. |
| `withDescription` | `const` | Adds a description to a positional argument. |
| `withFallbackConfig` | `const` | Adds a fallback config that is loaded when a required argument is missing. |
| `withFallbackPrompt` | `const` | Adds a fallback prompt that is shown when a required argument is missing. |
| `withMetavar` | `const` | Sets a custom metavar (placeholder name) for the argument in help documentation. |
| `withSchema` | `const` | Validates parsed values against a Schema. |
