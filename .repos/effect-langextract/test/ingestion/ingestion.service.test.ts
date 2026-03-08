import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as FileSystem from "@effect/platform/FileSystem"
import * as BunContext from "@effect/platform-bun/BunContext"
import { describe, expect, it } from "@effect/vitest"
import { Chunk, Effect, Layer, Stream } from "effect"

import { DocumentIdGenerator } from "../../src/Data.js"
import { ingestDocuments,Ingestion } from "../../src/Ingestion.js"
import {
  DocumentMappingSpec,
  FieldSelector,
  IngestionRequest,
  IngestionSourceFile,
  IngestionSourceText
} from "../../src/ingestion/Models.js"
import { removeFile, tempPath } from "../helpers/cli.js"

const runtimeLayer = Layer.mergeAll(
  BunContext.layer,
  FetchHttpClient.layer,
  Ingestion.Default,
  DocumentIdGenerator.Default
)

const writeFile = (path: string, content: string): Effect.Effect<void, never, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fileSystem = yield* FileSystem.FileSystem
    yield* fileSystem.writeFileString(path, content)
  }).pipe(Effect.orDie)

describe("Ingestion service", () => {
  it.effect("ingests raw text into a document", () =>
    ingestDocuments(
      new IngestionRequest({
        source: new IngestionSourceText({
          _tag: "text",
          text: "  Alice visited Paris.  "
        }),
        format: "text"
      })
    ).pipe(
      Stream.runCollect,
      Effect.map((documents) => Chunk.toReadonlyArray(documents)),
      Effect.tap((documents) =>
        Effect.sync(() => {
          expect(documents).toHaveLength(1)
          expect(documents[0]?.text).toBe("Alice visited Paris.")
          expect(documents[0]?.documentId).toContain("doc_")
        })
      ),
      Effect.provide(runtimeLayer),
      Effect.asVoid
    )
  )

  it.effect("ingests JSONL rows with explicit field mapping", () =>
    Effect.gen(function* () {
      const inputPath = tempPath("ingestion", "rows.jsonl")
      yield* writeFile(
        inputPath,
        [
          '{"post_id":"evt-1","body":"First row","author":"Ada"}',
          '{"post_id":"evt-2","body":"Second row","author":"Lin"}'
        ].join("\n")
      )

      const documents = yield* ingestDocuments(
        new IngestionRequest({
          source: new IngestionSourceFile({ _tag: "file", path: inputPath }),
          format: "jsonl",
          mapping: new DocumentMappingSpec({
            text: new FieldSelector({ path: "body", required: true, trim: true }),
            documentId: new FieldSelector({
              path: "post_id",
              required: false,
              trim: true
            }),
            additionalContext: new FieldSelector({
              path: "author",
              required: false,
              trim: true
            })
          })
        })
      ).pipe(
        Stream.runCollect,
        Effect.map((values) => Chunk.toReadonlyArray(values))
      )

      expect(documents).toHaveLength(2)
      expect(documents[0]?.text).toBe("First row")
      expect(documents[0]?.documentId).toBe("evt-1")
      expect(documents[1]?.additionalContext).toBe("Lin")

      yield* removeFile(inputPath)
    }).pipe(Effect.provide(runtimeLayer))
  )

  it.effect("skips malformed CSV rows when rowErrorMode is skip-row", () =>
    Effect.gen(function* () {
      const inputPath = tempPath("ingestion", "rows.csv")
      yield* writeFile(
        inputPath,
        [
          "post_id,body",
          "evt-1,First row",
          "evt-2",
          "evt-3,Third row"
        ].join("\n")
      )

      const documents = yield* ingestDocuments(
        new IngestionRequest({
          source: new IngestionSourceFile({ _tag: "file", path: inputPath }),
          format: "csv",
          mapping: new DocumentMappingSpec({
            text: new FieldSelector({ path: "body", required: true, trim: true }),
            documentId: new FieldSelector({
              path: "post_id",
              required: false,
              trim: true
            })
          }),
          onRowError: "skip-row"
        })
      ).pipe(
        Stream.runCollect,
        Effect.map((values) => Chunk.toReadonlyArray(values))
      )

      expect(documents).toHaveLength(2)
      expect(documents[0]?.documentId).toBe("evt-1")
      expect(documents[1]?.documentId).toBe("evt-3")

      yield* removeFile(inputPath)
    }).pipe(Effect.provide(runtimeLayer))
  )
})
