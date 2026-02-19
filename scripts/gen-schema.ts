import { ConfigurationSchema } from "@effect/docgen/Configuration"
import { FileSystem } from "@effect/platform"
import { NodeFileSystem, NodeRuntime } from "@effect/platform-node"
import { JSONSchema } from "@effect/schema"
import { Effect } from "effect"

const jsonSchema = JSON.stringify(JSONSchema.make(ConfigurationSchema), null, 2)

const program = Effect.gen(function*(_) {
  const fs = yield* _(FileSystem.FileSystem)
  yield* _(Effect.log("Writing config schema"))
  yield* _(fs.writeFileString("schema.json", jsonSchema))
  yield* _(Effect.log("Wrote schema to ./schema.json"))
})

program.pipe(
  Effect.provide(NodeFileSystem.layer),
  NodeRuntime.runMain
)
