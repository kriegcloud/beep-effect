# effect/Config Surface

Total exports: 35

| Export | Kind | Overview |
|---|---|---|
| `all` | `function` | Combines multiple configs into a single config that parses all of them. |
| `boolean` | `function` | Creates a config for a boolean value parsed from common string representations. |
| `Boolean` | `const` | A `Schema.Codec` for boolean values encoded as strings. |
| `Config` | `interface` | A recipe for extracting a typed value `T` from a `ConfigProvider`. |
| `ConfigError` | `class` | The error type produced when config loading or validation fails. |
| `date` | `function` | Creates a config for a `Date` value parsed from a string. |
| `duration` | `function` | Creates a config for a `Duration` value parsed from a human-readable string. |
| `Duration` | `const` | A `Schema.Codec` for `Duration` values encoded as strings. |
| `fail` | `function` | Creates a config that always fails with the given error. |
| `FalseValues` | `const` | No summary found in JSDoc. |
| `finite` | `function` | Creates a config for a finite number (rejects `NaN` and `Infinity`). |
| `int` | `function` | Creates a config for an integer value. Rejects floats. |
| `isConfig` | `const` | Returns `true` if `u` is a `Config` instance. |
| `literal` | `function` | Creates a config that only accepts a specific literal value. |
| `logLevel` | `function` | Creates a config for a log level string. |
| `LogLevel` | `const` | A `Schema.Codec` for `LogLevel` string literals. |
| `make` | `function` | Creates a `Config` from a raw parsing function. |
| `map` | `const` | Transforms the parsed value of a config with a pure function. |
| `mapOrFail` | `const` | Transforms the parsed value with a function that may fail. |
| `nonEmptyString` | `function` | Creates a config for a non-empty string value. Fails if the value is an empty string. |
| `number` | `function` | Creates a config for a numeric value (including `NaN`, `Infinity`). |
| `option` | `const` | Makes a config optional: returns `Some(value)` on success and `None` when data is missing. |
| `orElse` | `const` | Falls back to another config when parsing fails with a `ConfigError`. |
| `port` | `function` | Creates a config for a port number (integer in 1–65535). |
| `Port` | `const` | A `Schema.Codec` for port numbers (integers in 1–65535). |
| `Record` | `const` | A `Schema.Codec` for key-value record types that can also be parsed from a flat comma-separated string. |
| `redacted` | `function` | Creates a config for a redacted string value. The parsed result is wrapped in a `Redacted` container that hides the value from logs and `toString`. |
| `schema` | `function` | Creates a `Config<T>` from a `Schema.Codec`. |
| `string` | `function` | Creates a config for a single string value. |
| `succeed` | `function` | Creates a config that always succeeds with the given value, ignoring the provider entirely. |
| `TrueValues` | `const` | No summary found in JSDoc. |
| `unwrap` | `const` | Constructs a `Config<T>` from a value matching `Wrap<T>`. |
| `url` | `function` | Creates a config for a `URL` value parsed from a string. |
| `withDefault` | `const` | Provides a fallback value when the config fails due to missing data. |
| `Wrap` | `type` | Utility type that recursively replaces primitives with `Config` in a nested structure. |
