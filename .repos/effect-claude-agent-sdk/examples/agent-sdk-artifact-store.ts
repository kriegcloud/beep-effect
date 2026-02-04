import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import { Schema, Storage } from "../src/index.js"

const program = Effect.gen(function*() {
  const store = yield* Storage.ArtifactStore
  const now = Date.now()

  const record = Schema.ArtifactRecord.make({
    id: "artifact-1",
    sessionId: "session-1",
    kind: "summary",
    encoding: "utf8",
    content: "Short summary of the session.",
    sizeBytes: "Short summary of the session.".length,
    createdAt: now
  })

  yield* store.put(record)
  const fetched = yield* store.get(record.id)
  const list = yield* store.list("session-1")

  yield* Console.log({ fetched, listCount: list.length })
}).pipe(Effect.provide(Storage.ArtifactStore.layerMemory))

Effect.runPromise(program)
