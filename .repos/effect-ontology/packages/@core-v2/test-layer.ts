import { Layer, Effect } from "effect"
import { ActivityDependenciesLayer } from "./src/Runtime/WorkflowLayers.js"
import { EmbeddingProvider } from "./src/Service/EmbeddingProvider.js"

Effect.gen(function*() {
  const provider = yield* Effect.serviceOption(EmbeddingProvider)
  console.log("EmbeddingProvider found:", provider._tag === "Some")
}).pipe(
  Effect.provide(ActivityDependenciesLayer),
  Effect.runPromise
).catch(err => {
  console.error("Layer construction failed:", err)
  process.exit(1)
})
