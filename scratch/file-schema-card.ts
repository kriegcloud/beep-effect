import { Effect, FileSystem, SchemaIssue, SchemaTransformation } from "effect"
import * as O from "effect/Option"
import * as S from "effect/Schema"

// The validated shape you want in memory — types inferred, enforced at runtime.
const AppConfig = S.Struct({
  name: S.String,
  port: S.Int.check(S.isBetween({ minimum: 1, maximum: 65535 })),
})

const fail = (v: unknown, message: string) => new SchemaIssue.InvalidValue(O.some(v), { message })

// A codec whose DECODE reads a file and ENCODE writes one. The IO lives in the
// schema, so its requirement — FileSystem — is tracked in the type, not hidden.
const JsonFileAt = <A, I>(path: string, schema: S.Codec<A, I>) =>
  S.Null.pipe(S.decodeTo(schema, SchemaTransformation.transformOrFail({
    decode: () => Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      const text = yield* fs.readFileString(path).pipe(Effect.mapError((e) => fail(path, e.message)))
      return yield* Effect.try({ try: () => JSON.parse(text) as I, catch: () => fail(text, "bad JSON") })
    }),
    encode: (value) => Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      yield* fs.writeFileString(path, JSON.stringify(value)).pipe(Effect.mapError((e) => fail(path, e.message)))
      return null
    }),
  })))

const ConfigFile = JsonFileAt("./app.config.json", AppConfig)
const load = S.decodeEffect(ConfigFile) // (null)      => Effect<AppConfig, SchemaError, FileSystem>
const save = S.encodeEffect(ConfigFile) // (AppConfig) => Effect<null,      SchemaError, FileSystem>
