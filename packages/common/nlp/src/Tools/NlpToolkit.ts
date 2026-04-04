/**
 * Live NLP toolkit composed from wink-backed services and tool definitions.
 *
 * @since 0.0.0
 * @module @beep/nlp/Tools/NlpToolkit
 */

import { Chunk, Clock, Effect, Inspectable, Layer, Match, Order, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Toolkit } from "effect/unstable/ai";
import { DocumentId } from "../Core/Document.ts";
import { BracketStringToPatternElement } from "../Core/PatternParsers.ts";
import type { Token } from "../Core/Token.ts";
import { Tokenization } from "../Core/Tokenization.ts";
import { ascendingNumber, ascendingString, descendingNumber } from "../internal/order.ts";
import { WinkLayerAllLive } from "../Wink/Layer.ts";
import { WinkCorpusManager } from "../Wink/WinkCorpusManager.ts";
import { WinkEngine } from "../Wink/WinkEngine.ts";
import { CustomEntityExample, EntityGroupName, WinkEngineCustomEntities } from "../Wink/WinkPattern.ts";
import { DocumentTermSet, TverskyParams, WinkSimilarity } from "../Wink/WinkSimilarity.ts";
import { WinkUtils, type WinkUtilsError } from "../Wink/WinkUtils.ts";
import { BagOfWords, WinkVectorizer } from "../Wink/WinkVectorizer.ts";
import { BowCosineSimilarity } from "./BowCosineSimilarity.ts";
import { ChunkBySentences } from "./ChunkBySentences.ts";
import { CorpusStats } from "./CorpusStats.ts";
import { CreateCorpus } from "./CreateCorpus.ts";
import { DeleteCorpus } from "./DeleteCorpus.ts";
import { DocumentStats } from "./DocumentStats.ts";
import { ExtractEntities } from "./ExtractEntities.ts";
import { ExtractKeywords } from "./ExtractKeywords.ts";
import { LearnCorpus } from "./LearnCorpus.ts";
import { LearnCustomEntities } from "./LearnCustomEntities.ts";
import { NGrams } from "./NGrams.ts";
import { PhoneticMatch } from "./PhoneticMatch.ts";
import { QueryCorpus } from "./QueryCorpus.ts";
import { RankByRelevance } from "./RankByRelevance.ts";
import { Sentences } from "./Sentences.ts";
import { TextSimilarity } from "./TextSimilarity.ts";
import { Tokenize } from "./Tokenize.ts";
import { TransformText } from "./TransformText.ts";
import { TverskySimilarity } from "./TverskySimilarity.ts";

const normalizeTerm = (token: Token): string => Str.trim(normalizedTokenText(token));
const emptyTermBag: Record<string, number> = {};

const unwrapOptionString = (value: O.Option<string>): string =>
  O.match(value, {
    onNone: () => "",
    onSome: (text) => text,
  });

const isPunctuationToken = (token: Token): boolean =>
  O.match(token.shape, {
    onNone: () => false,
    onSome: (shape) => !/[Xxd]/.test(shape),
  });

const isWordLikeToken = (token: Token): boolean => !isPunctuationToken(token) && /[\p{L}\p{N}]/u.test(token.text);

const normalizedTokenText = (token: Token): string =>
  O.match(token.normal, {
    onNone: () => token.text,
    onSome: (normal) => normal ?? token.text,
  });

const tokenBagOfWords = (tokens: ReadonlyArray<Token>): Record<string, number> => {
  return A.reduce(tokens, emptyTermBag, (bag, token) => {
    const term = normalizeTerm(token);
    return Str.isEmpty(term) ? bag : { ...bag, [term]: (bag[term] ?? 0) + 1 };
  });
};

const tokenToAi = (token: Token) => ({
  end: token.end,
  isPunctuation: isPunctuationToken(token),
  isStopWord: O.getOrElse(token.stopWordFlag, () => false),
  lemma: unwrapOptionString(token.lemma),
  pos: unwrapOptionString(token.pos),
  start: token.start,
  stem: unwrapOptionString(token.stem),
  text: token.text,
});

const uniqueNormalizedTerms = (tokens: ReadonlyArray<Token>): ReadonlyArray<string> =>
  pipe(tokens, A.map(normalizeTerm), A.filter(Str.isNonEmpty), A.dedupe, A.sort(Order.String));

const sortStrings = (values: ReadonlyArray<string>): ReadonlyArray<string> =>
  pipe(values, A.filter(Str.isNonEmpty), A.dedupe, A.sort(Order.String));

const setJaccard = (leftValues: ReadonlyArray<string>, rightValues: ReadonlyArray<string>): number => {
  const left = pipe(leftValues, A.dedupe);
  const right = pipe(rightValues, A.dedupe);
  const combined = pipe(left, A.union(right));

  if (A.isArrayEmpty(combined)) {
    return 0;
  }

  return pipe(left, A.intersection(right), A.length) / A.length(combined);
};

type EntityOutputDetail = {
  readonly type?: unknown;
  readonly value?: unknown;
};

const decodeEntityOutputDetails = (value: unknown): ReadonlyArray<EntityOutputDetail> =>
  A.isArray(value) ? A.map(value, (detail) => (P.isObject(detail) ? detail : {})) : [];

const decodeEntityOutputSpans = (value: unknown): ReadonlyArray<ReadonlyArray<number>> =>
  A.isArray(value) ? A.map(value, (span) => (A.isArray(span) && A.every(span, P.isNumber) ? span : [])) : [];

const mapEntityOutput = (
  details: ReadonlyArray<EntityOutputDetail>,
  spans: ReadonlyArray<ReadonlyArray<number>>,
  tokens: ReadonlyArray<Token>,
  source: "builtin" | "custom"
) =>
  A.map(details, (detail, index) => {
    const rawSpan = spans[index];
    const startTokenIndex =
      A.isArray(rawSpan) && A.length(rawSpan) >= 2 && P.isNumber(rawSpan[0])
        ? Math.max(0, Math.min(A.length(tokens) - 1, Math.floor(rawSpan[0])))
        : 0;
    const endTokenIndex =
      A.isArray(rawSpan) && A.length(rawSpan) >= 2 && P.isNumber(rawSpan[1])
        ? Math.max(startTokenIndex, Math.min(A.length(tokens) - 1, Math.floor(rawSpan[1])))
        : startTokenIndex;
    const startToken = tokens[startTokenIndex];
    const endToken = tokens[endTokenIndex];
    const value = P.isString(detail.value) ? detail.value : Inspectable.toStringUnknown(detail.value ?? "");

    return {
      end: endToken?.end ?? startToken?.end ?? Str.length(value),
      endTokenIndex,
      source,
      start: startToken?.start ?? 0,
      startTokenIndex,
      type: P.isString(detail.type) ? detail.type : Inspectable.toStringUnknown(detail.type ?? ""),
      value,
    };
  });

type TransformOperation =
  | "lowercase"
  | "uppercase"
  | "trim"
  | "removeHtml"
  | "removePunctuation"
  | "removeExtraSpaces"
  | "removeSpecialChars"
  | "retainAlphaNums"
  | "removeElisions";

type TransformUtils = {
  readonly lowerCase: (text: string) => Effect.Effect<string, WinkUtilsError>;
  readonly upperCase: (text: string) => Effect.Effect<string, WinkUtilsError>;
  readonly trim: (text: string) => Effect.Effect<string, WinkUtilsError>;
  readonly removeHTMLTags: (text: string) => Effect.Effect<string, WinkUtilsError>;
  readonly removePunctuations: (text: string) => Effect.Effect<string, WinkUtilsError>;
  readonly removeExtraSpaces: (text: string) => Effect.Effect<string, WinkUtilsError>;
  readonly removeSplChars: (text: string) => Effect.Effect<string, WinkUtilsError>;
  readonly retainAlphaNums: (text: string) => Effect.Effect<string, WinkUtilsError>;
  readonly removeElisions: (text: string) => Effect.Effect<string, WinkUtilsError>;
};

const applyTransformOperation = (utils: TransformUtils, operation: TransformOperation, text: string) =>
  Match.type<TransformOperation>().pipe(
    Match.when("lowercase", () => utils.lowerCase(text)),
    Match.when("uppercase", () => utils.upperCase(text)),
    Match.when("trim", () => utils.trim(text)),
    Match.when("removeHtml", () => utils.removeHTMLTags(text)),
    Match.when("removePunctuation", () => utils.removePunctuations(text)),
    Match.when("removeExtraSpaces", () => utils.removeExtraSpaces(text)),
    Match.when("removeSpecialChars", () => utils.removeSplChars(text)),
    Match.when("retainAlphaNums", () => utils.retainAlphaNums(text)),
    Match.when("removeElisions", () => utils.removeElisions(text)),
    Match.exhaustive
  )(operation);

type NlpToolList = readonly [
  typeof BowCosineSimilarity,
  typeof ChunkBySentences,
  typeof CorpusStats,
  typeof CreateCorpus,
  typeof DeleteCorpus,
  typeof DocumentStats,
  typeof ExtractEntities,
  typeof ExtractKeywords,
  typeof LearnCorpus,
  typeof LearnCustomEntities,
  typeof NGrams,
  typeof PhoneticMatch,
  typeof QueryCorpus,
  typeof RankByRelevance,
  typeof Sentences,
  typeof TextSimilarity,
  typeof Tokenize,
  typeof TransformText,
  typeof TverskySimilarity,
];

type NlpToolkitTools = Toolkit.ToolsByName<NlpToolList>;

/**
 * Canonical ordered NLP tool list used to build the toolkit and export adapters.
 *
 * @since 0.0.0
 * @category Tools
 */
export const NlpTools: NlpToolList = [
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
  Tokenize,
  TransformText,
  TverskySimilarity,
] as const;

/**
 * NLP toolkit definition containing the full tool surface.
 *
 * @since 0.0.0
 * @category Tools
 */
export const NlpToolkit: Toolkit.Toolkit<NlpToolkitTools> = Toolkit.make(...NlpTools);

/**
 * Live toolkit handlers backed by the wink runtime layers.
 *
 * @since 0.0.0
 * @category Layers
 */
export const NlpToolkitLive: ReturnType<typeof NlpToolkit.toLayer> = NlpToolkit.toLayer(
  Effect.gen(function* () {
    const corpusManager = yield* WinkCorpusManager;
    const engine = yield* WinkEngine;
    const similarity = yield* WinkSimilarity;
    const tokenization = yield* Tokenization;
    const utils = yield* WinkUtils;
    const vectorizer = yield* WinkVectorizer;

    return {
      BowCosineSimilarity: ({ text1, text2 }) =>
        Effect.gen(function* () {
          const [doc1, doc2] = yield* Effect.all([
            tokenization.document(text1, "bow-text-1"),
            tokenization.document(text2, "bow-text-2"),
          ]);

          const score = yield* similarity.bowCosine(
            BagOfWords.makeUnsafe({
              bow: tokenBagOfWords(Chunk.toReadonlyArray(doc1.tokens)),
              documentId: doc1.id,
            }),
            BagOfWords.makeUnsafe({
              bow: tokenBagOfWords(Chunk.toReadonlyArray(doc2.tokens)),
              documentId: doc2.id,
            })
          );

          return {
            method: "bow.cosine" as const,
            score: score.score,
          };
        }).pipe(Effect.orDie),

      ChunkBySentences: ({ maxChunkChars, text }) =>
        Effect.gen(function* () {
          const document = yield* tokenization.document(text, "sentence-chunks");
          const sentences = pipe(
            Chunk.toReadonlyArray(document.sentences),
            A.map((sentence) => ({
              index: sentence.index,
              text: Str.trim(sentence.text),
            })),
            A.filter((sentence) => Str.isNonEmpty(sentence.text))
          );

          if (A.isArrayEmpty(sentences)) {
            return { chunkCount: 0, chunks: [], originalSentenceCount: 0 };
          }

          const maxChars = maxChunkChars;
          const chunks: Array<{
            readonly charCount: number;
            readonly endSentenceIndex: number;
            readonly sentenceCount: number;
            readonly startSentenceIndex: number;
            readonly text: string;
          }> = [];

          let currentText = "";
          let startSentenceIndex = -1;
          let endSentenceIndex = -1;

          const flush = () => {
            if (startSentenceIndex < 0 || Str.isEmpty(currentText)) {
              return;
            }
            chunks.push({
              charCount: Str.length(currentText),
              endSentenceIndex,
              sentenceCount: endSentenceIndex - startSentenceIndex + 1,
              startSentenceIndex,
              text: currentText,
            });
          };

          for (const sentence of sentences) {
            if (startSentenceIndex < 0) {
              currentText = sentence.text;
              startSentenceIndex = sentence.index;
              endSentenceIndex = sentence.index;
              continue;
            }

            const candidate = `${currentText} ${sentence.text}`;
            if (Str.length(candidate) <= maxChars) {
              currentText = candidate;
              endSentenceIndex = sentence.index;
              continue;
            }

            flush();
            currentText = sentence.text;
            startSentenceIndex = sentence.index;
            endSentenceIndex = sentence.index;
          }

          flush();

          return {
            chunkCount: A.length(chunks),
            chunks,
            originalSentenceCount: A.length(sentences),
          };
        }).pipe(Effect.orDie),

      CorpusStats: (params) => corpusManager.getStats(params).pipe(Effect.orDie),

      CreateCorpus: (params) =>
        corpusManager
          .createCorpus({
            ...(params.corpusId === undefined ? {} : { corpusId: params.corpusId }),
            ...(params.bm25Config === undefined
              ? {}
              : {
                  bm25Config: {
                    ...(params.bm25Config.b === undefined ? {} : { b: params.bm25Config.b }),
                    ...(params.bm25Config.k === undefined ? {} : { k: params.bm25Config.k }),
                    ...(params.bm25Config.k1 === undefined ? {} : { k1: params.bm25Config.k1 }),
                    ...(params.bm25Config.norm === undefined ? {} : { norm: params.bm25Config.norm }),
                  },
                }),
          })
          .pipe(Effect.orDie),

      DeleteCorpus: ({ corpusId }) =>
        Effect.gen(function* () {
          const deleted = yield* corpusManager.deleteCorpus(corpusId);
          return { corpusId, deleted };
        }).pipe(Effect.orDie),

      DocumentStats: ({ text }) =>
        Effect.gen(function* () {
          const document = yield* tokenization.document(text, "document-stats");
          const tokens = Chunk.toReadonlyArray(document.tokens);
          const wordCount = pipe(tokens, A.filter(isWordLikeToken), A.length);

          return {
            avgSentenceLength: document.sentenceCount === 0 ? 0 : wordCount / document.sentenceCount,
            charCount: Str.length(text),
            sentenceCount: document.sentenceCount,
            wordCount,
          };
        }).pipe(Effect.orDie),

      ExtractEntities: ({ includeCustom, text }) =>
        Effect.gen(function* () {
          const [document, its, winkDoc] = yield* Effect.all([
            tokenization.document(text, "entities"),
            engine.its,
            engine.getWinkDoc(text),
          ]);
          const tokens = Chunk.toReadonlyArray(document.tokens);
          const builtinEntities = mapEntityOutput(
            decodeEntityOutputDetails(winkDoc.entities().out(its.detail)),
            decodeEntityOutputSpans(winkDoc.entities().out(its.span)),
            tokens,
            "builtin"
          );
          const customEntities =
            (includeCustom ?? true)
              ? mapEntityOutput(
                  decodeEntityOutputDetails(winkDoc.customEntities().out(its.detail)),
                  decodeEntityOutputSpans(winkDoc.customEntities().out(its.span)),
                  tokens,
                  "custom"
                )
              : [];
          const allEntities = pipe(
            builtinEntities,
            A.appendAll(customEntities),
            A.sortBy(
              ascendingNumber((entity) => entity.start),
              ascendingNumber((entity) => entity.end),
              ascendingNumber((entity) => entity.startTokenIndex)
            )
          );

          return {
            allEntities,
            allEntityCount: A.length(allEntities),
            customEntities,
            customEntityCount: A.length(customEntities),
            customEntityTypes: sortStrings(
              pipe(
                customEntities,
                A.map((entity) => entity.type)
              )
            ),
            entities: builtinEntities,
            entityCount: A.length(builtinEntities),
            entityTypes: sortStrings(
              pipe(
                builtinEntities,
                A.map((entity) => entity.type)
              )
            ),
          };
        }).pipe(Effect.orDie),

      ExtractKeywords: ({ text, topN }) =>
        vectorizer
          .withFreshInstance((isolated) =>
            Effect.gen(function* () {
              const document = yield* tokenization.document(text, "keywords");
              yield* isolated.learnDocument(document);
              const frequencies = yield* isolated.getDocumentTermFrequencies(0);
              const limit = topN ?? 10;

              return {
                keywords: pipe(
                  frequencies,
                  A.sortBy(
                    descendingNumber((frequency) => frequency.frequency),
                    ascendingString((frequency) => frequency.term)
                  ),
                  A.take(limit),
                  A.map((frequency) => ({
                    score: frequency.frequency,
                    term: frequency.term,
                  }))
                ),
              };
            })
          )
          .pipe(Effect.orDie),

      LearnCorpus: ({ corpusId, dedupeById, documents }) =>
        Effect.gen(function* () {
          const nowMs = yield* Clock.currentTimeMillis;
          const resolvedDocuments = yield* Effect.forEach(documents, (document, index) =>
            tokenization.document(document.text, document.id ?? `${corpusId}-doc-${nowMs}-${index}`)
          );
          return yield* corpusManager.learnDocuments({
            corpusId,
            dedupeById,
            documents: resolvedDocuments,
          });
        }).pipe(Effect.orDie),

      LearnCustomEntities: ({ entities, groupName, mode }) =>
        Effect.gen(function* () {
          yield* S.decodeUnknownEffect(S.NonEmptyArray(BracketStringToPatternElement))(
            pipe(
              entities,
              A.flatMap((entity) => entity.patterns)
            )
          );

          const incoming = new WinkEngineCustomEntities({
            name: EntityGroupName.makeUnsafe(groupName ?? "custom-entities"),
            patterns: pipe(
              entities,
              A.map(
                (entity) =>
                  new CustomEntityExample({
                    mark: entity.mark === undefined ? O.none() : O.some(entity.mark),
                    name: entity.name,
                    patterns: entity.patterns,
                  })
              )
            ),
          });

          const resolvedMode = mode ?? "append";
          const nextEntities =
            resolvedMode === "append"
              ? O.match(yield* engine.getCurrentCustomEntities, {
                  onNone: () => incoming,
                  onSome: (existing) => existing.merge(incoming, incoming.name),
                })
              : incoming;

          yield* engine.learnCustomEntities(nextEntities);

          return {
            entityNames: sortStrings(
              pipe(
                nextEntities.toArray(),
                A.map((entity) => entity.name)
              )
            ),
            groupName: nextEntities.name,
            learnedEntityCount: incoming.size(),
            mode: resolvedMode,
            totalEntityCount: nextEntities.size(),
          };
        }).pipe(Effect.orDie),

      NGrams: ({ mode, size, text, topN }) =>
        Effect.gen(function* () {
          const resolvedMode = mode ?? "bag";
          const resolvedSize = size;
          const result =
            resolvedMode === "bag"
              ? yield* utils.bagOfNGrams(text, resolvedSize)
              : resolvedMode === "edge"
                ? yield* utils.edgeNGrams(text, resolvedSize)
                : yield* utils.setOfNGrams(text, resolvedSize);

          const limit = topN ?? result.uniqueNGrams;
          const ngrams = pipe(
            result.ngrams,
            R.toEntries,
            A.map(([value, count]) => ({ count, value })),
            A.sortBy(
              descendingNumber((entry) => entry.count),
              ascendingString((entry) => entry.value)
            ),
            A.take(limit)
          );

          return {
            mode: resolvedMode,
            ngrams,
            size: resolvedSize,
            totalNGrams: result.totalNGrams,
            uniqueNGrams: result.uniqueNGrams,
          };
        }).pipe(Effect.orDie),

      PhoneticMatch: ({ algorithm, minTokenLength, text1, text2 }) =>
        Effect.gen(function* () {
          const resolvedAlgorithm = algorithm ?? "soundex";
          const minimumLength = minTokenLength ?? 2;
          const encode = (tokens: ReadonlyArray<string>) =>
            resolvedAlgorithm === "soundex" ? utils.soundex(tokens) : utils.phonetize(tokens);
          const toCandidateTokens = (tokens: ReadonlyArray<Token>) =>
            pipe(
              tokens,
              A.filter(isWordLikeToken),
              A.map((token) => pipe(normalizedTokenText(token), Str.trim, Str.toLowerCase)),
              A.filter((token) => Str.length(token) >= minimumLength)
            );

          const [leftTokens, rightTokens] = yield* Effect.all([
            tokenization.tokenize(text1),
            tokenization.tokenize(text2),
          ]);
          const [leftCodes, rightCodes] = yield* Effect.all([
            encode(toCandidateTokens(leftTokens)),
            encode(toCandidateTokens(rightTokens)),
          ]);
          const sortedLeft = sortStrings(pipe(leftCodes, A.map(Str.trim), A.filter(Str.isNonEmpty)));
          const sortedRight = sortStrings(pipe(rightCodes, A.map(Str.trim), A.filter(Str.isNonEmpty)));

          return {
            algorithm: resolvedAlgorithm,
            leftCodes: sortedLeft,
            rightCodes: sortedRight,
            score: setJaccard(sortedLeft, sortedRight),
            sharedCodes: pipe(sortedLeft, A.intersection(sortedRight)),
          };
        }).pipe(Effect.orDie),

      QueryCorpus: (params) => corpusManager.query(params).pipe(Effect.orDie),

      RankByRelevance: ({ query, texts, topN }) =>
        vectorizer
          .withFreshInstance((isolated) =>
            Effect.gen(function* () {
              if (A.isReadonlyArrayEmpty(texts)) {
                return {
                  ranked: [],
                  returned: 0,
                  totalTexts: 0,
                };
              }

              const documents = yield* Effect.forEach(texts, (text, index) =>
                tokenization.document(text, `rank-${index}`)
              );
              yield* Effect.forEach(documents, (document) => isolated.learnDocument(document), { discard: true });

              const queryDocument = yield* tokenization.document(query, "rank-query");
              const queryVector = yield* isolated.vectorizeDocument(queryDocument);
              const scores = yield* Effect.forEach(documents, (document, index) =>
                Effect.gen(function* () {
                  const candidateVector = yield* isolated.vectorizeDocument(document);
                  const score = yield* similarity.vectorCosine(queryVector, candidateVector);
                  return { index, score: score.score };
                })
              );

              const limit = topN ?? A.length(texts);
              const ranked = pipe(
                scores,
                A.sortBy(
                  descendingNumber((score) => score.score),
                  ascendingNumber((score) => score.index)
                ),
                A.take(limit)
              );

              return {
                ranked,
                returned: A.length(ranked),
                totalTexts: A.length(texts),
              };
            })
          )
          .pipe(Effect.orDie),

      Sentences: ({ text }) =>
        Effect.gen(function* () {
          const document = yield* tokenization.document(text, "sentences");
          const sentences = pipe(
            Chunk.toReadonlyArray(document.sentences),
            A.map((sentence) => {
              const tokens = Chunk.toReadonlyArray(sentence.tokens);
              const first = tokens[0];
              const last = tokens[tokens.length - 1];

              return {
                end: last?.end ?? 0,
                index: sentence.index,
                start: first?.start ?? 0,
                text: sentence.text,
                tokenCount: A.length(tokens),
              };
            })
          );

          return {
            sentenceCount: A.length(sentences),
            sentences,
          };
        }).pipe(Effect.orDie),

      TextSimilarity: ({ text1, text2 }) =>
        vectorizer
          .withFreshInstance((isolated) =>
            Effect.gen(function* () {
              const [doc1, doc2] = yield* Effect.all([
                tokenization.document(text1, "text-similarity-1"),
                tokenization.document(text2, "text-similarity-2"),
              ]);

              yield* Effect.forEach([doc1, doc2], (document) => isolated.learnDocument(document), { discard: true });
              const [leftVector, rightVector] = yield* Effect.all([
                isolated.vectorizeDocument(doc1),
                isolated.vectorizeDocument(doc2),
              ]);
              const score = yield* similarity.vectorCosine(leftVector, rightVector);

              return {
                method: "vector.cosine" as const,
                score: score.score,
              };
            })
          )
          .pipe(Effect.orDie),

      Tokenize: ({ text }) =>
        Effect.gen(function* () {
          const tokens = yield* tokenization.tokenize(text);
          return {
            tokenCount: A.length(tokens),
            tokens: pipe(tokens, A.map(tokenToAi)),
          };
        }).pipe(Effect.orDie),

      TransformText: ({ operations, text }) =>
        Effect.gen(function* () {
          let current = text;
          const operationsApplied: Array<string> = [];

          for (const operation of operations) {
            current = yield* applyTransformOperation(utils, operation, current);
            operationsApplied.push(operation);
          }

          return {
            operationsApplied,
            result: current,
          };
        }).pipe(Effect.orDie),

      TverskySimilarity: ({ alpha, beta, text1, text2 }) =>
        Effect.gen(function* () {
          const [leftTokens, rightTokens] = yield* Effect.all([
            tokenization.tokenize(text1),
            tokenization.tokenize(text2),
          ]);
          const params = TverskyParams.makeUnsafe({
            alpha,
            beta,
          });
          const score = yield* similarity.setTversky(
            DocumentTermSet.makeUnsafe({
              documentId: DocumentId.makeUnsafe("tversky-left"),
              terms: uniqueNormalizedTerms(leftTokens),
            }),
            DocumentTermSet.makeUnsafe({
              documentId: DocumentId.makeUnsafe("tversky-right"),
              terms: uniqueNormalizedTerms(rightTokens),
            }),
            params
          );

          return {
            alpha: params.alpha,
            beta: params.beta,
            method: "set.tversky" as const,
            score: score.score,
          };
        }).pipe(Effect.orDie),
    };
  })
).pipe(Layer.provide(WinkLayerAllLive));
