# effect/ConfigProvider Surface

Total exports: 19

| Export | Kind | Overview |
|---|---|---|
| `ConfigProvider` | `interface` | The core interface for loading raw configuration data. |
| `constantCase` | `const` | Converts all string path segments to `CONSTANT_CASE` before lookup. |
| `fromDir` | `const` | Creates a `ConfigProvider` that reads configuration from a directory tree on disk, where each file is a leaf value and each directory is a container. |
| `fromDotEnv` | `const` | Creates a `ConfigProvider` by reading and parsing a `.env` file from the file system. |
| `fromDotEnvContents` | `function` | Creates a `ConfigProvider` by parsing the string contents of a `.env` file. |
| `fromEnv` | `function` | Creates a `ConfigProvider` backed by environment variables. |
| `fromUnknown` | `function` | Creates a `ConfigProvider` backed by an in-memory JavaScript value (typically a parsed JSON object). |
| `layer` | `const` | Installs a `ConfigProvider` as the active provider for all downstream effects, replacing any previously installed provider. |
| `layerAdd` | `const` | Creates a Layer that composes a new `ConfigProvider` with the currently active one, rather than replacing it. |
| `make` | `function` | Creates a `ConfigProvider` from a raw lookup function. |
| `makeArray` | `function` | Creates an `Array` node representing an indexed container with a known length. |
| `makeRecord` | `function` | Creates a `Record` node representing an object-like container with known child keys. |
| `makeValue` | `function` | Creates a `Value` node representing a terminal string leaf. |
| `mapInput` | `const` | Transforms the path segments before they reach the underlying store. |
| `nested` | `const` | Scopes a provider so that all lookups are prefixed with the given path segments. |
| `Node` | `type` | A discriminated union describing the shape of a configuration value at a given path. |
| `orElse` | `const` | Returns a provider that falls back to `that` when `self` returns `undefined` for a path. |
| `Path` | `type` | An ordered sequence of string or numeric segments that addresses a node in the configuration tree. |
| `SourceError` | `class` | Typed error indicating that a configuration source could not be read. |
