/**
 * NLP Toolkit - bundles all NLP tools with handler implementations.
 * Provides a composed layer backed by existing NLP services.
 * @since 3.0.0
 */

import { Chunk, Data, Effect, HashSet, Layer, Option, Schema } from "effect"
import { Toolkit } from "@effect/ai"
import { BowCosineSimilarity } from "./BowCosineSimilarity.js"
import { ChunkBySentences } from "./ChunkBySentences.js"
import { CorpusStats } from "./CorpusStats.js"
import { CreateCorpus } from "./CreateCorpus.js"
import { DeleteCorpus } from "./DeleteCorpus.js"
import { DocumentStats } from "./DocumentStats.js"
import { ExtractEntities } from "./ExtractEntities.js"
import { ExtractKeywords } from "./ExtractKeywords.js"
import { LearnCorpus } from "./LearnCorpus.js"
import { LearnCustomEntities } from "./LearnCustomEntities.js"
import { NGrams } from "./NGrams.js"
import { PhoneticMatch } from "./PhoneticMatch.js"
import { QueryCorpus } from "./QueryCorpus.js"
import { RankByRelevance } from "./RankByRelevance.js"
import { Sentences } from "./Sentences.js"
import { Tokenize } from "./Tokenize.js"
import { TextSimilarity } from "./TextSimilarity.js"
import { TverskySimilarity } from "./TverskySimilarity.js"
import { TransformText } from "./TransformText.js"
import { Tokenization } from "../Core/Tokenization.js"
import type { Token } from "../Core/Token.js"
import { WinkCorpusManager } from "../Wink/WinkCorpusManager.js"
import { WinkEngine } from "../Wink/WinkEngine.js"
import {
  CustomEntityExample,
  EntityGroupName,
  WinkEngineCustomEntities
} from "../Wink/WinkPattern.js"
import { BagOfWords, WinkVectorizer, type TermFrequency } from "../Wink/WinkVectorizer.js"
import {
  BOWCosineSimilarityRequest,
  CosineSimilarityRequest,
  DocumentTermSet,
  TverskyParams,
  TverskySimilarityRequest,
  WinkSimilarity
} from "../Wink/WinkSimilarity.js"
import {
  NGramConfig,
  TextInput,
  TokensInput,
  WinkUtils,
  WinkUtilsLive
} from "../Wink/WinkUtils.js"
import { WinkLayerLive } from "../Wink/Layer.js"

export const NlpToolkit = Toolkit.make(
  BowCosineSimilarity,
  ChunkBySentences,
  CorpusStats,
  CreateCorpus,
  DeleteCorpus,
  DocumentStats,
  ExtractEntities,
  ExtractKeywords,
  LearnCorpus,
  LearnCustomEntities,
  NGrams,
  PhoneticMatch,
  QueryCorpus,
  RankByRelevance,
  Sentences,
  TextSimilarity,
  TverskySimilarity,
  Tokenize,
  TransformText
)

const unwrapOptionString = (opt: Option.Option<string | undefined>): string =>
  Option.match(opt, {
    onNone: () => "",
    onSome: (v) => v ?? ""
  })

const tokenToAi = (token: Token) => ({
  text: token.text,
  pos: unwrapOptionString(token.pos),
  lemma: unwrapOptionString(token.lemma),
  stem: unwrapOptionString(token.stem),
  isStopWord: Option.match(token.stopWordFlag, {
    onNone: () => false,
    onSome: (v) => v ?? false
  }),
  isPunctuation: Option.match(token.shape, {
    onNone: () => false,
    onSome: (shape) => !/[Xxd]/.test(shape as string)
  }),
  start: token.start as number,
  end: token.end as number
})

const isPunctuationToken = (token: Token): boolean =>
  Option.match(token.shape, {
    onNone: () => false,
    onSome: (shape) => !/[Xxd]/.test(shape as string)
  })

const isWordLikeToken = (token: Token): boolean =>
  !isPunctuationToken(token) && /[\p{L}\p{N}]/u.test(token.text)

const normalizedTokenText = (token: Token): string =>
  Option.match(token.normal, {
    onNone: () => token.text,
    onSome: (normal) => normal ?? token.text
  })

const uniqueNormalizedTerms = (
  tokens: Chunk.Chunk<Token>
): Chunk.Chunk<string> =>
  Chunk.fromIterable(
    [
      ...new Set(
        Chunk.toReadonlyArray(tokens)
          .map((token) => normalizedTokenText(token).trim())
          .filter((term) => term.length > 0)
      )
    ]
  )

const tokenBagOfWords = (tokens: Chunk.Chunk<Token>): Record<string, number> => {
  const bag: Record<string, number> = {}
  for (const token of Chunk.toReadonlyArray(tokens)) {
    const term = normalizedTokenText(token).trim()
    if (term.length === 0) continue
    bag[term] = (bag[term] ?? 0) + 1
  }
  return bag
}

type NGramMode = "bag" | "edge" | "set"

type PhoneticAlgorithm = "soundex" | "phonetize"

const ngramResultToEntries = (
  ngrams: Record<string, number>,
  topN: number
): ReadonlyArray<{
  readonly value: string
  readonly count: number
}> =>
  Object.entries(ngrams)
    .map(([value, count]) => ({
      value,
      count: Number.isFinite(count) ? count : 0
    }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    .slice(0, topN)

const uniqueSortedStrings = (
  values: ReadonlyArray<string>
): ReadonlyArray<string> =>
  [...new Set(values)].sort((a, b) => a.localeCompare(b))

const setJaccard = (
  leftValues: ReadonlyArray<string>,
  rightValues: ReadonlyArray<string>
): number => {
  const leftSet = new Set(leftValues)
  const rightSet = new Set(rightValues)

  if (leftSet.size === 0 && rightSet.size === 0) return 0

  let intersectionSize = 0
  for (const value of leftSet) {
    if (rightSet.has(value)) intersectionSize++
  }

  const unionSize = new Set([...leftSet, ...rightSet]).size
  if (unionSize === 0) return 0
  return intersectionSize / unionSize
}

const toPositiveInteger = (value: number, fallback: number): number => {
  if (!Number.isFinite(value)) return fallback
  const rounded = Math.floor(value)
  return rounded >= 1 ? rounded : fallback
}

const BracketPatternElement = Schema.String.pipe(
  Schema.minLength(3),
  Schema.pattern(/^\[[^\]]+\]$/)
)

interface SentenceSpan {
  readonly index: number
  readonly text: string
}

interface RawEntityDetail {
  readonly value?: unknown
  readonly type?: unknown
}

interface AiEntity {
  readonly value: string
  readonly type: string
  readonly start: number
  readonly end: number
  readonly startTokenIndex: number
  readonly endTokenIndex: number
  readonly source: "builtin" | "custom"
}

const mapWinkEntityOutput = (
  details: ReadonlyArray<RawEntityDetail>,
  spans: ReadonlyArray<ReadonlyArray<number>>,
  tokenArray: ReadonlyArray<Token>,
  source: "builtin" | "custom"
): ReadonlyArray<AiEntity> =>
  details.map((detail, index) => {
    const rawSpan = spans[index]
    const value =
      typeof detail.value === "string"
        ? detail.value
        : String(detail.value ?? "")
    const type =
      typeof detail.type === "string"
        ? detail.type
        : String(detail.type ?? "")

    let startTokenIndex = 0
    let endTokenIndex = 0

    if (
      tokenArray.length > 0 &&
      Array.isArray(rawSpan) &&
      rawSpan.length >= 2 &&
      typeof rawSpan[0] === "number" &&
      typeof rawSpan[1] === "number"
    ) {
      const maxTokenIndex = tokenArray.length - 1
      const a = Math.floor(rawSpan[0])
      const b = Math.floor(rawSpan[1])
      startTokenIndex = Math.max(0, Math.min(maxTokenIndex, Math.min(a, b)))
      endTokenIndex = Math.max(
        startTokenIndex,
        Math.min(maxTokenIndex, Math.max(a, b))
      )
    }

    const startToken = tokenArray[startTokenIndex]
    const endToken = tokenArray[endTokenIndex]
    const start = startToken !== undefined ? (startToken.start as number) : 0
    const end =
      endToken !== undefined ? (endToken.end as number) : start + value.length

    return {
      value,
      type,
      start,
      end: Math.max(start, end),
      startTokenIndex,
      endTokenIndex,
      source
    }
  })

type OperationName =
  | "lowercase"
  | "uppercase"
  | "trim"
  | "removeHtml"
  | "removePunctuation"
  | "removeExtraSpaces"
  | "removeSpecialChars"
  | "retainAlphaNums"
  | "removeElisions"

const applyOperation = (
  utils: WinkUtils["Type"],
  op: OperationName,
  text: string
) => {
  const input = TextInput({ text })
  switch (op) {
    case "lowercase":
      return utils.lowerCase(input)
    case "uppercase":
      return utils.upperCase(input)
    case "trim":
      return utils.trim(input)
    case "removeHtml":
      return utils.removeHTMLTags(input)
    case "removePunctuation":
      return utils.removePunctuations(input)
    case "removeExtraSpaces":
      return utils.removeExtraSpaces(input)
    case "removeSpecialChars":
      return utils.removeSplChars(input)
    case "retainAlphaNums":
      return utils.retainAlphaNums(input)
    case "removeElisions":
      return utils.removeElisions(input)
  }
}

export const NlpToolkitLive = NlpToolkit.toLayer(
  Effect.gen(function*() {
    const corpusManager = yield* WinkCorpusManager
    const engine = yield* WinkEngine
    const tokenization = yield* Tokenization
    const vectorizer = yield* WinkVectorizer
    const sim = yield* WinkSimilarity
    const utils = yield* WinkUtils

    return {
      BowCosineSimilarity: ({ text1, text2 }) =>
        Effect.gen(function*() {
          const doc1 = yield* tokenization.document(text1, "bow-text1")
          const doc2 = yield* tokenization.document(text2, "bow-text2")
          const bow1 = BagOfWords({
            documentId: doc1.id,
            bow: tokenBagOfWords(doc1.tokens)
          })
          const bow2 = BagOfWords({
            documentId: doc2.id,
            bow: tokenBagOfWords(doc2.tokens)
          })
          const result = yield* sim.bowCosine(
            BOWCosineSimilarityRequest({ bow1, bow2 })
          )
          return {
            score: Number.isFinite(result.score) ? result.score : 0,
            method: "bow.cosine" as const
          }
        }).pipe(Effect.orDie),

      ChunkBySentences: ({ maxChunkChars, text }) =>
        Effect.gen(function*() {
          const doc = yield* tokenization.document(text, "chunks-doc")
          const sentenceArray = Chunk.toReadonlyArray(doc.sentences).map((s) => ({
            index: s.index as number,
            text: s.text.trim()
          }))

          const sentences = sentenceArray.filter(
            (sentence): sentence is SentenceSpan => sentence.text.length > 0
          )

          if (sentences.length === 0) {
            return {
              chunks: [],
              chunkCount: 0,
              originalSentenceCount: sentenceArray.length
            }
          }

          const targetSize = toPositiveInteger(maxChunkChars, 1)
          const chunks: Array<{
            readonly text: string
            readonly sentenceCount: number
            readonly charCount: number
            readonly startSentenceIndex: number
            readonly endSentenceIndex: number
          }> = []

          let currentText = ""
          let currentStartSentence = -1
          let currentEndSentence = -1

          const flushCurrent = () => {
            if (currentStartSentence < 0 || currentText.length === 0) return
            chunks.push({
              text: currentText,
              sentenceCount: currentEndSentence - currentStartSentence + 1,
              charCount: currentText.length,
              startSentenceIndex: currentStartSentence,
              endSentenceIndex: currentEndSentence
            })
          }

          for (const sentence of sentences) {
            if (currentStartSentence < 0) {
              currentText = sentence.text
              currentStartSentence = sentence.index
              currentEndSentence = sentence.index
              continue
            }

            const candidateText = `${currentText} ${sentence.text}`
            const candidateLength = candidateText.length

            if (candidateLength <= targetSize) {
              currentText = candidateText
              currentEndSentence = sentence.index
              continue
            }

            flushCurrent()
            currentText = sentence.text
            currentStartSentence = sentence.index
            currentEndSentence = sentence.index
          }

          flushCurrent()

          return {
            chunks,
            chunkCount: chunks.length,
            originalSentenceCount: sentenceArray.length
          }
        }).pipe(Effect.orDie),

      CorpusStats: ({ corpusId, includeIdf, includeMatrix, topIdfTerms }) =>
        corpusManager.getStats({
          corpusId,
          ...(includeIdf === undefined ? {} : { includeIdf }),
          ...(includeMatrix === undefined ? {} : { includeMatrix }),
          ...(topIdfTerms === undefined ? {} : { topIdfTerms })
        }).pipe(Effect.orDie),

      CreateCorpus: ({ bm25Config, corpusId }) =>
        Effect.gen(function*() {
          const normalizedConfig =
            bm25Config === undefined
              ? undefined
              : {
                  ...(bm25Config.k1 === undefined ? {} : { k1: bm25Config.k1 }),
                  ...(bm25Config.b === undefined ? {} : { b: bm25Config.b }),
                  ...(bm25Config.k === undefined ? {} : { k: bm25Config.k }),
                  ...(bm25Config.norm === undefined ? {} : { norm: bm25Config.norm })
                }

          return yield* corpusManager.createCorpus(
            normalizedConfig === undefined && corpusId === undefined
              ? undefined
              : {
                  ...(corpusId === undefined ? {} : { corpusId }),
                  ...(normalizedConfig === undefined
                    ? {}
                    : { bm25Config: normalizedConfig })
                }
          )
        }).pipe(Effect.orDie),

      DeleteCorpus: ({ corpusId }) =>
        Effect.gen(function*() {
          const deleted = yield* corpusManager.deleteCorpus(corpusId)
          return {
            corpusId,
            deleted
          }
        }).pipe(Effect.orDie),

      DocumentStats: ({ text }) =>
        Effect.gen(function*() {
          const doc = yield* tokenization.document(text, "stats-doc")
          const tokenArray = Chunk.toReadonlyArray(doc.tokens)
          const sentenceArray = Chunk.toReadonlyArray(doc.sentences)
          const wordCount = tokenArray.filter((token) => isWordLikeToken(token)).length
          const sentenceCount = sentenceArray.length
          return {
            wordCount,
            sentenceCount,
            avgSentenceLength:
              sentenceCount > 0 ? wordCount / sentenceCount : 0,
            charCount: text.length
          }
        }).pipe(Effect.orDie),

      ExtractEntities: ({ includeCustom, text }) =>
        Effect.gen(function*() {
          const winkDoc = yield* engine.getWinkDoc(text)
          const its = yield* engine.its
          const doc = yield* tokenization.document(text, "entities-doc")
          const tokenArray = Chunk.toReadonlyArray(doc.tokens)

          const builtinDetails = winkDoc.entities().out(its.detail) as ReadonlyArray<
            RawEntityDetail
          >
          const builtinSpans = winkDoc.entities().out(its.span) as ReadonlyArray<
            ReadonlyArray<number>
          >

          const entities = mapWinkEntityOutput(
            builtinDetails,
            builtinSpans,
            tokenArray,
            "builtin"
          )
          const entityTypes = [...new Set(entities.map((entity) => entity.type))].sort(
            (a, b) => a.localeCompare(b)
          )

          const shouldIncludeCustom = includeCustom ?? true

          const customEntities = shouldIncludeCustom
            ? mapWinkEntityOutput(
                winkDoc.customEntities().out(its.detail) as ReadonlyArray<RawEntityDetail>,
                winkDoc.customEntities().out(its.span) as ReadonlyArray<
                  ReadonlyArray<number>
                >,
                tokenArray,
                "custom"
              )
            : []

          const customEntityTypes = [
            ...new Set(customEntities.map((entity) => entity.type))
          ].sort((a, b) => a.localeCompare(b))

          const allEntities = [...entities, ...customEntities].sort(
            (a, b) =>
              a.start - b.start ||
              a.end - b.end ||
              a.startTokenIndex - b.startTokenIndex
          )

          return {
            entities,
            entityCount: entities.length,
            entityTypes,
            customEntities,
            customEntityCount: customEntities.length,
            customEntityTypes,
            allEntities,
            allEntityCount: allEntities.length
          }
        }).pipe(Effect.orDie),

      ExtractKeywords: ({ text, topN }) =>
        vectorizer.withFreshInstance((vec) =>
          Effect.gen(function*() {
            const doc = yield* tokenization.document(text, "keywords-doc")
            yield* vec.learnDocument(doc)
            const tfs = yield* vec.getDocumentTermFrequencies(0)
            const tfArray = Chunk.toReadonlyArray(tfs) as ReadonlyArray<TermFrequency>
            const sorted = [...tfArray]
              .sort((a, b) => b.frequency - a.frequency)
              .slice(0, topN ?? 10)
              .map((tf) => ({ term: tf.term, score: tf.frequency }))
            return { keywords: sorted }
          })
        ).pipe(Effect.orDie),

      LearnCorpus: ({ corpusId, dedupeById, documents }) =>
        Effect.gen(function*() {
          const timestamp = Date.now()
          const docs = yield* Effect.forEach(
            documents,
            (document, index) =>
              tokenization.document(
                document.text,
                document.id ?? `${corpusId}-doc-${timestamp}-${index}`
              )
          )

          return yield* corpusManager.learnDocuments({
            corpusId,
            documents: Chunk.fromIterable(docs),
            ...(dedupeById === undefined ? {} : { dedupeById })
          })
        }).pipe(Effect.orDie),

      LearnCustomEntities: ({ entities, groupName, mode }) =>
        Effect.gen(function*() {
          yield* Effect.forEach(
            entities,
            (entity) =>
              Schema.decodeUnknown(Schema.NonEmptyArray(BracketPatternElement))(entity.patterns),
            { discard: true }
          )

          const requestedMode = mode ?? "append"
          const incoming = new WinkEngineCustomEntities({
            name: EntityGroupName.make(groupName ?? "custom-entities"),
            patterns: HashSet.fromIterable(
              entities.map(
                (entity) =>
                  new CustomEntityExample({
                    name: entity.name,
                    patterns: Data.array(entity.patterns),
                    ...(entity.mark === undefined ? {} : { mark: entity.mark })
                  })
              )
            )
          })

          const nextEntities =
            requestedMode === "append"
              ? yield* engine.getCurrentCustomEntities().pipe(
                  Effect.map((current) =>
                    Option.match(current, {
                      onNone: () => incoming,
                      onSome: (existing) => existing.merge(incoming, incoming.name)
                    })
                  )
                )
              : incoming

          yield* engine.learnCustomEntities(nextEntities)

          const entityNames = nextEntities
            .toArray()
            .map((entity) => entity.name)
            .sort((a, b) => a.localeCompare(b))

          return {
            groupName: nextEntities.name,
            mode: requestedMode,
            learnedEntityCount: incoming.size(),
            totalEntityCount: nextEntities.size(),
            entityNames
          }
        }).pipe(Effect.orDie),

      NGrams: ({ mode, size, text, topN }) =>
        Effect.gen(function*() {
          const resolvedMode: NGramMode = mode ?? "bag"
          const resolvedSize = toPositiveInteger(size, 1)
          const ngramConfig = NGramConfig({ size: resolvedSize })
          const ngramInput = TextInput({ text })

          const ngramResult = yield* (resolvedMode === "bag"
            ? utils.bagOfNGrams(ngramInput, ngramConfig)
            : resolvedMode === "edge"
              ? utils.edgeNGrams(ngramInput, ngramConfig)
              : utils.setOfNGrams(ngramInput, ngramConfig))

          const limit = topN === undefined
            ? ngramResult.uniqueNGrams
            : toPositiveInteger(topN, ngramResult.uniqueNGrams)
          const ngrams = ngramResultToEntries(
            ngramResult.ngrams,
            Math.max(0, limit)
          )

          return {
            mode: resolvedMode,
            size: resolvedSize,
            ngrams,
            totalNGrams: ngramResult.totalNGrams,
            uniqueNGrams: ngramResult.uniqueNGrams
          }
        }).pipe(Effect.orDie),

      PhoneticMatch: ({ algorithm, minTokenLength, text1, text2 }) =>
        Effect.gen(function*() {
          const resolvedAlgorithm: PhoneticAlgorithm = algorithm ?? "soundex"
          const resolvedMinTokenLength = minTokenLength ?? 2

          const toCandidateTokens = (tokens: Chunk.Chunk<Token>): Chunk.Chunk<string> =>
            Chunk.fromIterable(
              Chunk.toReadonlyArray(tokens)
                .filter(isWordLikeToken)
                .map((token) => normalizedTokenText(token).trim().toLowerCase())
                .filter((token) => token.length >= resolvedMinTokenLength)
            )

          const encodeTokens = (tokens: Chunk.Chunk<string>) => {
            const input = TokensInput({ tokens })
            return resolvedAlgorithm === "soundex"
              ? utils.soundex(input)
              : utils.phonetize(input)
          }

          const leftTokens = toCandidateTokens(yield* tokenization.tokenize(text1))
          const rightTokens = toCandidateTokens(yield* tokenization.tokenize(text2))

          const leftCodesRaw = Chunk.toReadonlyArray((yield* encodeTokens(leftTokens)).tokens)
          const rightCodesRaw = Chunk.toReadonlyArray((yield* encodeTokens(rightTokens)).tokens)

          const leftCodes = uniqueSortedStrings(
            leftCodesRaw
              .map((code) => code.trim())
              .filter((code) => code.length > 0)
          )
          const rightCodes = uniqueSortedStrings(
            rightCodesRaw
              .map((code) => code.trim())
              .filter((code) => code.length > 0)
          )
          const sharedCodes = leftCodes.filter((code) => rightCodes.includes(code))

          return {
            algorithm: resolvedAlgorithm,
            score: setJaccard(leftCodes, rightCodes),
            sharedCodes,
            leftCodes,
            rightCodes
          }
        }).pipe(Effect.orDie),

      QueryCorpus: ({ corpusId, includeText, query, topN }) =>
        corpusManager.query({
          corpusId,
          query,
          ...(topN === undefined ? {} : { topN }),
          ...(includeText === undefined ? {} : { includeText })
        }).pipe(Effect.orDie),

      RankByRelevance: ({ query, texts, topN }) =>
        vectorizer.withFreshInstance((vec) =>
          Effect.gen(function*() {
            if (texts.length === 0) {
              return {
                ranked: [],
                totalTexts: 0,
                returned: 0
              }
            }

            const limit = Math.min(
              texts.length,
              topN === undefined
                ? texts.length
                : toPositiveInteger(topN, texts.length)
            )

            const docs = yield* Effect.forEach(
              texts,
              (text, index) => tokenization.document(text, `rank-doc-${index}`)
            )

            yield* Effect.forEach(docs, (doc) => vec.learnDocument(doc), {
              discard: true
            })

            const queryDoc = yield* tokenization.document(query, "rank-query")
            const queryVector = yield* vec.vectorizeDocument(queryDoc)

            const scored = yield* Effect.forEach(
              docs,
              (doc, index) =>
                Effect.gen(function*() {
                  const candidateVector = yield* vec.vectorizeDocument(doc)
                  const result = yield* sim.vectorCosine(
                    CosineSimilarityRequest({
                      vector1: queryVector,
                      vector2: candidateVector
                    })
                  )
                  return {
                    index,
                    score: Number.isFinite(result.score) ? result.score : 0
                  }
                })
            )

            const ranked = [...scored]
              .sort((a, b) => b.score - a.score || a.index - b.index)
              .slice(0, limit)

            return {
              ranked,
              totalTexts: texts.length,
              returned: ranked.length
            }
          })
        ).pipe(Effect.orDie),

      Sentences: ({ text }) =>
        Effect.gen(function*() {
          const doc = yield* tokenization.document(text)
          const sArr = Chunk.toReadonlyArray(doc.sentences).map((s) => {
            const tokens = Chunk.toReadonlyArray(s.tokens)
            const firstToken = tokens[0]
            const lastToken = tokens[tokens.length - 1]
            return {
              text: s.text,
              tokenCount: tokens.length,
              index: s.index as number,
              start: firstToken !== undefined ? (firstToken.start as number) : 0,
              end: lastToken !== undefined ? (lastToken.end as number) : 0
            }
          })
          return { sentences: sArr, sentenceCount: sArr.length }
        }).pipe(Effect.orDie),

      TextSimilarity: ({ text1, text2 }) =>
        vectorizer.withFreshInstance((vec) =>
          Effect.gen(function*() {
            const doc1 = yield* tokenization.document(text1, "text1")
            const doc2 = yield* tokenization.document(text2, "text2")
            yield* vec.learnDocument(doc1)
            yield* vec.learnDocument(doc2)
            const vec1 = yield* vec.vectorizeDocument(doc1)
            const vec2 = yield* vec.vectorizeDocument(doc2)
            const result = yield* sim.vectorCosine(
              CosineSimilarityRequest({ vector1: vec1, vector2: vec2 })
            )
            return { score: result.score, method: result.method }
          })
        ).pipe(Effect.orDie),

      TverskySimilarity: ({ alpha, beta, text1, text2 }) =>
        Effect.gen(function*() {
          const resolvedAlpha = alpha ?? 0.5
          const resolvedBeta = beta ?? 0.5
          const doc1 = yield* tokenization.document(text1, "tversky-text1")
          const doc2 = yield* tokenization.document(text2, "tversky-text2")
          const set1 = DocumentTermSet({
            documentId: doc1.id,
            terms: uniqueNormalizedTerms(doc1.tokens)
          })
          const set2 = DocumentTermSet({
            documentId: doc2.id,
            terms: uniqueNormalizedTerms(doc2.tokens)
          })
          const result = yield* sim.setTversky(
            TverskySimilarityRequest({
              set1,
              set2,
              params: TverskyParams({
                alpha: resolvedAlpha,
                beta: resolvedBeta
              })
            })
          )
          return {
            score: Number.isFinite(result.score) ? result.score : 0,
            method: "set.tversky" as const,
            alpha: resolvedAlpha,
            beta: resolvedBeta
          }
        }).pipe(Effect.orDie),

      Tokenize: ({ text }) =>
        Effect.gen(function*() {
          const tokens = yield* tokenization.tokenize(text)
          const arr = Chunk.toReadonlyArray(tokens).map(tokenToAi)
          return { tokens: arr as Array<(typeof arr)[number]>, tokenCount: arr.length }
        }).pipe(Effect.orDie),

      TransformText: ({ operations, text }) =>
        Effect.gen(function*() {
          let current = text
          const applied: Array<string> = []
          for (const op of operations) {
            const result = yield* applyOperation(utils, op as OperationName, current)
            current = result.text
            applied.push(op)
          }
          return { result: current, operationsApplied: applied }
        }).pipe(Effect.orDie)
    }
  })
).pipe(
  Layer.provide(WinkLayerLive),
  Layer.provide(WinkUtilsLive)
)
