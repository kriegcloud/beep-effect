/**
 * Live NLP toolkit composed from wink-backed services and tool definitions.
 *
 * @since 0.0.0
 * @module @beep/nlp/Tools/NlpToolkit
 */

import { $NlpId } from "@beep/identity";
import { thunkEmptyStr, thunkFalse } from "@beep/utils";
import { Chunk, Clock, Effect, flow, Inspectable, identity, Layer, Match, Order, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { type Tool, Toolkit } from "effect/unstable/ai";
import { DocumentId } from "../Core/Document.ts";
import { BracketStringToPatternElement, Tokenization } from "../Core/index.ts";
import type { Token } from "../Core/Token.ts";
import { ascendingNumber, ascendingString, descendingNumber } from "../internal/order.ts";
import type { WinkEngineError } from "../Wink/index.ts";
import {
  BagOfWords,
  type CorpusManagerError,
  CustomEntityExample,
  DocumentTermSet,
  EntityGroupName,
  type SimilarityError,
  TverskyParams,
  type VectorizerError,
  WinkCorpusManager,
  WinkEngine,
  WinkEngineCustomEntities,
  WinkSimilarity,
  WinkUtils,
  type WinkUtilsError,
  WinkVectorizer,
} from "../Wink/index.ts";
import { WinkLayerAllLive } from "../Wink/Layer.ts";
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

const $I = $NlpId.create("Tools/NlpToolkit");

const emptyTermBag = R.empty<string, number>();

const unwrapOptionString = (value: O.Option<string>): string =>
  O.match(value, {
    onNone: thunkEmptyStr,
    onSome: identity,
  });

const isPunctuationToken = (token: Token): boolean =>
  O.match(token.shape, {
    onNone: thunkFalse,
    onSome: (shape) => !/[Xxd]/.test(shape),
  });

const isWordLikeToken = (token: Token): boolean => !isPunctuationToken(token) && /[\p{L}\p{N}]/u.test(token.text);

const normalizedTokenText = (token: Token): string => token.normal.pipe(O.getOrElse(() => token.text));

const normalizeTerm = flow(normalizedTokenText, Str.trim);

const optionalEntry = <Key extends string, Value>(
  key: Key,
  value: Value | undefined
): O.Option<readonly [Key, Value]> =>
  pipe(
    value,
    O.fromNullishOr,
    O.map((definedValue): readonly [Key, Value] => [key, definedValue] as const)
  );

const optionalRecord = (entries: ReadonlyArray<O.Option<readonly [string, unknown]>>): Record<string, unknown> =>
  A.reduce(entries, R.empty<string, unknown>(), (record, entry) =>
    O.match(entry, {
      onNone: () => record,
      onSome: ([key, value]) => ({
        ...record,
        [key]: value,
      }),
    })
  );

const buildCreateCorpusParameters = (params: {
  readonly bm25Config?: {
    readonly b?: number;
    readonly k?: number;
    readonly k1?: number;
    readonly norm?: "none" | "l1" | "l2";
  };
  readonly corpusId?: string;
}) =>
  optionalRecord([
    optionalEntry("corpusId", params.corpusId),
    pipe(
      params.bm25Config,
      O.fromNullishOr,
      O.map((bm25Config): readonly ["bm25Config", Record<string, unknown>] => [
        "bm25Config",
        optionalRecord([
          optionalEntry("b", bm25Config.b),
          optionalEntry("k", bm25Config.k),
          optionalEntry("k1", bm25Config.k1),
          optionalEntry("norm", bm25Config.norm),
        ]),
      ])
    ),
  ]);

const tokenBagOfWords = (tokens: ReadonlyArray<Token>): Record<string, number> =>
  A.reduce(tokens, emptyTermBag, (bag, token) =>
    Str.isEmpty(normalizeTerm(token))
      ? bag
      : {
          ...bag,
          [normalizeTerm(token)]: (bag[normalizeTerm(token)] ?? 0) + 1,
        }
  );

const tokenToAi = (token: Token) => ({
  end: token.end,
  isPunctuation: isPunctuationToken(token),
  isStopWord: O.getOrElse(token.stopWordFlag, thunkFalse),
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

  return A.match(combined, {
    onEmpty: () => 0,
    onNonEmpty: () => pipe(left, A.intersection(right), A.length) / A.length(combined),
  });
};

class EntityOutputDetail extends S.Class<EntityOutputDetail>($I`EntityOutputDetail`)({
  type: S.optionalKey(S.Unknown),
  value: S.optionalKey(S.Unknown),
}) {}

const decodeEntityOutputDetails = (value: unknown): ReadonlyArray<EntityOutputDetail> =>
  Match.type<boolean>().pipe(
    Match.when(true, () => A.empty()),
    Match.when(false, () =>
      A.map(value as ReadonlyArray<unknown>, (detail) => (P.isObject(detail) ? detail : R.empty()))
    ),
    Match.exhaustive
  )(P.isUndefined(value));

const decodeEntityOutputSpans = (value: unknown): ReadonlyArray<ReadonlyArray<number>> =>
  Match.type<boolean>().pipe(
    Match.when(true, () => A.empty()),
    Match.when(false, () =>
      A.map(value as ReadonlyArray<unknown>, (span) =>
        A.isArray(span) && A.every(span, P.isNumber) ? span : A.empty()
      )
    ),
    Match.exhaustive
  )(P.isUndefined(value));

const resolveTokenIndex = (
  rawSpan: ReadonlyArray<number> | undefined,
  lowerBound: number,
  tokens: ReadonlyArray<Token>
): number =>
  pipe(
    rawSpan,
    O.fromNullishOr,
    O.match({
      onNone: () => lowerBound,
      onSome: (span) =>
        A.length(span) >= 2 && P.isNumber(span[0])
          ? Math.max(0, Math.min(A.length(tokens) - 1, Math.floor(span[0])))
          : lowerBound,
    })
  );

const resolveTokenEndIndex = (
  rawSpan: ReadonlyArray<number> | undefined,
  startTokenIndex: number,
  tokens: ReadonlyArray<Token>
): number =>
  pipe(
    rawSpan,
    O.fromNullishOr,
    O.match({
      onNone: () => startTokenIndex,
      onSome: (span) =>
        A.length(span) >= 2 && P.isNumber(span[1])
          ? Math.max(startTokenIndex, Math.min(A.length(tokens) - 1, Math.floor(span[1])))
          : startTokenIndex,
    })
  );

const renderEntityValue = (value: unknown): string =>
  Match.type<boolean>().pipe(
    Match.when(true, thunkEmptyStr),
    Match.when(false, () => (P.isString(value) ? value : Inspectable.toStringUnknown(value))),
    Match.exhaustive
  )(P.isUndefined(value));

const mapEntityOutput = (
  details: ReadonlyArray<EntityOutputDetail>,
  spans: ReadonlyArray<ReadonlyArray<number>>,
  tokens: ReadonlyArray<Token>,
  source: "builtin" | "custom"
) =>
  A.map(details, (detail, index) => ({
    end:
      tokens[resolveTokenEndIndex(spans[index], resolveTokenIndex(spans[index], 0, tokens), tokens)]?.end ??
      tokens[resolveTokenIndex(spans[index], 0, tokens)]?.end ??
      Str.length(renderEntityValue(detail.value)),
    endTokenIndex: resolveTokenEndIndex(spans[index], resolveTokenIndex(spans[index], 0, tokens), tokens),
    source,
    start: tokens[resolveTokenIndex(spans[index], 0, tokens)]?.start ?? 0,
    startTokenIndex: resolveTokenIndex(spans[index], 0, tokens),
    type: renderEntityValue(detail.type),
    value: renderEntityValue(detail.value),
  }));

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
type NlpToolkitLiveError = CorpusManagerError | SimilarityError | VectorizerError | WinkEngineError | WinkUtilsError;

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
export const NlpToolkitLive: Layer.Layer<
  Tool.HandlersFor<typeof NlpToolkit.tools>,
  NlpToolkitLiveError
> = NlpToolkit.toLayer(
  Effect.gen(function* () {
    const corpusManager = yield* WinkCorpusManager;
    const engine = yield* WinkEngine;
    const similarity = yield* WinkSimilarity;
    const tokenization = yield* Tokenization;
    const utils = yield* WinkUtils;
    const vectorizer = yield* WinkVectorizer;

    return {
      BowCosineSimilarity: Effect.fn(function* ({ text1, text2 }) {
        const [doc1, doc2] = yield* Effect.all([
          tokenization.document(text1, "bow-text-1"),
          tokenization.document(text2, "bow-text-2"),
        ]);

        const score = yield* similarity.bowCosine(
          BagOfWords.make({
            bow: tokenBagOfWords(Chunk.toReadonlyArray(doc1.tokens)),
            documentId: doc1.id,
          }),
          BagOfWords.make({
            bow: tokenBagOfWords(Chunk.toReadonlyArray(doc2.tokens)),
            documentId: doc2.id,
          })
        );

        return {
          method: "bow.cosine" as const,
          score: score.score,
        };
      }, Effect.orDie),

      ChunkBySentences: Effect.fn(function* ({ maxChunkChars, text }) {
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
          return {
            chunkCount: 0,
            chunks: A.empty(),
            originalSentenceCount: 0,
          };
        }

        const maxChars = maxChunkChars;
        const chunks = A.empty<{
          readonly charCount: number;
          readonly endSentenceIndex: number;
          readonly sentenceCount: number;
          readonly startSentenceIndex: number;
          readonly text: string;
        }>();

        let currentText = "";
        let startSentenceIndex = -1;
        let endSentenceIndex = -1;

        const flush = () => {
          if (startSentenceIndex >= 0 && !Str.isEmpty(currentText)) {
            chunks.push({
              charCount: Str.length(currentText),
              endSentenceIndex,
              sentenceCount: endSentenceIndex - startSentenceIndex + 1,
              startSentenceIndex,
              text: currentText,
            });
          }
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
      }, Effect.orDie),

      CorpusStats: (params) => corpusManager.getStats(params).pipe(Effect.orDie),

      CreateCorpus: Effect.fn(function* (params) {
        return yield* corpusManager.createCorpus(buildCreateCorpusParameters(params)).pipe(Effect.orDie);
      }),

      DeleteCorpus: Effect.fn(function* ({ corpusId }) {
        const deleted = yield* corpusManager.deleteCorpus(corpusId);
        return {
          corpusId,
          deleted,
        };
      }, Effect.orDie),

      DocumentStats: Effect.fn(function* ({ text }) {
        const document = yield* tokenization.document(text, "document-stats");
        const tokens = Chunk.toReadonlyArray(document.tokens);
        const wordCount = pipe(tokens, A.filter(isWordLikeToken), A.length);

        return {
          avgSentenceLength: A.match(Chunk.toReadonlyArray(document.sentences), {
            onEmpty: () => 0,
            onNonEmpty: () => wordCount / document.sentenceCount,
          }),
          charCount: Str.length(text),
          sentenceCount: document.sentenceCount,
          wordCount,
        };
      }, Effect.orDie),

      ExtractEntities: Effect.fn(function* ({ includeCustom, text }) {
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
        const customEntities = Match.type<boolean>().pipe(
          Match.when(true, () =>
            mapEntityOutput(
              decodeEntityOutputDetails(winkDoc.customEntities().out(its.detail)),
              decodeEntityOutputSpans(winkDoc.customEntities().out(its.span)),
              tokens,
              "custom"
            )
          ),
          Match.when(false, () => A.empty()),
          Match.exhaustive
        )(includeCustom ?? true);
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
      }, Effect.orDie),

      ExtractKeywords: Effect.fn(function* ({ text, topN }) {
        return yield* vectorizer
          .withFreshInstance(
            Effect.fn(function* (isolated) {
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
          .pipe(Effect.orDie);
      }),

      LearnCorpus: Effect.fn(function* ({ corpusId, dedupeById, documents }) {
        const nowMs = yield* Clock.currentTimeMillis;
        const resolvedDocuments = yield* Effect.forEach(documents, (document, index) =>
          tokenization.document(document.text, document.id ?? `${corpusId}-doc-${nowMs}-${index}`)
        );
        return yield* corpusManager.learnDocuments({
          corpusId,
          dedupeById,
          documents: resolvedDocuments,
        });
      }, Effect.orDie),

      LearnCustomEntities: Effect.fn(function* ({ entities, groupName, mode }) {
        yield* S.decodeUnknownEffect(S.NonEmptyArray(BracketStringToPatternElement))(
          pipe(
            entities,
            A.flatMap((entity) => entity.patterns)
          )
        );

        const incoming = new WinkEngineCustomEntities({
          name: EntityGroupName.make(groupName ?? "custom-entities"),
          patterns: pipe(
            entities,
            A.map(
              (entity) =>
                new CustomEntityExample({
                  mark: P.isUndefined(entity.mark) ? O.none() : O.some(entity.mark),
                  name: entity.name,
                  patterns: entity.patterns,
                })
            )
          ),
        });

        const resolvedMode = mode ?? "append";
        const currentCustomEntities = yield* engine.getCurrentCustomEntities;
        const nextEntities = Match.type<"append" | "replace">().pipe(
          Match.when("append", () =>
            O.match(currentCustomEntities, {
              onNone: () => incoming,
              onSome: (existing) => existing.merge(incoming, incoming.name),
            })
          ),
          Match.when("replace", () => incoming),
          Match.exhaustive
        )(resolvedMode);

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
      }, Effect.orDie),

      NGrams: Effect.fn(function* ({ mode, size, text, topN }) {
        const resolvedMode = mode ?? "bag";
        const resolvedSize = size;
        const result = yield* Match.type<"bag" | "edge" | "set">().pipe(
          Match.when("bag", () => utils.bagOfNGrams(text, resolvedSize)),
          Match.when("edge", () => utils.edgeNGrams(text, resolvedSize)),
          Match.when("set", () => utils.setOfNGrams(text, resolvedSize)),
          Match.exhaustive
        )(resolvedMode);

        const limit = topN ?? result.uniqueNGrams;
        const ngrams = pipe(
          result.ngrams,
          R.toEntries,
          A.map(([value, count]) => ({
            count,
            value,
          })),
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
      }, Effect.orDie),

      PhoneticMatch: Effect.fn(function* ({ algorithm, minTokenLength, text1, text2 }) {
        const resolvedAlgorithm = algorithm ?? "soundex";
        const minimumLength = minTokenLength ?? 2;
        const encode = (tokens: ReadonlyArray<string>) =>
          Match.type<"soundex" | "phonetize">().pipe(
            Match.when("soundex", () => utils.soundex(tokens)),
            Match.when("phonetize", () => utils.phonetize(tokens)),
            Match.exhaustive
          )(resolvedAlgorithm);
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
      }, Effect.orDie),
      QueryCorpus: flow(corpusManager.query, Effect.orDie),

      RankByRelevance: Effect.fn(function* ({ query, texts, topN }) {
        return yield* vectorizer.withFreshInstance(
          Effect.fn(function* (isolated) {
            return yield* A.match(texts, {
              onEmpty: () =>
                Effect.succeed({
                  ranked: A.empty(),
                  returned: 0,
                  totalTexts: 0,
                }),
              onNonEmpty: () =>
                Effect.gen(function* () {
                  const documents = yield* Effect.forEach(texts, (text, index) =>
                    tokenization.document(text, `rank-${index}`)
                  );
                  yield* Effect.forEach(documents, isolated.learnDocument, { discard: true });

                  const queryDocument = yield* tokenization.document(query, "rank-query");
                  const queryVector = yield* isolated.vectorizeDocument(queryDocument);
                  const scores = yield* Effect.forEach(
                    documents,

                    Effect.fn(function* (document, index) {
                      const candidateVector = yield* isolated.vectorizeDocument(document);
                      const score = yield* similarity.vectorCosine(queryVector, candidateVector);
                      return {
                        index,
                        score: score.score,
                      };
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
                }),
            });
          })
        );
      }, Effect.orDie),

      Sentences: Effect.fn(function* ({ text }) {
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
      }, Effect.orDie),
      TextSimilarity: ({ text1, text2 }) =>
        vectorizer
          .withFreshInstance(
            Effect.fn(function* (isolated) {
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

      Tokenize: Effect.fn(function* ({ text }) {
        const tokens = yield* tokenization.tokenize(text);
        return {
          tokenCount: A.length(tokens),
          tokens: pipe(tokens, A.map(tokenToAi)),
        };
      }, Effect.orDie),

      TransformText: Effect.fn("NlpToolkit.TransformText")(function* ({ operations, text }) {
        let current = text;
        const operationsApplied = A.empty<string>();

        for (const operation of operations) {
          current = yield* applyTransformOperation(utils, operation, current);
          operationsApplied.push(operation);
        }

        return {
          operationsApplied,
          result: current,
        };
      }, Effect.orDie),

      TverskySimilarity: Effect.fn(function* ({ alpha, beta, text1, text2 }) {
        const [leftTokens, rightTokens] = yield* Effect.all([
          tokenization.tokenize(text1),
          tokenization.tokenize(text2),
        ]);
        const params = TverskyParams.make({
          alpha,
          beta,
        });
        const score = yield* similarity.setTversky(
          DocumentTermSet.make({
            documentId: DocumentId.make("tversky-left"),
            terms: uniqueNormalizedTerms(leftTokens),
          }),
          DocumentTermSet.make({
            documentId: DocumentId.make("tversky-right"),
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
      }, Effect.orDie),
    };
  })
).pipe(Layer.provide(WinkLayerAllLive));
