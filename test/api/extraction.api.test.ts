import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as FileSystem from "@effect/platform/FileSystem"
import * as HttpClient from "@effect/platform/HttpClient"
import * as HttpClientResponse from "@effect/platform/HttpClientResponse"
import * as KeyValueStore from "@effect/platform/KeyValueStore"
import * as BunContext from "@effect/platform-bun/BunContext"
import { describe, expect, it } from "@effect/vitest"
import { Chunk, Effect, Layer, Redacted, Ref, Schema, Stream } from "effect"

import {
  makeExtractionExecutionLayer
} from "../../src/api/ExecutionLayer.js"
import { extract, extractStream, extractTyped, extractTypedStream } from "../../src/api/Extraction.js"
import { DocumentIdGenerator, ExampleData } from "../../src/Data.js"
import { InferenceConfigError } from "../../src/Errors.js"
import { ExtractionTarget } from "../../src/ExtractionTarget.js"
import { ScoredOutput } from "../../src/FormatType.js"
import { Ingestion } from "../../src/Ingestion.js"
import {
  DocumentMappingSpec,
  FieldSelector,
  IngestionRequest,
  IngestionSourceFile,
  IngestionSourceText,
  IngestionSourceUrl
} from "../../src/ingestion/Models.js"
import { LanguageModel } from "../../src/LanguageModel.js"
import { PrimedCachePolicy } from "../../src/PrimedCache.js"
import { removeFile, tempPath } from "../helpers/cli.js"

const mockLanguageModelLayer = LanguageModel.testLayer({
  provider: "test-mock",
  defaultText:
    '[{"extractionClass":"snippet","extractionText":"Alice visited"}]'
})

const makeSchemaModeLanguageModelLayer = (options?: {
  readonly response?: Record<string, unknown>
  readonly capturedPrompts?: Ref.Ref<Array<string>>
}) =>
  Layer.succeed(
    LanguageModel,
    LanguageModel.make({
      modelId: "schema-model",
      requiresFenceOutput: false,
      schema: undefined,
      infer: (batchPrompts) =>
        Effect.succeed(
          batchPrompts.map(() => [
            new ScoredOutput({
              provider: "schema-mock",
              output: "[]",
              score: 1
            })
          ])
        ),
      generateText: (prompt) =>
        Effect.succeed(
          new ScoredOutput({
            provider: "schema-mock",
            output: prompt,
            score: 1
          })
        ),
      generateObject: (prompt) =>
        (options?.capturedPrompts !== undefined
          ? Ref.update(options.capturedPrompts, (values) => [...values, prompt])
          : Effect.void).pipe(
          Effect.zipRight(
            Effect.succeed(
              options?.response ?? {
                extractions: [
                  {
                    extraction_class: "person",
                    extraction_text: "Alice",
                    data: { name: "Alice", age: 30 }
                  },
                  {
                    extractionClass: "person",
                    extractionText: "Invalid Person",
                    data: { name: "Invalid Person", age: "unknown" }
                  }
                ]
              }
            )
          )
        ),
      streamText: (prompt) => Stream.succeed(prompt)
    })
  )

const schemaModeLanguageModelLayer = makeSchemaModeLanguageModelLayer()

const writeFile = (
  path: string,
  content: string
): Effect.Effect<void, never, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fileSystem = yield* FileSystem.FileSystem
    yield* fileSystem.writeFileString(path, content)
  }).pipe(Effect.orDie)

const makeExtractionLayer = () =>
  makeExtractionExecutionLayer(
    {
      provider: "openai",
      modelId: "gpt-4o-mini",
      apiKey: Redacted.make(""),
      providerConcurrency: 8,
      primedCacheNamespace: "test"
    },
    {
      languageModelLayer: mockLanguageModelLayer,
      primedCacheStoreLayer: KeyValueStore.layerMemory
    }
  )

const makeSchemaExtractionLayer = (
  languageModelLayer: Layer.Layer<LanguageModel> = schemaModeLanguageModelLayer,
  namespace = "test-schema"
) =>
  makeExtractionExecutionLayer(
    {
      provider: "openai",
      modelId: "gpt-4o-mini",
      apiKey: Redacted.make(""),
      providerConcurrency: 8,
      primedCacheNamespace: namespace
    },
    {
      languageModelLayer,
      primedCacheStoreLayer: KeyValueStore.layerMemory
    }
  )

const runtimeLayer = Layer.mergeAll(BunContext.layer, FetchHttpClient.layer)

const mockUrlHttpClientLayer = Layer.succeed(
  HttpClient.HttpClient,
  HttpClient.make((request, url) => {
    if (url.pathname === "/input.txt") {
      return Effect.succeed(
        HttpClientResponse.fromWeb(
          request,
          new Response("Alice visited Paris from URL input.", {
            status: 200,
            headers: {
              "content-type": "text/plain; charset=utf-8"
            }
          })
        )
      )
    }

    return Effect.succeed(
      HttpClientResponse.fromWeb(
        request,
        new Response("Not found", { status: 404 })
      )
    )
  })
)

const appLayer = Layer.mergeAll(
  runtimeLayer,
  Ingestion.Default,
  DocumentIdGenerator.Default,
  makeExtractionLayer()
)

const schemaAppLayer = Layer.mergeAll(
  runtimeLayer,
  Ingestion.Default,
  DocumentIdGenerator.Default,
  makeSchemaExtractionLayer()
)

const urlAppLayer = Layer.mergeAll(
  BunContext.layer,
  mockUrlHttpClientLayer,
  Ingestion.Default,
  DocumentIdGenerator.Default,
  makeExtractionLayer()
)

const examples = [
  new ExampleData({
    text: "Alice visited Paris.",
    extractions: []
  })
]

const PersonSchema = Schema.Struct({
  name: Schema.String,
  age: Schema.Number
}).annotations({
  identifier: "person",
  description: "A person mention",
  examples: [{ name: "Alice", age: 30 }]
})

const schemaTarget = ExtractionTarget.make({
  classes: { person: PersonSchema },
  description: "Extract people"
})

describe("Extraction API", () => {
  it.effect("extracts from raw text ingestion", () =>
    extract({
      ingestion: new IngestionRequest({
        source: new IngestionSourceText({
          _tag: "text",
          text: "Alice visited Paris and Bob stayed in London."
        }),
        format: "text"
      }),
      prompt: {
        description: "Extract snippets.",
        examples
      },
      annotate: {
        maxCharBuffer: 1000,
        batchLength: 10,
        batchConcurrency: 1,
        providerConcurrency: 8,
        extractionPasses: 1
      },
      cachePolicy: new PrimedCachePolicy({
        enabled: false,
        namespace: "test"
      })
    }).pipe(
      Effect.provide(appLayer),
      Effect.tap((documents) =>
        Effect.sync(() => {
          expect(documents).toHaveLength(1)
          expect((documents[0]?.extractions.length ?? 0) > 0).toBe(true)
        })
      ),
      Effect.asVoid
    )
  )

  it.effect("extracts streamed documents from JSONL file mapping", () =>
    Effect.gen(function* () {
      const inputPath = tempPath("api-extract", "rows.jsonl")
      yield* writeFile(
        inputPath,
        [
          '{"post_id":"evt-1","body":"First row"}',
          '{"post_id":"evt-2","body":"Second row"}'
        ].join("\n")
      ).pipe(Effect.provide(runtimeLayer))

      const documents = yield* extractStream({
        ingestion: new IngestionRequest({
          source: new IngestionSourceFile({ _tag: "file", path: inputPath }),
          format: "jsonl",
          mapping: new DocumentMappingSpec({
            text: new FieldSelector({ path: "body", required: true, trim: true }),
            documentId: new FieldSelector({
              path: "post_id",
              required: false,
              trim: true
            })
          })
        }),
        prompt: {
          description: "Extract snippets.",
          examples
        },
        annotate: {
          maxCharBuffer: 1000,
          batchLength: 10,
          batchConcurrency: 1,
          providerConcurrency: 8,
          extractionPasses: 1,
          documentBatchSize: 1
        },
        cachePolicy: new PrimedCachePolicy({
          enabled: false,
          namespace: "test"
        })
      }).pipe(
        Stream.runCollect,
        Effect.map((values) => Chunk.toReadonlyArray(values)),
        Effect.provide(appLayer)
      )

      expect(documents).toHaveLength(2)
      expect(documents[0]?.documentId).toBe("evt-1")
      expect(documents[1]?.documentId).toBe("evt-2")

      yield* removeFile(inputPath)
    })
  )

  it.effect("extracts from URL ingestion", () =>
    extract({
      ingestion: new IngestionRequest({
        source: new IngestionSourceUrl({
          _tag: "url",
          url: "https://fixtures.local/input.txt"
        }),
        format: "text"
      }),
      prompt: {
        description: "Extract snippets.",
        examples
      },
      annotate: {
        maxCharBuffer: 1000,
        batchLength: 10,
        batchConcurrency: 1,
        providerConcurrency: 8,
        extractionPasses: 1
      },
      cachePolicy: new PrimedCachePolicy({
        enabled: false,
        namespace: "test"
      })
    }).pipe(
      Effect.provide(urlAppLayer),
      Effect.tap((documents) =>
        Effect.sync(() => {
          expect(documents).toHaveLength(1)
          expect((documents[0]?.extractions.length ?? 0) > 0).toBe(true)
        })
      ),
      Effect.asVoid
    )
  )

  it.effect("extractTyped returns typed schema results and drops invalid rows", () =>
    extractTyped({
      ingestion: new IngestionRequest({
        source: new IngestionSourceText({
          _tag: "text",
          text: "Alice visited Paris and someone else appeared."
        }),
        format: "text"
      }),
      target: schemaTarget,
      annotate: {
        maxCharBuffer: 1000,
        batchLength: 10,
        batchConcurrency: 1,
        providerConcurrency: 8,
        extractionPasses: 1
      },
      cachePolicy: new PrimedCachePolicy({
        enabled: false,
        namespace: "schema-test"
      })
    }).pipe(
      Effect.provide(schemaAppLayer),
      Effect.tap((documents) =>
        Effect.sync(() => {
          expect(documents).toHaveLength(1)
          const typed = documents[0]?.extractions ?? []
          expect(typed).toHaveLength(1)
          expect(typed[0]?.extractionClass).toBe("person")
          expect(typed[0]?.data).toEqual({ name: "Alice", age: 30 })
        })
      ),
      Effect.asVoid
    )
  )

  it.effect("schema mode promptOverrides replace target prompt defaults", () =>
    Effect.gen(function* () {
      const capturedPrompts = yield* Ref.make([] as Array<string>)
      const overrideLayer = Layer.mergeAll(
        runtimeLayer,
        Ingestion.Default,
        DocumentIdGenerator.Default,
        makeSchemaExtractionLayer(
          makeSchemaModeLanguageModelLayer({
            capturedPrompts,
            response: {
              extractions: [
                {
                  extractionClass: "person",
                  extractionText: "Alice",
                  data: { name: "Alice", age: 30 }
                }
              ]
            }
          }),
          "schema-override"
        )
      )

      const overrideExamples = [
        new ExampleData({
          text: "OVERRIDE EXAMPLE",
          extractions: []
        })
      ]

      const documents = yield* extractTyped({
        ingestion: new IngestionRequest({
          source: new IngestionSourceText({
            _tag: "text",
            text: "Alice visited Paris."
          }),
          format: "text"
        }),
        target: schemaTarget,
        promptOverrides: {
          description: "OVERRIDE DESCRIPTION",
          examples: overrideExamples
        },
        annotate: {
          maxCharBuffer: 1000,
          batchLength: 10,
          batchConcurrency: 1,
          providerConcurrency: 8,
          extractionPasses: 1
        },
        cachePolicy: new PrimedCachePolicy({
          enabled: false,
          namespace: "schema-override"
        })
      }).pipe(Effect.provide(overrideLayer))

      expect(documents).toHaveLength(1)
      const prompts = yield* Ref.get(capturedPrompts)
      expect(prompts.length).toBeGreaterThan(0)
      const prompt = prompts[0] ?? ""
      expect(prompt).toContain("OVERRIDE DESCRIPTION")
      expect(prompt).toContain("OVERRIDE EXAMPLE")
      expect(prompt).not.toContain("Schema example 1 for person")
    })
  )

  it.effect("schema mode rejects empty prompt override description", () =>
    extract({
      ingestion: new IngestionRequest({
        source: new IngestionSourceText({
          _tag: "text",
          text: "Alice visited Paris."
        }),
        format: "text"
      }),
      target: schemaTarget,
      promptOverrides: {
        description: "   "
      },
      annotate: {
        maxCharBuffer: 1000,
        batchLength: 10,
        batchConcurrency: 1,
        providerConcurrency: 8,
        extractionPasses: 1
      },
      cachePolicy: new PrimedCachePolicy({
        enabled: false,
        namespace: "schema-override"
      })
    }).pipe(
      Effect.provide(schemaAppLayer),
      Effect.flip,
      Effect.tap((error) =>
        Effect.sync(() => {
          expect(error).toBeInstanceOf(InferenceConfigError)
          expect((error as InferenceConfigError).message).toContain(
            "Prompt override description must be non-empty"
          )
        })
      ),
      Effect.asVoid
    )
  )

  it.effect("schema mode drops unknown extraction classes without failing", () =>
    Effect.gen(function* () {
      const unknownClassLayer = Layer.mergeAll(
        runtimeLayer,
        Ingestion.Default,
        DocumentIdGenerator.Default,
        makeSchemaExtractionLayer(
          makeSchemaModeLanguageModelLayer({
            response: {
              extractions: [
                {
                  extractionClass: "organization",
                  extractionText: "OpenAI",
                  data: { name: "OpenAI" }
                },
                {
                  extractionClass: "person",
                  extractionText: "Alice",
                  data: { name: "Alice", age: 30 }
                }
              ]
            }
          }),
          "schema-unknown-class"
        )
      )

      const documents = yield* extractTyped({
        ingestion: new IngestionRequest({
          source: new IngestionSourceText({
            _tag: "text",
            text: "Alice works at OpenAI."
          }),
          format: "text"
        }),
        target: schemaTarget,
        annotate: {
          maxCharBuffer: 1000,
          batchLength: 10,
          batchConcurrency: 1,
          providerConcurrency: 8,
          extractionPasses: 1
        },
        cachePolicy: new PrimedCachePolicy({
          enabled: false,
          namespace: "schema-unknown-class"
        })
      }).pipe(Effect.provide(unknownClassLayer))

      expect(documents).toHaveLength(1)
      const typed = documents[0]?.extractions ?? []
      expect(typed).toHaveLength(1)
      expect(typed[0]?.extractionClass).toBe("person")
      expect(typed[0]?.data).toEqual({ name: "Alice", age: 30 })
    })
  )

  it.effect("multi-class target routes extractions by discriminator", () =>
    Effect.gen(function* () {
      const LocationSchema = Schema.Struct({
        city: Schema.String,
        country: Schema.String
      }).annotations({
        identifier: "location",
        description: "A location mention",
        examples: [{ city: "Paris", country: "France" }]
      })

      const multiTarget = ExtractionTarget.make({
        classes: { person: PersonSchema, location: LocationSchema },
        description: "Extract people and locations"
      })

      const multiClassLayer = Layer.mergeAll(
        runtimeLayer,
        Ingestion.Default,
        DocumentIdGenerator.Default,
        makeSchemaExtractionLayer(
          makeSchemaModeLanguageModelLayer({
            response: {
              extractions: [
                {
                  extractionClass: "person",
                  extractionText: "Alice",
                  data: { name: "Alice", age: 30 }
                },
                {
                  extractionClass: "location",
                  extractionText: "Paris",
                  data: { city: "Paris", country: "France" }
                }
              ]
            }
          }),
          "schema-multi-class"
        )
      )

      const documents = yield* extractTyped({
        ingestion: new IngestionRequest({
          source: new IngestionSourceText({
            _tag: "text",
            text: "Alice visited Paris in France."
          }),
          format: "text"
        }),
        target: multiTarget,
        annotate: {
          maxCharBuffer: 1000,
          batchLength: 10,
          batchConcurrency: 1,
          providerConcurrency: 8,
          extractionPasses: 1
        },
        cachePolicy: new PrimedCachePolicy({
          enabled: false,
          namespace: "schema-multi-class"
        })
      }).pipe(Effect.provide(multiClassLayer))

      expect(documents).toHaveLength(1)
      const typed = documents[0]?.extractions ?? []
      expect(typed).toHaveLength(2)

      const person = typed.find((e) => e.extractionClass === "person")
      expect(person?.data).toEqual({ name: "Alice", age: 30 })

      const location = typed.find((e) => e.extractionClass === "location")
      expect(location?.data).toEqual({ city: "Paris", country: "France" })
    })
  )

  it.effect("extract() strips __schemaDataJson marker from output attributes", () =>
    Effect.gen(function* () {
      const documents = yield* extract({
        ingestion: new IngestionRequest({
          source: new IngestionSourceText({
            _tag: "text",
            text: "Alice visited Paris."
          }),
          format: "text"
        }),
        target: schemaTarget,
        annotate: {
          maxCharBuffer: 1000,
          batchLength: 10,
          batchConcurrency: 1,
          providerConcurrency: 8,
          extractionPasses: 1
        },
        cachePolicy: new PrimedCachePolicy({
          enabled: false,
          namespace: "schema-marker-strip"
        })
      }).pipe(Effect.provide(schemaAppLayer))

      expect(documents).toHaveLength(1)
      for (const doc of documents) {
        for (const extraction of doc.extractions) {
          expect(extraction.attributes?.["__schemaDataJson"]).toBeUndefined()
        }
      }
    })
  )

  it.effect("extractTypedStream yields typed documents incrementally", () =>
    Effect.gen(function* () {
      const streamLayer = Layer.mergeAll(
        runtimeLayer,
        Ingestion.Default,
        DocumentIdGenerator.Default,
        makeSchemaExtractionLayer(
          makeSchemaModeLanguageModelLayer({
            response: {
              extractions: [
                {
                  extractionClass: "person",
                  extractionText: "Alice",
                  data: { name: "Alice", age: 30 }
                }
              ]
            }
          }),
          "schema-typed-stream"
        )
      )

      const documents = yield* extractTypedStream({
        ingestion: new IngestionRequest({
          source: new IngestionSourceText({
            _tag: "text",
            text: "Alice visited Paris."
          }),
          format: "text"
        }),
        target: schemaTarget,
        annotate: {
          maxCharBuffer: 1000,
          batchLength: 10,
          batchConcurrency: 1,
          providerConcurrency: 8,
          extractionPasses: 1
        },
        cachePolicy: new PrimedCachePolicy({
          enabled: false,
          namespace: "schema-typed-stream"
        })
      }).pipe(
        Stream.runCollect,
        Effect.map(Chunk.toReadonlyArray),
        Effect.provide(streamLayer)
      )

      expect(documents).toHaveLength(1)
      const typed = documents[0]?.extractions ?? []
      expect(typed).toHaveLength(1)
      expect(typed[0]?.extractionClass).toBe("person")
      expect(typed[0]?.data).toEqual({ name: "Alice", age: 30 })
    })
  )
})
