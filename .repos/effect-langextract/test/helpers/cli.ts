import * as FileSystem from "@effect/platform/FileSystem"
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem"
import { Effect, Schema } from "effect"

import {
  AnnotatedDocument,
  CharInterval,
  Extraction
} from "../../src/Data.js"
import { encodeAnnotatedDocumentJson } from "../../src/DataLib.js"

export const tempPath = (scope: string, name: string): string =>
  `/tmp/effect-langextract-${scope}-${name}-${Date.now()}-${Math.random()}`

export const withBunFileSystem = <A, E>(
  effect: Effect.Effect<A, E, FileSystem.FileSystem>
): Effect.Effect<A, E> =>
  effect.pipe(Effect.provide(BunFileSystem.layer))

export const writeExamplesFile = (path: string): Effect.Effect<void> =>
  withBunFileSystem(
    Effect.gen(function* () {
      const fileSystem = yield* FileSystem.FileSystem
      const encoded = yield* Schema.encode(Schema.parseJson())([
        {
          text: "Alice visited Paris.",
          extractions: [
            {
              extractionClass: "snippet",
              extractionText: "Alice visited"
            }
          ]
        }
      ])
      yield* fileSystem.writeFileString(path, encoded)
    })
  )

export const writeAnnotatedDocument = (path: string): Effect.Effect<void> =>
  withBunFileSystem(
    Effect.gen(function* () {
      const fileSystem = yield* FileSystem.FileSystem
      const document = new AnnotatedDocument({
        text: "Alice visited Paris.",
        extractions: [
          new Extraction({
            extractionClass: "person",
            extractionText: "Alice",
            alignmentStatus: "match_exact",
            charInterval: new CharInterval({ startPos: 0, endPos: 5 })
          })
        ]
      })
      const encoded = yield* encodeAnnotatedDocumentJson(document)
      yield* fileSystem.writeFileString(path, encoded)
    })
  )

export const readTextFile = (path: string): Effect.Effect<string> =>
  withBunFileSystem(
    Effect.gen(function* () {
      const fileSystem = yield* FileSystem.FileSystem
      return yield* fileSystem.readFileString(path)
    })
  )

export const removeFile = (path: string): Effect.Effect<void> =>
  withBunFileSystem(
    Effect.gen(function* () {
      const fileSystem = yield* FileSystem.FileSystem
      yield* fileSystem.remove(path, { force: true })
    })
  )
