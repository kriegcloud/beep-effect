import { Effect, Schema } from "effect"

import { CharInterval, Document } from "./Data.js"
import type { TokenizerService } from "./Tokenizer.js"
import { TokenInterval } from "./Tokenizer.js"

export class TextChunk extends Schema.Class<TextChunk>("TextChunk")({
  documentIndex: Schema.Int,
  documentId: Schema.optionalWith(Schema.String, { exact: true }),
  chunkText: Schema.String,
  sanitizedChunkText: Schema.String,
  charInterval: CharInterval,
  tokenInterval: TokenInterval,
  additionalContext: Schema.optionalWith(Schema.String, { exact: true })
}) {}

export type BatchBuildOptions<T> = {
  readonly targetBatchLength: number
  readonly maxBatchInputTokens?: number | undefined
  readonly estimateTokens: (item: T) => number
}

export const makeBatches = <T>(
  items: ReadonlyArray<T>,
  options: BatchBuildOptions<T>
): ReadonlyArray<ReadonlyArray<T>> => {
  const batches: Array<Array<T>> = []
  let currentBatch: Array<T> = []
  let currentTokens = 0

  const flush = () => {
    if (currentBatch.length > 0) {
      batches.push(currentBatch)
      currentBatch = []
      currentTokens = 0
    }
  }

  for (const item of items) {
    const tokens = options.estimateTokens(item)
    const hitBatchLength = currentBatch.length >= options.targetBatchLength
    const hitTokenBudget =
      options.maxBatchInputTokens !== undefined &&
      currentTokens + tokens > options.maxBatchInputTokens

    if (hitBatchLength || hitTokenBudget) {
      flush()
    }

    currentBatch.push(item)
    currentTokens += tokens
  }

  flush()
  return batches
}

const sanitizeChunkText = (text: string): string => text.trim()

const tokenIntervalForChunk = (
  tokenized: ReturnType<TokenizerService["tokenize"]>,
  start: number,
  end: number
): TokenInterval => {
  const tokens = tokenized.tokens
  if (tokens.length === 0) {
    return new TokenInterval({
      startIndex: 0,
      endIndex: 0
    })
  }

  let startIndex = -1
  let endIndex = -1
  for (const token of tokens) {
    const tokenStart = token.charInterval.startPos ?? 0
    const tokenEnd = token.charInterval.endPos ?? tokenStart
    if (startIndex < 0 && tokenEnd > start) {
      startIndex = token.index
    }
    if (tokenStart < end) {
      endIndex = token.index + 1
    } else {
      break
    }
  }

  const boundedStart = Math.max(0, startIndex < 0 ? 0 : startIndex)
  const boundedEnd = Math.max(boundedStart, endIndex < 0 ? boundedStart : endIndex)

  return new TokenInterval({
    startIndex: boundedStart,
    endIndex: boundedEnd
  })
}

export const chunkDocuments = (
  documents: ReadonlyArray<Document>,
  maxCharBuffer: number,
  tokenizer: TokenizerService
): Effect.Effect<ReadonlyArray<TextChunk>> =>
  Effect.sync(() => {
    const chunks: Array<TextChunk> = []

    for (const [documentIndex, document] of documents.entries()) {
      const tokenized = tokenizer.tokenize(document.text)
      const text = document.text

      for (let start = 0; start < text.length; start += maxCharBuffer) {
        const end = Math.min(text.length, start + maxCharBuffer)
        const chunkText = text.slice(start, end)

        chunks.push(
          new TextChunk({
            documentIndex,
            chunkText,
            sanitizedChunkText: sanitizeChunkText(chunkText),
            charInterval: new CharInterval({
              startPos: start,
              endPos: end
            }),
            tokenInterval: tokenIntervalForChunk(tokenized, start, end),
            ...(document.documentId !== undefined
              ? { documentId: document.documentId }
              : {}),
            ...(document.additionalContext !== undefined
              ? { additionalContext: document.additionalContext }
              : {})
          })
        )
      }
    }

    return chunks
  })
