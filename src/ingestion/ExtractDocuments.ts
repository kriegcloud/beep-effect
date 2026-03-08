import { Chunk, Effect, Stream } from "effect"

import { type AnnotateOptions,Annotator } from "../Annotator.js"
import { type AnnotatedDocument,type Document } from "../Data.js"
import { LangExtractError } from "../Errors.js"

export interface ExtractDocumentsOptions extends AnnotateOptions {
  readonly documentBatchSize?: number | undefined
}

export const extractDocumentsStream = <E, R>(
  documents: Stream.Stream<Document, E, R>,
  options: ExtractDocumentsOptions
): Stream.Stream<AnnotatedDocument, E | LangExtractError, R | Annotator> => {
  const documentBatchSize = Math.max(1, options.documentBatchSize ?? 100)

  return documents.pipe(
    Stream.grouped(documentBatchSize),
    Stream.flatMap((group) => {
      const batch = Chunk.toReadonlyArray(group)
      if (batch.length === 0) {
        return Stream.empty
      }

      return Stream.unwrap(
        Effect.gen(function* () {
          const annotator = yield* Annotator
          return annotator.annotateDocuments(batch, {
            maxCharBuffer: options.maxCharBuffer,
            batchLength: options.batchLength,
            batchConcurrency: options.batchConcurrency,
            providerConcurrency: options.providerConcurrency,
            passNumber: options.passNumber,
            extractionPasses: options.extractionPasses,
            contextWindowChars: options.contextWindowChars,
            additionalContext: options.additionalContext,
            maxBatchInputTokens: options.maxBatchInputTokens,
            cachePolicy: options.cachePolicy,
            promptDescription: options.promptDescription,
            promptExamples: options.promptExamples,
            extractionTarget: options.extractionTarget
          })
        })
      )
    }, { concurrency: 1 })
  )
}
