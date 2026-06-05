import { Effect, FileSystem, SchemaIssue, SchemaTransformation } from "effect"
import { NodeFileSystem } from "@effect/platform-node"
import * as O from "effect/Option"
import * as S from "effect/Schema"

// 1. A plain domain schema — the validated shape you actually want in memory.
const AppConfig = S.Struct({
  name: S.String,
  port: S.Int.check(S.isBetween({ minimum: 1, maximum: 65535 })),
  features: S.Array(S.String),
})

const asIssue = (value: unknown, message: string) =>
  new SchemaIssue.InvalidValue(O.some(value), { message })

// 2. Turn ANY schema into one whose *decode reads a file* and *encode writes it*.
//    The IO lives inside the codec, so its requirement — FileSystem — rides
//    along in the type. Nothing is hidden: `S.decodeEffect` can't be called
//    without proving you have a filesystem.
const JsonFileAt = <A, I>(path: string, schema: S.Codec<A, I>) =>
  S.Null.pipe(
    S.decodeTo(
      schema,
      SchemaTransformation.transformOrFail({
        // decode: read the file → parse → (schema validates the rest)
        decode: () =>
          Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem
            const text = yield* fs.readFileString(path).pipe(
              Effect.mapError((e) => asIssue(path, `read failed: ${e.message}`))
            )
            return yield* Effect.try({
              try: () => JSON.parse(text) as I,
              catch: () => asIssue(text, "not valid JSON"),
            })
          }),
        // encode: serialize the validated value → write the file
        encode: (value) =>
          Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem
            yield* fs.writeFileString(path, JSON.stringify(value, null, 2)).pipe(
              Effect.mapError((e) => asIssue(path, `write failed: ${e.message}`))
            )
            return null
          }),
      })
    )
  )

// 3. Use it. `load`/`save` are just decode/encode — and the FileSystem
//    requirement is inferred into the Effect type. No `try/catch`, no manual
//    validation, no untyped `any` from `JSON.parse`.
const ConfigFile = JsonFileAt("./app.config.json", AppConfig)

const save = (cfg: typeof AppConfig.Type) => S.encodeEffect(ConfigFile)(cfg)
const load = S.decodeEffect(ConfigFile)(null)
//    load: Effect<{ name: string; port: number; features: string[] }, SchemaError, FileSystem>

const program = Effect.gen(function* () {
  yield* save({ name: "todox", port: 8080, features: ["auth", "billing"] })
  const cfg = yield* load
  yield* Effect.log(`loaded ${cfg.name} on :${cfg.port}`)
  return cfg
})

Effect.runPromise(program.pipe(Effect.provide(NodeFileSystem.layer)))
