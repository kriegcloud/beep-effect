import { ConfigurationSchema } from "@effect/docgen/Configuration"
import { FileSystem } from "@effect/platform"
import { NodeFileSystem, NodeRuntime } from "@effect/platform-node"
import { Effect, JSONSchema } from "effect"

const jsonSchema = JSON.stringify(JSONSchema.make(ConfigurationSchema), null, 2)

const program = Effect.gen(function*() {
  const fs = yield* FileSystem.FileSystem
  yield* Effect.log("Writing config schema")
  yield* fs.writeFileString("schema.json", jsonSchema)
  yield* Effect.log("Wrote schema to ./schema.json")
})

program.pipe(
  Effect.provide(NodeFileSystem.layer),
  NodeRuntime.runMain
)
