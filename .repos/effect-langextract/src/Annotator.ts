import { Cause, Chunk, Effect, Layer, Option, Queue, Ref, Schema, Stream } from "effect"

import { AlignmentExecutor } from "./AlignmentExecutor.js"
import { chunkDocuments, makeBatches,TextChunk } from "./Chunking.js"
import {
  AnnotatedDocument,
  Document,
  DocumentIdGenerator,
  ExampleData,
  Extraction,
  makeDocumentEffect
} from "./Data.js"
import type { AnyExtractionTarget } from "./ExtractionTarget.js"
import { LangExtractError } from "./Errors.js"
import { FormatHandler } from "./FormatHandler.js"
import { errorMessage } from "./internal/errorMessage.js"
import { asRecord } from "./internal/records.js"
import { LanguageModel } from "./LanguageModel.js"
import type { PrimedCachePolicy } from "./PrimedCache.js"
import { PromptBuilder } from "./Prompting.js"
import { Resolver } from "./Resolver.js"
import { Tokenizer } from "./Tokenizer.js"
import { SCHEMA_DATA_ATTRIBUTE_KEY } from "./TypedExtraction.js"

export interface AnnotateOptions {
  readonly maxCharBuffer: number
  readonly batchLength: number
  readonly batchConcurrency: number
  readonly providerConcurrency: number
  readonly passNumber?: number | undefined
  readonly extractionPasses: number
  readonly contextWindowChars?: number | undefined
  readonly additionalContext?: string | undefined
  readonly maxBatchInputTokens?: number | undefined
  readonly cachePolicy?: PrimedCachePolicy | undefined
  readonly promptDescription?: string | undefined
  readonly promptExamples?: ReadonlyArray<ExampleData> | undefined
  readonly extractionTarget?: AnyExtractionTarget | undefined
}

export interface AnnotatorService {
  readonly annotateDocuments: (
    documents: ReadonlyArray<Document>,
    options: AnnotateOptions
  ) => Stream.Stream<AnnotatedDocument, LangExtractError>

  readonly annotateText: (
    text: string,
    options: AnnotateOptions
  ) => Effect.Effect<AnnotatedDocument, LangExtractError>
}

const defaultAnnotatedDocument = (document: Document): AnnotatedDocument =>
  new AnnotatedDocument({
    text: document.text,
    ...(document.documentId !== undefined ? { documentId: document.documentId } : {})
  })

const toLangExtractError = (error: unknown): LangExtractError =>
  new LangExtractError({
    message: errorMessage(error)
  })

type AnnotatorDependencies = {
  readonly tokenizer: Tokenizer
  readonly promptBuilder: PromptBuilder
  readonly languageModel: LanguageModel
  readonly alignmentExecutor: AlignmentExecutor
  readonly formatHandler: FormatHandler
  readonly resolver: Resolver
  readonly documentIdGenerator: DocumentIdGenerator
}

type PreparedChunk = {
  readonly chunk: TextChunk
  readonly prompt: string
  readonly estimatedTokens: number
}

const JsonString = Schema.parseJson()

const encodeExtractionsForPrompt = (
  extractions: ReadonlyArray<Extraction>
): string => {
  try {
    return Schema.encodeSync(JsonString)(extractions)
  } catch (error) {
    Effect.runSync(
      Effect.logWarning("langextract.annotator.encode_failed").pipe(
        Effect.annotateLogs({ error: errorMessage(error), fallback: "[]" })
      )
    )
    return "[]"
  }
}

const extractStringField = (
  record: Readonly<Record<string, unknown>>,
  keys: ReadonlyArray<string>
): string | undefined => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "string" && value.trim().length > 0) {
      return value
    }
  }
  return undefined
}

const extractNumberField = (
  record: Readonly<Record<string, unknown>>,
  keys: ReadonlyArray<string>
): number | undefined => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "number" && Number.isFinite(value)) {
      return value
    }
  }
  return undefined
}

const extractAttributeValue = (
  value: unknown
): string | ReadonlyArray<string> | undefined => {
  if (typeof value === "string") {
    return value
  }
  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value)
  }
  if (Array.isArray(value)) {
    const normalized = value
      .map((entry) => (typeof entry === "string" ? entry : String(entry)))
      .filter((entry) => entry.length > 0)
    return normalized.length > 0 ? normalized : undefined
  }
  return undefined
}

const extractAttributes = (
  record: Readonly<Record<string, unknown>>,
  className: string
): Record<string, string | ReadonlyArray<string>> | undefined => {
  const attributes: Record<string, string | ReadonlyArray<string>> = {}
  const directAttributes = asRecord(record.attributes)
  if (directAttributes !== undefined) {
    for (const [key, value] of Object.entries(directAttributes)) {
      const normalized = extractAttributeValue(value)
      if (normalized !== undefined) {
        attributes[key] = normalized
      }
    }
  }

  const suffixAttributes = asRecord(record[`${className}_attributes`])
  if (suffixAttributes !== undefined) {
    for (const [key, value] of Object.entries(suffixAttributes)) {
      const normalized = extractAttributeValue(value)
      if (normalized !== undefined) {
        attributes[key] = normalized
      }
    }
  }

  return Object.keys(attributes).length > 0 ? attributes : undefined
}

const schemaPayloadFromRecord = (
  record: Readonly<Record<string, unknown>>
): unknown => {
  if (Object.prototype.hasOwnProperty.call(record, "data")) {
    return record.data
  }

  const normalized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(record)) {
    if (
      key === "extractionClass" ||
      key === "extraction_class" ||
      key === "extractionText" ||
      key === "extraction_text" ||
      key === "extractionIndex" ||
      key === "extraction_index" ||
      key === "index" ||
      key === "attributes" ||
      key.endsWith("_attributes")
    ) {
      continue
    }
    normalized[key] = value
  }
  return normalized
}

const resolveSchemaExtractions = (
  output: string | Record<string, unknown>,
  options: AnnotateOptions,
  dependencies: AnnotatorDependencies,
  passNumber: number
): Effect.Effect<ReadonlyArray<Extraction>> =>
  Effect.gen(function* () {
    const target = options.extractionTarget
    if (target === undefined) {
      const legacyOutput = typeof output === "string" ? output : "{}"
      return yield* dependencies.resolver
        .resolve(legacyOutput, {
          suppressParseErrors: true
        })
        .pipe(Effect.catchAll(() => Effect.succeed([] as const)))
    }

    const parsed =
      typeof output === "string"
        ? yield* dependencies.formatHandler
            .parseOutput(output, { strict: false })
            .pipe(Effect.catchAll(() => Effect.succeed([] as const)))
        : Array.isArray(output.extractions)
          ? output.extractions
              .map(asRecord)
              .filter(
                (record): record is Record<string, unknown> => record !== undefined
              )
          : [output]

    const extracted: Array<Extraction> = []
    let fallbackIndex = 0

    for (const [groupIndex, record] of parsed.entries()) {
      const extractionClass = extractStringField(record, [
        "extractionClass",
        "extraction_class",
        "class",
        "type"
      ])
      const extractionText = extractStringField(record, [
        "extractionText",
        "extraction_text",
        "text",
        "value"
      ])

      if (extractionClass === undefined || extractionText === undefined) {
        continue
      }

      const classSchema = target.classSchemasByIdentifier[extractionClass]
      if (classSchema === undefined) {
        yield* logAnnotatorEvent("langextract.annotator.schema_unknown_class", {
          passNumber,
          extractionClass
        })
        continue
      }

      const payload = schemaPayloadFromRecord(record)
      const decoded = Schema.decodeUnknownEither(classSchema)(payload)
      if (decoded._tag === "Left") {
        yield* logAnnotatorEvent("langextract.annotator.schema_validation_failed", {
          passNumber,
          extractionClass,
          error: String(decoded.left)
        })
        continue
      }

      const encodedPayload = yield* Schema.encode(JsonString)(decoded.right).pipe(
        Effect.catchAll((error) =>
          logAnnotatorEvent("langextract.annotator.schema_payload_encode_failed", {
            passNumber,
            extractionClass,
            error: String(error)
          }).pipe(Effect.as("{}"))
        )
      )
      const extractionIndex = extractNumberField(record, [
        "extractionIndex",
        "extraction_index",
        "index"
      ])

      const attributes = extractAttributes(record, extractionClass) ?? {}
      attributes[SCHEMA_DATA_ATTRIBUTE_KEY] = encodedPayload

      fallbackIndex += 1
      extracted.push(
        new Extraction({
          extractionClass,
          extractionText,
          extractionIndex:
            extractionIndex !== undefined && Number.isInteger(extractionIndex)
              ? extractionIndex
              : fallbackIndex,
          groupIndex,
          attributes
        })
      )
    }

    return extracted.sort(
      (left, right) => (left.extractionIndex ?? 0) - (right.extractionIndex ?? 0)
    )
  })

// Schema mode intentionally bypasses the PromptBuilder service. When
// promptDescription/promptExamples are set (always the case for schema
// targets), the prompt is assembled inline from description + examples +
// chunk text. The PromptBuilder is only used for legacy free-form prompts.
const buildPromptForChunk = (
  chunk: TextChunk,
  options: AnnotateOptions,
  dependencies: AnnotatorDependencies
): string => {
  if (
    options.promptDescription !== undefined ||
    (options.promptExamples?.length ?? 0) > 0
  ) {
    const examples = options.promptExamples ?? []
    const exampleSection = examples
      .map((example, index) =>
        [
          `Example ${index + 1}:`,
          example.text,
          encodeExtractionsForPrompt(example.extractions)
        ].join("\n")
      )
      .join("\n\n")

    const description = options.promptDescription ?? "Extract structured entities."
    const documentId = chunk.documentId ?? `doc_${chunk.documentIndex}`
    const context = chunk.additionalContext ?? options.additionalContext

    return [
      description,
      exampleSection,
      `Document: ${documentId}`,
      context !== undefined ? `Context: ${context}` : "",
      `Text:\n${chunk.chunkText}`
    ]
      .filter((part) => part.length > 0)
      .join("\n\n")
  }

  return dependencies.promptBuilder.buildPrompt(
    chunk.chunkText,
    chunk.documentId ?? "",
    chunk.additionalContext ?? options.additionalContext
  )
}

const hasOverlap = (
  left: Extraction,
  right: Extraction
): boolean => {
  const leftStart = left.charInterval?.startPos
  const leftEnd = left.charInterval?.endPos
  const rightStart = right.charInterval?.startPos
  const rightEnd = right.charInterval?.endPos

  if (
    leftStart === undefined ||
    leftEnd === undefined ||
    rightStart === undefined ||
    rightEnd === undefined
  ) {
    return false
  }

  return leftStart < rightEnd && rightStart < leftEnd
}

const mergeExtractions = (
  existing: ReadonlyArray<Extraction>,
  incoming: ReadonlyArray<Extraction>
): ReadonlyArray<Extraction> => {
  const merged = [...existing]
  for (const candidate of incoming) {
    const blocked = merged.some((current) => hasOverlap(current, candidate))
    if (!blocked) {
      merged.push(candidate)
    }
  }
  return merged
}

const sortExtractions = (
  extractions: ReadonlyArray<Extraction>
): ReadonlyArray<Extraction> =>
  [...extractions].sort((left, right) => {
    const leftPos = left.charInterval?.startPos ?? Number.MAX_SAFE_INTEGER
    const rightPos = right.charInterval?.startPos ?? Number.MAX_SAFE_INTEGER
    if (leftPos !== rightPos) {
      return leftPos - rightPos
    }
    return (left.extractionIndex ?? 0) - (right.extractionIndex ?? 0)
  })

const logAnnotatorEvent = (
  event: string,
  fields: Readonly<Record<string, unknown>>
): Effect.Effect<void> =>
  Effect.logDebug(event).pipe(Effect.annotateLogs(fields))

const prepareChunks = (
  chunks: ReadonlyArray<TextChunk>,
  options: AnnotateOptions,
  dependencies: AnnotatorDependencies
): ReadonlyArray<PreparedChunk> =>
  chunks.map((chunk) => {
    const prompt = buildPromptForChunk(chunk, options, dependencies)
    return {
      chunk,
      prompt,
      estimatedTokens: Math.ceil(prompt.length / 4)
    }
  })

type AnnotatedPassDocument = {
  readonly documentIndex: number
  readonly document: AnnotatedDocument
}

const toAnnotatedDocument = (
  document: Document,
  extractions: ReadonlyArray<Extraction>
): AnnotatedDocument =>
  new AnnotatedDocument({
    text: document.text,
    ...(document.documentId !== undefined ? { documentId: document.documentId } : {}),
    extractions: sortExtractions(extractions)
  })

const runBatchInference = (
  batch: ReadonlyArray<PreparedChunk>,
  options: AnnotateOptions,
  dependencies: AnnotatorDependencies,
  passNumber: number
): Effect.Effect<ReadonlyArray<string | Record<string, unknown>>, LangExtractError> => {
  const extractionTarget = options.extractionTarget
  if (extractionTarget !== undefined) {
    return Effect.forEach(
      batch,
      ({ prompt }) =>
        dependencies.languageModel
          .generateObject(prompt, {
            cachePolicy: options.cachePolicy,
            providerConcurrency: options.providerConcurrency,
            passNumber,
            structuredOutput: {
              schema: extractionTarget.outputSchema,
              objectName: "extractions"
            }
          })
          .pipe(Effect.mapError(toLangExtractError)),
      {
        concurrency: options.providerConcurrency
      }
    )
  }

  const prompts = batch.map((item) => item.prompt)
  return dependencies.languageModel
    .infer(prompts, {
      cachePolicy: options.cachePolicy,
      providerConcurrency: options.providerConcurrency,
      passNumber
    })
    .pipe(
      Effect.map((outputs) =>
        outputs.map((candidateOutputs) => candidateOutputs[0]?.output ?? "[]")
      ),
      Effect.mapError(toLangExtractError)
    )
}

const annotateDocumentsPassStream = (
  documents: ReadonlyArray<Document>,
  options: AnnotateOptions,
  dependencies: AnnotatorDependencies,
  passNumber: number
): Stream.Stream<AnnotatedPassDocument, LangExtractError> =>
  Stream.unwrapScoped(
    Effect.gen(function* () {
      const chunks = yield* chunkDocuments(
        documents,
        options.maxCharBuffer,
        dependencies.tokenizer
      )
      const preparedChunks = prepareChunks(chunks, options, dependencies)
      const batches = makeBatches(preparedChunks, {
        targetBatchLength: options.batchLength,
        maxBatchInputTokens: options.maxBatchInputTokens,
        estimateTokens: (item) => item.estimatedTokens
      })

      const perDocumentRef = yield* Ref.make(
        documents.map(() => [] as Array<Extraction>)
      )
      const chunkCounts = documents.map(() => 0)
      for (const prepared of preparedChunks) {
        const index = prepared.chunk.documentIndex
        chunkCounts[index] = (chunkCounts[index] ?? 0) + 1
      }
      const remainingChunksRef = yield* Ref.make(chunkCounts)

      yield* logAnnotatorEvent("langextract.annotator.pass_start", {
        passNumber,
        documentCount: documents.length,
        chunkCount: preparedChunks.length,
        batchCount: batches.length,
        batchConcurrency: options.batchConcurrency,
        providerConcurrency: options.providerConcurrency
      })

      type QueueItem =
        | { readonly _tag: "value"; readonly value: AnnotatedPassDocument }
        | { readonly _tag: "error"; readonly cause: Cause.Cause<LangExtractError> }
        | { readonly _tag: "end" }

      const queue = yield* Queue.unbounded<QueueItem>()

      const emitDocument = (documentIndex: number): Effect.Effect<void> =>
        Effect.gen(function* () {
          const document = documents[documentIndex]
          if (document === undefined) {
            return
          }

          const perDocument = yield* Ref.get(perDocumentRef)
          yield* Queue.offer(queue, {
            _tag: "value",
            value: {
              documentIndex,
              document: toAnnotatedDocument(
                document,
                perDocument[documentIndex] ?? []
              )
            }
          })
        })

      const markChunkComplete = (documentIndex: number): Effect.Effect<void> =>
        Effect.gen(function* () {
          const completed = yield* Ref.modify(remainingChunksRef, (counts) => {
            const next = [...counts]
            const current = next[documentIndex] ?? 0
            const updated = Math.max(0, current - 1)
            next[documentIndex] = updated
            return [current > 0 && updated === 0, next] as const
          })

          if (completed) {
            yield* emitDocument(documentIndex)
          }
        })

      const enqueueEmptyDocuments = Effect.forEach(
        documents,
        (_document, documentIndex) =>
          (chunkCounts[documentIndex] ?? 0) === 0
            ? emitDocument(documentIndex)
            : Effect.void,
        { discard: true }
      )

      const producer = enqueueEmptyDocuments.pipe(
        Effect.zipRight(
          Stream.fromIterable(batches).pipe(
            Stream.mapEffect(
              (batch) => {
                const prompts = batch.map((item) => item.prompt)
                return logAnnotatorEvent("langextract.annotator.batch_start", {
                  passNumber,
                  batchSize: prompts.length
                }).pipe(
                  Effect.zipRight(
                    runBatchInference(batch, options, dependencies, passNumber)
                      .pipe(
                        Effect.flatMap((outputs) =>
                          Effect.forEach(
                            outputs,
                            (modelOutput, outputIndex) => {
                              const prepared = batch[outputIndex]
                              if (prepared === undefined) {
                                return Effect.void
                              }
                              const chunk = prepared.chunk

                              return resolveSchemaExtractions(
                                modelOutput,
                                options,
                                dependencies,
                                passNumber
                              )
                                .pipe(
                                  Effect.mapError(toLangExtractError),
                                  Effect.flatMap((resolved) =>
                                    dependencies.alignmentExecutor
                                      .alignChunk(
                                        resolved,
                                        chunk.chunkText,
                                        chunk.tokenInterval.startIndex,
                                        chunk.charInterval.startPos ?? 0,
                                        undefined
                                      )
                                      .pipe(
                                        Effect.catchAll((alignError) =>
                                          logAnnotatorEvent(
                                            "langextract.annotator.alignment_fallback",
                                            {
                                              passNumber,
                                              documentIndex: chunk.documentIndex,
                                              originalError: errorMessage(alignError)
                                            }
                                          ).pipe(
                                            Effect.zipRight(
                                              dependencies.resolver.align(
                                                resolved,
                                                chunk.chunkText,
                                                chunk.tokenInterval.startIndex,
                                                chunk.charInterval.startPos ?? 0,
                                                undefined
                                              )
                                            )
                                          )
                                        )
                                      )
                                  ),
                                  Effect.mapError(toLangExtractError),
                                  Effect.tap((aligned) =>
                                    Ref.update(perDocumentRef, (state) => {
                                      const next = [...state]
                                      next[chunk.documentIndex] = [
                                        ...(next[chunk.documentIndex] ?? []),
                                        ...aligned
                                      ]
                                      return next
                                    }).pipe(
                                      Effect.zipRight(
                                        markChunkComplete(chunk.documentIndex)
                                      )
                                    )
                                  ),
                                  Effect.asVoid
                                )
                            },
                            { discard: true }
                          )
                        ),
                        Effect.tap(() =>
                          logAnnotatorEvent("langextract.annotator.batch_complete", {
                            passNumber,
                            batchSize: prompts.length
                          })
                        ),
                        Effect.asVoid
                      )
                  )
                )
              },
              { concurrency: options.batchConcurrency }
            ),
            Stream.runDrain
          )
        ),
        Effect.matchCauseEffect({
          onFailure: (cause) => Queue.offer(queue, { _tag: "error", cause }),
          onSuccess: () => Queue.offer(queue, { _tag: "end" })
        })
      )

      yield* Effect.forkScoped(producer)

      return Stream.unfoldEffect(undefined as void, (state) =>
        Queue.take(queue).pipe(
          Effect.flatMap(
            (
              item
            ): Effect.Effect<
              Option.Option<readonly [AnnotatedPassDocument, void]>,
              LangExtractError
            > => {
              switch (item._tag) {
                case "value":
                  return Effect.succeed(Option.some([item.value, state] as const))
                case "end":
                  return Effect.succeed(Option.none())
                case "error":
                  return Effect.failCause(item.cause)
              }
            }
          )
        )
      )
    })
  )

const annotateDocumentsImpl = (
  documents: ReadonlyArray<Document>,
  options: AnnotateOptions,
  dependencies: AnnotatorDependencies
): Stream.Stream<AnnotatedDocument, LangExtractError> =>
  Stream.unwrapScoped(
    Effect.gen(function* () {
      const passes = Math.max(1, options.extractionPasses)
      const passPlan = Array.from({ length: passes }, (_, index) => ({
        passNumber: options.passNumber ?? index + 1,
        isFinal: index === passes - 1
      }))
      const mergedRef = yield* Ref.make(documents.map(defaultAnnotatedDocument))

      return Stream.fromIterable(passPlan).pipe(
        Stream.flatMap(
          (pass) =>
            annotateDocumentsPassStream(
              documents,
              options,
              dependencies,
              pass.passNumber
            ).pipe(
              Stream.mapEffect(({ document, documentIndex }) =>
                Ref.modify(mergedRef, (state) => {
                  const existing = state[documentIndex]
                  if (existing === undefined) {
                    return [document, state] as const
                  }

                  const mergedDocument = new AnnotatedDocument({
                    text: existing.text,
                    ...(existing.documentId !== undefined
                      ? { documentId: existing.documentId }
                      : {}),
                    extractions: sortExtractions(
                      mergeExtractions(existing.extractions, document.extractions)
                    )
                  })

                  const next = [...state]
                  next[documentIndex] = mergedDocument
                  return [mergedDocument, next] as const
                })
              ),
              Stream.flatMap((document) =>
                pass.isFinal ? Stream.succeed(document) : Stream.empty
              )
            ),
          { concurrency: 1 }
        )
      )
    })
  )

const annotateTextImpl = (
  text: string,
  options: AnnotateOptions,
  dependencies: AnnotatorDependencies
): Effect.Effect<AnnotatedDocument, LangExtractError> =>
  Effect.gen(function* () {
    const document = yield* makeDocumentEffect({
      text,
      ...(options.additionalContext !== undefined
        ? { additionalContext: options.additionalContext }
        : {})
    }).pipe(
      Effect.provideService(DocumentIdGenerator, dependencies.documentIdGenerator)
    )

    const annotated = yield* annotateDocumentsImpl(
      [document],
      options,
      dependencies
    ).pipe(
      Stream.runCollect,
      Effect.map((values) => Chunk.toReadonlyArray(values))
    )
    return annotated[0] ?? new AnnotatedDocument({ text })
  })

export class Annotator extends Effect.Service<Annotator>()(
  "@effect-langextract/Annotator",
  {
    dependencies: [
      Tokenizer.Default,
      PromptBuilder.Default,
      LanguageModel.Default,
      AlignmentExecutor.Default,
      FormatHandler.Default,
      Resolver.Default,
      DocumentIdGenerator.Default
    ],
    effect: Effect.gen(function* () {
      const tokenizer = yield* Tokenizer
      const promptBuilder = yield* PromptBuilder
      const languageModel = yield* LanguageModel
      const alignmentExecutor = yield* AlignmentExecutor
      const formatHandler = yield* FormatHandler
      const resolver = yield* Resolver
      const documentIdGenerator = yield* DocumentIdGenerator
      const dependencies: AnnotatorDependencies = {
        tokenizer,
        promptBuilder,
        languageModel,
        alignmentExecutor,
        formatHandler,
        resolver,
        documentIdGenerator
      }
      return {
        annotateDocuments: (documents, options) =>
          annotateDocumentsImpl(documents, options, dependencies),
        annotateText: (text, options) =>
          annotateTextImpl(text, options, dependencies)
      } satisfies AnnotatorService
    })
  }
) {
  static readonly Test: Layer.Layer<Annotator> = Annotator.Default

  static testLayer = (
    service?: AnnotatorService
  ): Layer.Layer<
    Annotator,
    never,
    | Tokenizer
    | PromptBuilder
    | LanguageModel
    | AlignmentExecutor
    | FormatHandler
    | Resolver
    | DocumentIdGenerator
  > =>
    service !== undefined
      ? Layer.succeed(Annotator, Annotator.make(service))
      : Annotator.DefaultWithoutDependencies
}

export const AnnotatorLive: Layer.Layer<Annotator> = Annotator.Default

export const AnnotatorTest: Layer.Layer<Annotator> = Annotator.Test
