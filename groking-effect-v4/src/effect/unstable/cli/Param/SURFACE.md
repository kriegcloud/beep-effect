# effect/unstable/cli/Param Surface

Total exports: 59

| Export | Kind | Overview |
|---|---|---|
| `Any` | `type` | Represents any parameter. |
| `AnyArgument` | `type` | Represents any positional argument parameter. |
| `AnyFlag` | `type` | Represents any flag parameter. |
| `argumentKind` | `const` | Kind discriminator for positional argument parameters. |
| `atLeast` | `const` | Wraps an option to require it to be specified at least `min` times. |
| `atMost` | `const` | Wraps an option to allow it to be specified at most `max` times. |
| `between` | `const` | Wraps an option to allow it to be specified multiple times within a range. |
| `boolean` | `const` | Creates a boolean parameter. |
| `choice` | `const` | Constructs command-line params that represent a choice between several string inputs. |
| `choiceWithValue` | `const` | Constructs command-line params that represent a choice between several inputs. The input will be mapped to it's associated value during parsing. |
| `date` | `const` | Creates a date parameter that parses ISO date strings. |
| `directory` | `const` | Creates a directory path parameter. |
| `Environment` | `type` | No summary found in JSDoc. |
| `extractSingleParams` | `const` | Extracts all Single params from a potentially nested param structure. This handles all param combinators including Map, Transform, Optional, and Variadic. |
| `file` | `const` | Creates a file path parameter. |
| `fileParse` | `const` | Creates a param that reads and parses the content of the specified file. |
| `fileSchema` | `const` | Creates a parameter that reads and validates file content using a schema. |
| `fileText` | `const` | Creates a parameter that reads and returns file content as a string. |
| `filter` | `const` | Filters parsed values, failing with a custom error message if the predicate returns false. |
| `filterMap` | `const` | Filters and transforms parsed values, failing with a custom error message if the filter function returns None. |
| `flagKind` | `const` | Kind discriminator for flag parameters. |
| `Flags` | `type` | Map of flag names to their provided string values. Multiple occurrences of a flag produce multiple values. |
| `float` | `const` | Creates a floating-point number parameter. |
| `getParamMetadata` | `const` | Gets param metadata by traversing the structure. |
| `getUnderlyingSingleOrThrow` | `const` | Gets the underlying Single param from a potentially nested param structure. Throws an error if there are no singles or multiple singles found. |
| `integer` | `const` | Creates an integer parameter. |
| `isFlagParam` | `const` | Type guard to check if a Single param is a flag (not an argument). |
| `isParam` | `const` | Type guard to check if a value is a Param. |
| `isSingle` | `const` | Type guard to check if a param is a Single param (not composed). |
| `keyValuePair` | `const` | Creates a param that parses key=value pairs. Useful for options that accept configuration values. |
| `makeSingle` | `const` | No summary found in JSDoc. |
| `map` | `const` | Transforms the parsed value of an option using a mapping function. |
| `Map` | `interface` | No summary found in JSDoc. |
| `mapEffect` | `const` | Transforms the parsed value of an option using an effectful mapping function. |
| `mapTryCatch` | `const` | Transforms the parsed value of an option using a function that may throw, converting any thrown errors into failure messages. |
| `none` | `const` | Creates an empty sentinel parameter that always fails to parse. |
| `optional` | `const` | Creates an optional option that returns None when not provided. |
| `Optional` | `interface` | No summary found in JSDoc. |
| `orElse` | `const` | Provides a fallback param to use if this param fails to parse. |
| `orElseResult` | `const` | Provides a fallback param, wrapping results in Either to distinguish which param succeeded. |
| `Param` | `interface` | No summary found in JSDoc. |
| `ParamKind` | `type` | No summary found in JSDoc. |
| `Parse` | `type` | No summary found in JSDoc. |
| `ParsedArgs` | `interface` | Input context passed to `Param.parse` implementations. - `flags`: already-collected flag values by canonical flag name - `arguments`: remaining positional arguments to be consumed |
| `path` | `const` | Creates a path parameter that accepts file or directory paths. |
| `redacted` | `const` | Creates a redacted parameter for sensitive data like passwords. The value is masked in help output and logging. |
| `Single` | `interface` | No summary found in JSDoc. |
| `string` | `const` | Creates a string parameter. |
| `Transform` | `interface` | No summary found in JSDoc. |
| `variadic` | `const` | Creates a variadic parameter that can be specified multiple times. |
| `Variadic` | `interface` | No summary found in JSDoc. |
| `VariadicParamOptions` | `type` | Represent options which can be used to configure variadic parameters. |
| `withAlias` | `const` | Adds an alias to an option. |
| `withDefault` | `const` | Makes an option optional by providing a default value. |
| `withDescription` | `const` | Adds a description to an option for help text. |
| `withFallbackConfig` | `const` | Adds a fallback config that is loaded when a required parameter is missing. |
| `withFallbackPrompt` | `const` | Adds a fallback prompt that is shown when a required parameter is missing. |
| `withMetavar` | `const` | Sets a custom metavar (placeholder name) for the param in help documentation. |
| `withSchema` | `const` | Validates parsed values against a Schema, providing detailed error messages. |
