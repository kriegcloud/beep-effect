---
name: effect-config-v4
description: "Effect v4 Config and ConfigProvider patterns for declarative, schema-driven configuration loading from env vars, JSON objects, .env files, and directory trees. Use when working with Config, ConfigProvider, Config.schema, Config.all, Config.withDefault, Config.nested, ConfigProvider.fromEnv, ConfigProvider.fromUnknown, ConfigProvider.fromDotEnv, ConfigProvider.constantCase, or any config-related code in Effect v4. Triggers on Config.string, Config.number, Config.boolean, Config.schema, Config.all, Config.withDefault, Config.nested, Config.redacted, ConfigProvider, ConfigProvider.fromEnv, ConfigProvider.fromUnknown, ConfigProvider.fromDotEnv, ConfigProvider.fromDir, ConfigProvider.constantCase, ConfigError."
---

# Effect Config & ConfigProvider (v4)

Declarative, schema-driven configuration loading.

```ts
import { Config, ConfigProvider, Effect, Schema } from "effect";
```

## Mental Model

- **`Config<T>`** is a recipe for extracting a typed value from a
  `ConfigProvider`. NOT an Effect. Implements `Yieldable`.
- **`ConfigProvider`** is the data source (env vars, JSON, `.env` files,
  directory trees). Registered as a `ServiceMap.Reference` defaulting to
  `fromEnv()`.
- **`ConfigError`** wraps either `SourceError` (provider I/O failure) or
  `SchemaError` (validation/decoding failure).

## Config.schema (Universal Constructor)

The schema backed value constructors delegate to `Config.schema`. Standalone
helpers like `Config.succeed` and `Config.fail` do not. `Config.schema` takes a
`Schema.Codec` and an optional path:

```ts
const DbConfig = Config.schema(
  Schema.Struct({
    host: Schema.String,
    port: Schema.Int,
  }),
  "db",
);

const provider = ConfigProvider.fromUnknown({
  db: { host: "localhost", port: 5432 },
});
Effect.runSync(DbConfig.parse(provider));
// { host: "localhost", port: 5432 }
```

Signature: `schema<T, E>(codec: Schema.Codec<T, E>, path?: string | ConfigProvider.Path): Config<T>`

The `path` parameter sets root path segments. A string becomes `[string]`,
an array is used as-is, `undefined` means root.

Internally, `Config.schema` converts the codec via `Schema.toCodecStringTree`
so every leaf decodes from a string. This is why `Config.schema(Schema.Number, "port")`
with env var `port=8080` works: the string `"8080"` is automatically decoded
to number `8080`. No explicit `NumberFromString` needed.

## Convenience Constructors

The schema backed value constructors take an optional `name` parameter that sets the root path
segment. Omit it when the config is part of a larger schema.

| Constructor                    | Schema used                      | Notes                                        |
| ------------------------------ | -------------------------------- | -------------------------------------------- |
| `Config.string(name?)`         | `Schema.String`                  |                                              |
| `Config.nonEmptyString(name?)` | `Schema.NonEmptyString`          | Rejects `""`                                 |
| `Config.number(name?)`         | `Schema.Number`                  | Allows NaN/Infinity                          |
| `Config.finite(name?)`         | `Schema.Finite`                  | Rejects NaN/Infinity                         |
| `Config.int(name?)`            | `Schema.Int`                     | Rejects floats                               |
| `Config.boolean(name?)`        | `Config.Boolean`                 | `true/false/yes/no/on/off/1/0/y/n`           |
| `Config.port(name?)`           | `Config.Port`                    | Integer 1-65535                              |
| `Config.duration(name?)`       | `Config.Duration`                | `"10 seconds"`, `"500 millis"`               |
| `Config.logLevel(name?)`       | `Config.LogLevel`                | `All/Fatal/Error/Warn/Info/Debug/Trace/None` |
| `Config.redacted(name?)`       | `Schema.Redacted(Schema.String)` | Value hidden in logs/errors                  |
| `Config.url(name?)`            | `Schema.URL`                     | Parsed `URL` object                          |
| `Config.date(name?)`           | `Schema.DateValid`               | Parsed `Date`                                |
| `Config.literal(value, name?)` | `Schema.Literal(value)`          | Exact match                                  |
| `Config.succeed(value)`        | n/a                              | Always succeeds, ignores provider            |
| `Config.fail(err)`             | n/a                              | Always fails with given error                |

## Built-in Codec Schemas

These are exported as schemas you can pass to `Config.schema` directly or
compose into larger schemas:

**`Config.Boolean`**: Union of `true/false/yes/no/on/off/1/0/y/n` decoded
to `boolean`.

**`Config.Duration`**: String decoded to `Duration` via `Duration.fromInput`.

**`Config.Port`**: `Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 65535 }))`.

**`Config.LogLevel`**: `Schema.Literals(["All", "Fatal", "Error", ...])`.

**`Config.Record(key, value, options?)`**: Accepts either a record from the
provider or a flat comma-separated string like `"key1=val1,key2=val2"`.
Options: `separator` (default `","`) and `keyValueSeparator` (default `"="`).

```ts
const attrs = Config.schema(
  Config.Record(Schema.String, Schema.String),
  "OTEL_RESOURCE_ATTRIBUTES",
);
```

## Yieldable Protocol

`Config<T>` implements `Effect.Yieldable`, NOT `Effect`. Inside `Effect.gen`,
`yield*` resolves the current `ConfigProvider` from the service map and
parses:

```ts
const program = Effect.gen(function*() {
  const host = yield* Config.string("HOST");
  const port = yield* Config.port("PORT");
  return { host, port };
});
```

Outside generators, call `.asEffect()` to get a pipeable
`Effect<T, ConfigError>`:

```ts
Config.port("PORT").asEffect().pipe(
  Effect.flatMap((port) => startServer(port)),
);
```

To parse against a specific provider (bypassing the service map):

```ts
const result = Effect.runSync(Config.port("PORT").parse(provider));
```

## Combinators

### `Config.map`

Transform the parsed value with a pure function:

```ts
Config.string("HOST").pipe(
  Config.map((s) => s.toUpperCase()),
);
```

### `Config.mapOrFail`

Transform with a function that returns `Effect<B, ConfigError>`:

```ts
Config.string("HOST").pipe(
  Config.mapOrFail((s) => Effect.succeed(s.trim())),
);
```

### `Config.orElse`

Fall back to another config on ANY `ConfigError`:

```ts
Config.string("HOST").pipe(
  Config.orElse(() => Config.succeed("localhost")),
);
```

### `Config.withDefault`

Provide a fallback value on MISSING DATA ONLY. Validation errors
(wrong type, out of range) still propagate:

```ts
Config.port("PORT").pipe(Config.withDefault(3000));
```

This is critical: `Config.finite("a").pipe(Config.withDefault(0))` with
`{ a: "notanumber" }` still FAILS. The value is present but invalid.

### `Config.option`

Returns `Some(value)` on success, `None` on missing data. Like
`withDefault`, validation errors propagate:

```ts
const maybePort = Config.option(Config.port("PORT"));
```

### `Config.all`

Combine multiple configs. Accepts a tuple, iterable, or record:

```ts
const dbConfig = Config.all({
  host: Config.string("host"),
  port: Config.port("port"),
});
```

Output keys come from the record keys, not the config name parameters.

### `Config.nested`

Scope a config under a named prefix:

```ts
const dbConfig = Config.all({
  host: Config.string("host"),
  port: Config.port("port"),
}).pipe(Config.nested("database"));
```

With `fromUnknown`, this means an extra object level. With `fromEnv`, it
means a `_`-separated prefix (`database_host`, `database_port`). Multiple
`nested` calls compose (outermost first).

## Wrap / Unwrap

`Config.Wrap<T>` recursively replaces primitives with `Config`. Callers can
pass either a single `Config<T>` or a record of individual configs:

```ts
interface Options {
  host: string;
  port: number;
}

const makeLayer = (config: Config.Wrap<Options>) =>
  Config.unwrap(config).asEffect().pipe(
    Effect.map((opts) => opts),
  );

makeLayer({ host: Config.string("HOST"), port: Config.port("PORT") });
makeLayer(Config.schema(Schema.Struct({ host: Schema.String, port: Schema.Int })));
```

## ConfigProvider

### Node Types

Providers return `Node | undefined` from `load`/`get`:

| Node     | Shape                                                   | Meaning                          |
| -------- | ------------------------------------------------------- | -------------------------------- |
| `Value`  | `{ _tag: "Value", value: string }`                      | Terminal string leaf             |
| `Record` | `{ _tag: "Record", keys: Set<string>, value?: string }` | Object container with child keys |
| `Array`  | `{ _tag: "Array", length: number, value?: string }`     | Indexed container                |

`undefined` means "not found". The optional `value` field on Record/Array
allows co-located values (a key can be both a leaf and a container).

Constructors: `ConfigProvider.makeValue(s)`, `ConfigProvider.makeRecord(keys, value?)`,
`ConfigProvider.makeArray(length, value?)`.

### ConfigProvider.fromEnv

The default provider. Reads from `process.env` merged with `import.meta.env`:

```ts
const provider = ConfigProvider.fromEnv({
  env: { DATABASE_HOST: "localhost", DATABASE_PORT: "5432" },
});
```

Builds a trie by splitting env var names on `_`. Path segments are joined
with `_` for direct lookup AND the trie is navigated for child discovery.
`DATABASE_HOST=x` is accessible at both `["DATABASE_HOST"]` and
`["DATABASE", "HOST"]`.

When all children of a trie node have purely numeric names, the node is
reported as an Array. Otherwise a Record. Never fails with `SourceError`.

### ConfigProvider.fromUnknown

Traverses a plain JS object. String segments index object keys, numeric
segments index arrays. Primitives (numbers, booleans, bigints) are
stringified via `String()`. `null`/`undefined` return `undefined`. Never
fails:

```ts
const provider = ConfigProvider.fromUnknown({
  database: { host: "localhost", port: 5432, tags: ["primary", "fast"] },
});
```

### ConfigProvider.fromDotEnvContents

Parses a `.env` format string. Supports `export` prefixes, quoting, inline
comments, escaped newlines. Optional variable expansion:

```ts
const provider = ConfigProvider.fromDotEnvContents(
  `
HOST=localhost
PORT=3000
SECRET="my secret value"
`,
  { expandVariables: true },
);
```

Delegates to `fromEnv` internally.

### ConfigProvider.fromDotEnv

Reads a `.env` file from disk. Requires `FileSystem` service. Returns an
Effect:

```ts
const provider = yield * ConfigProvider.fromDotEnv({ path: ".env.local" });
```

### ConfigProvider.fromDir

Reads a directory tree (files as values, directories as records). For
Kubernetes ConfigMap/Secret mounts. Requires `Path` + `FileSystem`:

```ts
const provider = yield * ConfigProvider.fromDir({ rootPath: "/etc/myapp" });
```

### ConfigProvider.make

Build a custom provider from a raw lookup function:

```ts
const provider = ConfigProvider.make((path) => {
  const key = path.join(".");
  const value = myStore[key];
  return Effect.succeed(
    value !== undefined ? ConfigProvider.makeValue(value) : undefined,
  );
});
```

## ConfigProvider Combinators

### `ConfigProvider.orElse`

Fall back to another provider when the first returns `undefined`. Only
falls back on missing data, NOT on `SourceError`:

```ts
const combined = ConfigProvider.orElse(envProvider, defaultsProvider);
```

### `ConfigProvider.nested`

Prepend path segments to all lookups:

```ts
provider.pipe(ConfigProvider.nested("APP"));
```

### `ConfigProvider.mapInput`

Transform path segments before lookup:

```ts
provider.pipe(
  ConfigProvider.mapInput((path) =>
    path.map((seg) => typeof seg === "string" ? seg.toUpperCase() : seg)
  ),
);
```

### `ConfigProvider.constantCase`

Converts camelCase path segments to `SCREAMING_SNAKE_CASE`. The most common
pattern for bridging Schema struct keys to env vars:

```ts
const provider = ConfigProvider.fromEnv().pipe(ConfigProvider.constantCase);
```

With this, a Schema struct with key `databaseHost` resolves to env var
`DATABASE_HOST`.

Composition order matters: `constantCase` applied after `nested` also
transforms the prefix segments.

## Layer Integration

### `ConfigProvider.layer`

Replace the active ConfigProvider for all downstream effects:

```ts
const TestConfig = ConfigProvider.layer(
  ConfigProvider.fromUnknown({ host: "localhost", port: 8080 }),
);

const program = Effect.gen(function*() {
  const host = yield* Config.string("host");
  return host;
}).pipe(Effect.provide(TestConfig));
```

Accepts a plain `ConfigProvider` or an `Effect<ConfigProvider>`.

### `ConfigProvider.layerAdd`

Compose with the current provider instead of replacing:

```ts
const Defaults = ConfigProvider.layerAdd(
  ConfigProvider.fromUnknown({ HOST: "localhost", PORT: "3000" }),
);
```

By default, the new provider is the fallback. Use `{ asPrimary: true }` to
make it primary:

```ts
const Overrides = ConfigProvider.layerAdd(overrideProvider, { asPrimary: true });
```

### `ConfigProvider.ConfigProvider` (Service Reference)

A `ServiceMap.Reference<ConfigProvider>` with default `fromEnv()`. Override
directly via `Effect.provideService`:

```ts
effect.pipe(
  Effect.provideService(ConfigProvider.ConfigProvider, myProvider),
);
```

## Error Handling

`ConfigError` wraps either:

- `ConfigProvider.SourceError` (I/O failure from provider)
- `Schema.SchemaError` (validation/decoding failure)

Schema errors include path context (e.g., `at ["db", "port"]`).

`Config.withDefault` and `Config.option` only recover from MISSING data
errors. The internal `isMissingDataOnly` check returns true for:

- `MissingKey` issues
- `InvalidType`/`InvalidValue` where actual is `undefined`/`None`
- Composite, AnyOf, OneOf, Encoding, Pointer, and Filter shapes where the nested issues are all missing data

Present but invalid values always propagate.

Redacted configs never leak values in error messages. Errors show
`<redacted>` instead of the actual value.

## Internals: StringTree Bridge

`Config.schema` works through a pipeline:

1. `Schema.toCodecStringTree(codec)` rewrites the AST so all leaves decode
   from strings (Number from string, Boolean from string, etc.)
2. `recur(encodedAST, provider, path)` walks the encoded AST and loads data
   from the provider into a `StringTree` (strings, records, arrays,
   undefined at leaves)
3. `decodeUnknownEffect(stringTreeCodec)` decodes the StringTree into `T`
4. Schema errors are wrapped with path context, then wrapped in `ConfigError`

The `recur` function handles:

- `Objects` AST: iterates property signatures, loads each key from provider
- `Arrays` AST: checks provider node, loads by numeric index
- `Union` AST: dumps the full provider subtree and lets downstream decode
- `Suspend` AST: evaluates the thunk and recurses
- Default (primitives): loads the leaf value from provider

## Testing Patterns

Use `ConfigProvider.fromUnknown` for deterministic in-memory config:

```ts
import { it } from "@effect/vitest";

const TestConfig = ConfigProvider.layer(
  ConfigProvider.fromUnknown({
    database: { host: "localhost", port: 5432 },
    logLevel: "Debug",
  }),
);

it.effect("reads config", () =>
  Effect.gen(function*() {
    const host = yield* Config.string("host").pipe(Config.nested("database"));
    expect(host).toBe("localhost");
  }).pipe(Effect.provide(TestConfig)));
```

Use `ConfigProvider.fromEnv({ env: {...} })` for controlled env vars:

```ts
const TestConfig = ConfigProvider.layer(
  ConfigProvider.fromEnv({
    env: { APP_HOST: "localhost", APP_PORT: "3000" },
  }),
);
```

Parse directly without service map:

```ts
const config = Config.schema(
  Schema.Struct({
    host: Schema.String,
    port: Schema.Int,
  }),
  "db",
);

const result = Effect.runSync(
  config.parse(ConfigProvider.fromUnknown({ db: { host: "localhost", port: 5432 } })),
);
```

## v3 to v4 Changes

| v3                                       | v4                                                 |
| ---------------------------------------- | -------------------------------------------------- |
| `Config` extends `Effect`                | `Config` extends `Yieldable` (not Effect)          |
| Per-type primitives only                 | `Config.schema(codec, path)` is universal          |
| `Config.secret`                          | `Config.redacted`                                  |
| `Config.integer`                         | `Config.int`                                       |
| `Config.array(config)`                   | `Config.schema(Schema.Array(schema))`              |
| `Config.hashSet` / `Config.hashMap`      | Removed                                            |
| `Config.validate`                        | `Config.mapOrFail` or schema checks                |
| `Config.repeat` / `Config.chunk`         | Removed                                            |
| `Config.withDescription`                 | Removed                                            |
| `Config.zip` / `Config.zipWith`          | `Config.all([a, b])`                               |
| `Config.suspend` / `Config.sync`         | Removed                                            |
| `Config.withDefault(value)`              | `Config.withDefault(value)`                        |
| `Config.literal("a", "b", "c")`          | `Config.literal("a", name?)` (single literal)      |
| `ConfigProvider.fromFlat`                | `ConfigProvider.make`                              |
| `ConfigProvider.fromMap`                 | `ConfigProvider.fromEnv({ env })` or `fromUnknown` |
| `ConfigProvider.fromJson`                | `ConfigProvider.fromUnknown`                       |
| `ConfigProvider.snakeCase` / `kebabCase` | Use `ConfigProvider.mapInput`                      |
| `ConfigProvider.unnested`                | Removed                                            |
| Flat key model with patches              | Tree-structured `Node` model                       |

## Quick Reference

| Task                      | Pattern                                                             |
| ------------------------- | ------------------------------------------------------------------- |
| Single string value       | `Config.string("HOST")`                                             |
| Typed value from schema   | `Config.schema(Schema.Struct({...}), "prefix")`                     |
| Boolean from env          | `Config.boolean("ENABLED")` (accepts yes/no/1/0 etc.)               |
| Port number               | `Config.port("PORT")`                                               |
| Secret value              | `Config.redacted("API_KEY")`                                        |
| Duration                  | `Config.duration("TIMEOUT")`                                        |
| URL                       | `Config.url("BASE_URL")`                                            |
| Combine configs           | `Config.all({ a: Config.string("a"), b: Config.int("b") })`         |
| Default value             | `Config.withDefault(fallback)`                                      |
| Optional                  | `Config.option(config)`                                             |
| Nest under prefix         | `config.pipe(Config.nested("database"))`                            |
| Transform value           | `config.pipe(Config.map(f))`                                        |
| Fallback config           | `config.pipe(Config.orElse(() => Config.succeed(x)))`               |
| Unwrap record of configs  | `Config.unwrap(wrapped)`                                            |
| Yield in Effect.gen       | `const x = yield* Config.port("PORT")`                              |
| Parse against provider    | `config.parse(provider)`                                            |
| Provider from env vars    | `ConfigProvider.fromEnv({ env: {...} })`                            |
| Provider from JS object   | `ConfigProvider.fromUnknown({...})`                                 |
| Provider from .env string | `ConfigProvider.fromDotEnvContents("...")`                          |
| Provider from .env file   | `ConfigProvider.fromDotEnv({ path: ".env" })`                       |
| Provider from directory   | `ConfigProvider.fromDir({ rootPath: "/etc/app" })`                  |
| Custom provider           | `ConfigProvider.make((path) => Effect.succeed(...))`                |
| camelCase to ENV_VARS     | `provider.pipe(ConfigProvider.constantCase)`                        |
| Scope provider prefix     | `provider.pipe(ConfigProvider.nested("APP"))`                       |
| Transform path segments   | `provider.pipe(ConfigProvider.mapInput(f))`                         |
| Provider fallback         | `ConfigProvider.orElse(primary, fallback)`                          |
| Install as Layer          | `ConfigProvider.layer(provider)`                                    |
| Add without replacing     | `ConfigProvider.layerAdd(provider)`                                 |
| Add as primary            | `ConfigProvider.layerAdd(provider, { asPrimary: true })`            |
| Key-value record          | `Config.schema(Config.Record(Schema.String, Schema.String), "KEY")` |
