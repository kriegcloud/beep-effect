/**
 * Stateful corpus management built on wink BM25 vectorization.
 *
 * @since 0.0.0
 * @module @beep/nlp/Wink/WinkCorpusManager
 */

import { createRequire } from "node:module";
import { $NlpId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import { Chunk, Clock, Effect, HashMap, HashSet, Layer, pipe, Ref, ServiceMap } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { type Document, DocumentId } from "../Core/Document.ts";
import type { Token } from "../Core/Token.ts";
import { ascendingNumber, ascendingString, descendingNumber } from "../internal/order.ts";
import { WinkEngine } from "./WinkEngine.ts";
import { WinkSimilarity } from "./WinkSimilarity.ts";
import { BM25Config, DefaultBM25Config, DocumentVector } from "./WinkVectorizer.ts";

const $I = $NlpId.create("Wink/WinkCorpusManager");
const require = createRequire(import.meta.url);

type BM25VectorizerInstance = {
  readonly doc: (index: number) => { readonly out: (accessor: unknown) => unknown };
  readonly learn: (tokens: Array<string>) => void;
  readonly out: (accessor: unknown) => unknown;
  readonly vectorOf: (tokens: Array<string>) => Array<number>;
};

type BM25VectorizerFactory = (config?: {
  readonly b?: number;
  readonly k?: number;
  readonly k1?: number;
  readonly norm?: "none" | "l1" | "l2";
}) => BM25VectorizerInstance;

type CreateCorpusParams = {
  readonly bm25Config?:
    | Partial<{
        readonly b: number;
        readonly k: number;
        readonly k1: number;
        readonly norm: "none" | "l1" | "l2";
      }>
    | undefined;
  readonly corpusId?: string | undefined;
};

type LearnCorpusParams = {
  readonly corpusId: string;
  readonly dedupeById?: boolean | undefined;
  readonly documents: ReadonlyArray<Document>;
};

type QueryCorpusParams = {
  readonly corpusId: string;
  readonly includeText?: boolean | undefined;
  readonly query: string;
  readonly topN?: number | undefined;
};

type CorpusStatsParams = {
  readonly corpusId: string;
  readonly includeIdf?: boolean | undefined;
  readonly includeMatrix?: boolean | undefined;
  readonly topIdfTerms?: number | undefined;
};

type CorpusSummary = {
  readonly config: BM25Config;
  readonly corpusId: string;
  readonly createdAtMs: number;
  readonly documentCount: number;
  readonly vocabularySize: number;
};

type LearnCorpusResult = {
  readonly corpusId: string;
  readonly learnedCount: number;
  readonly reindexRequired: boolean;
  readonly skippedCount: number;
  readonly totalDocuments: number;
  readonly vocabularySize: number;
};

type RankedCorpusDocument = {
  readonly id: string;
  readonly index: number;
  readonly score: number;
  readonly text?: string;
};

type QueryCorpusResult = {
  readonly corpusId: string;
  readonly method: "vector.cosine";
  readonly query: string;
  readonly ranked: ReadonlyArray<RankedCorpusDocument>;
  readonly returned: number;
  readonly totalDocuments: number;
};

type CorpusStatsResult = {
  readonly averageDocumentLength: number;
  readonly corpusId: string;
  readonly documentTermMatrix: ReadonlyArray<ReadonlyArray<number>>;
  readonly idfValues: ReadonlyArray<{
    readonly idf: number;
    readonly term: string;
  }>;
  readonly matrixShape: {
    readonly cols: number;
    readonly rows: number;
  };
  readonly terms: ReadonlyArray<string>;
  readonly totalDocuments: number;
  readonly vocabularySize: number;
};

type CompiledCorpus = {
  readonly documentVectors: ReadonlyArray<ReadonlyArray<number>>;
  readonly terms: ReadonlyArray<string>;
  readonly vectorizer: BM25VectorizerInstance;
};

type CorpusSessionState = {
  readonly compiled: O.Option<CompiledCorpus>;
  readonly config: BM25Config;
  readonly corpusId: string;
  readonly createdAtMs: number;
  readonly documents: ReadonlyArray<Document>;
  readonly totalTokenCount: number;
  readonly updatedAtMs: number;
  readonly vocabulary: HashSet.HashSet<string>;
};

type WinkCorpusManagerShape = {
  readonly createCorpus: (request?: CreateCorpusParams | undefined) => Effect.Effect<CorpusSummary, CorpusManagerError>;
  readonly deleteCorpus: (corpusId: string) => Effect.Effect<boolean>;
  readonly getStats: (request: CorpusStatsParams) => Effect.Effect<CorpusStatsResult, CorpusManagerError>;
  readonly learnDocuments: (request: LearnCorpusParams) => Effect.Effect<LearnCorpusResult, CorpusManagerError>;
  readonly query: (request: QueryCorpusParams) => Effect.Effect<QueryCorpusResult, CorpusManagerError>;
};

const loadBM25Vectorizer = (): BM25VectorizerFactory => require("wink-nlp/utilities/bm25-vectorizer");

const sanitizeLimit = (value: number | undefined, fallback: number): number =>
  value === undefined || !Number.isFinite(value) ? fallback : Math.max(1, Math.min(fallback, Math.floor(value)));

const normalizeTokenText = (token: Token): string =>
  O.match(token.normal, {
    onNone: () => token.text,
    onSome: (normal) => normal ?? token.text,
  });

const resolveAccessor = (its: unknown, name: string, corpusId: string): Effect.Effect<unknown, CorpusManagerError> =>
  P.hasProperty(its, name)
    ? Effect.succeed(its[name])
    : Effect.fail(CorpusManagerError.fromMessage(`wink accessor its.${name} is unavailable`, corpusId));

const makeCorpusSessionState = (corpusId: string, config: BM25Config, nowMs: number): CorpusSessionState => ({
  compiled: O.none(),
  config,
  corpusId,
  createdAtMs: nowMs,
  documents: [],
  totalTokenCount: 0,
  updatedAtMs: nowMs,
  vocabulary: HashSet.empty<string>(),
});

const decodeStringArray = (
  value: unknown,
  context: string,
  corpusId: string
): Effect.Effect<ReadonlyArray<string>, CorpusManagerError> =>
  A.isArray(value) && A.every(value, P.isString)
    ? Effect.succeed(value)
    : Effect.fail(CorpusManagerError.fromMessage(`Invalid ${context}: expected string[]`, corpusId));

const decodeNumberArray = (
  value: unknown,
  context: string,
  corpusId: string
): Effect.Effect<ReadonlyArray<number>, CorpusManagerError> =>
  A.isArray(value) && A.every(value, (entry): entry is number => P.isNumber(entry) && Number.isFinite(entry))
    ? Effect.succeed(value)
    : Effect.fail(CorpusManagerError.fromMessage(`Invalid ${context}: expected number[]`, corpusId));

const isTermScorePair = (value: unknown): value is readonly [string, number] =>
  A.isArray(value) && value.length >= 2 && P.isString(value[0]) && P.isNumber(value[1]) && Number.isFinite(value[1]);

const decodeTermScorePairs = (
  value: unknown,
  context: string,
  corpusId: string
): Effect.Effect<ReadonlyArray<readonly [string, number]>, CorpusManagerError> =>
  A.isArray(value) && A.every(value, isTermScorePair)
    ? Effect.succeed(value)
    : Effect.fail(CorpusManagerError.fromMessage(`Invalid ${context}: expected [string, number][]`, corpusId));

/**
 * Error raised while managing a live corpus session.
 *
 * @since 0.0.0
 * @category Errors
 */
export class CorpusManagerError extends TaggedErrorClass<CorpusManagerError>($I`CorpusManagerError`)(
  "CorpusManagerError",
  {
    cause: S.Unknown,
    corpusId: S.OptionFromOptionalKey(S.String),
    message: S.String,
  },
  $I.annote("CorpusManagerError", {
    description: "Failure raised while managing a stateful wink BM25 corpus.",
  })
) {
  /**
   * Convert an unknown cause into a typed corpus-manager error.
   *
   * @param cause {unknown} - The underlying failure or defect.
   * @param message {string} - The human-readable corpus-manager error message.
   * @param corpusId {string | undefined} - The affected corpus identifier, when known.
   * @returns {CorpusManagerError} - A typed corpus-manager error value.
   */
  static fromCause(cause: unknown, message: string, corpusId?: string): CorpusManagerError {
    return new CorpusManagerError({
      cause,
      corpusId: corpusId === undefined ? O.none() : O.some(corpusId),
      message,
    });
  }

  /**
   * Create a corpus-manager error without an external cause.
   *
   * @param message {string} - The human-readable corpus-manager error message.
   * @param corpusId {string | undefined} - The affected corpus identifier, when known.
   * @returns {CorpusManagerError} - A typed corpus-manager error value without an external cause.
   */
  static fromMessage(message: string, corpusId?: string): CorpusManagerError {
    return new CorpusManagerError({
      cause: undefined,
      corpusId: corpusId === undefined ? O.none() : O.some(corpusId),
      message,
    });
  }
}

const makeWinkCorpusManager = Effect.gen(function* () {
  const engine = yield* WinkEngine;
  const similarity = yield* WinkSimilarity;
  const bm25 = yield* Effect.try({
    try: loadBM25Vectorizer,
    catch: (cause) => CorpusManagerError.fromCause(cause, "Failed to initialize BM25 vectorizer"),
  });
  const sessionsRef = yield* Ref.make(HashMap.empty<string, CorpusSessionState>());
  const idCounterRef = yield* Ref.make(0);

  const makeGeneratedId = Ref.updateAndGet(idCounterRef, (current) => current + 1).pipe(
    Effect.flatMap((counter) => Clock.currentTimeMillis.pipe(Effect.map((nowMs) => `corpus-${nowMs}-${counter}`)))
  );

  const getState = (corpusId: string): Effect.Effect<CorpusSessionState, CorpusManagerError> =>
    Ref.get(sessionsRef).pipe(
      Effect.flatMap((sessions) =>
        pipe(
          HashMap.get(sessions, corpusId),
          O.match({
            onNone: () => Effect.fail(CorpusManagerError.fromMessage(`Corpus "${corpusId}" does not exist`, corpusId)),
            onSome: Effect.succeed,
          })
        )
      )
    );

  const setState = (state: CorpusSessionState): Effect.Effect<void> =>
    Ref.update(sessionsRef, (sessions) => HashMap.set(sessions, state.corpusId, state));

  const readNormalizedTokens = (
    document: Document,
    corpusId: string
  ): Effect.Effect<ReadonlyArray<string>, CorpusManagerError> =>
    document.tokenCount > 0
      ? Effect.succeed(pipe(Chunk.toReadonlyArray(document.tokens), A.map(normalizeTokenText)))
      : Effect.gen(function* () {
          const its = yield* engine.its.pipe(
            Effect.mapError((cause) => CorpusManagerError.fromCause(cause, "Failed to access wink helpers", corpusId))
          );
          const winkDoc = yield* engine
            .getWinkDoc(document.text)
            .pipe(
              Effect.mapError((cause) =>
                CorpusManagerError.fromCause(cause, "Failed to tokenize document text", corpusId)
              )
            );
          return yield* decodeStringArray(winkDoc.tokens().out(its.normal), "normalized token output", corpusId);
        });

  const compileState = (state: CorpusSessionState): Effect.Effect<CompiledCorpus, CorpusManagerError> =>
    Effect.gen(function* () {
      const its = yield* engine.its.pipe(
        Effect.mapError((cause) => CorpusManagerError.fromCause(cause, "Failed to access wink helpers", state.corpusId))
      );
      const termsAccessor = yield* resolveAccessor(its, "terms", state.corpusId);
      const vectorAccessor = yield* resolveAccessor(its, "vector", state.corpusId);
      const vectorizer = bm25(state.config);

      for (const document of state.documents) {
        const tokens = yield* readNormalizedTokens(document, state.corpusId);
        yield* Effect.try({
          try: () => {
            vectorizer.learn(A.fromIterable(tokens));
          },
          catch: (cause) =>
            CorpusManagerError.fromCause(cause, "Failed to learn a document into the compiled corpus", state.corpusId),
        });
      }

      const terms = yield* Effect.try({
        try: () => vectorizer.out(termsAccessor),
        catch: (cause) => CorpusManagerError.fromCause(cause, "Failed to compute corpus terms", state.corpusId),
      }).pipe(Effect.flatMap((raw) => decodeStringArray(raw, "corpus term output", state.corpusId)));

      const documentVectors = yield* Effect.forEach(state.documents, (_document, index) =>
        Effect.try({
          try: () => vectorizer.doc(index).out(vectorAccessor),
          catch: (cause) => CorpusManagerError.fromCause(cause, "Failed to compute document vector", state.corpusId),
        }).pipe(Effect.flatMap((raw) => decodeNumberArray(raw, "document vector output", state.corpusId)))
      );

      return {
        documentVectors,
        terms,
        vectorizer,
      };
    });

  const ensureCompiled = (
    state: CorpusSessionState
  ): Effect.Effect<
    {
      readonly compiled: CompiledCorpus;
      readonly state: CorpusSessionState;
    },
    CorpusManagerError
  > =>
    O.match(state.compiled, {
      onNone: () =>
        compileState(state).pipe(
          Effect.flatMap((compiled) =>
            Effect.as(
              setState({
                ...state,
                compiled: O.some(compiled),
              }),
              {
                compiled,
                state: {
                  ...state,
                  compiled: O.some(compiled),
                },
              }
            )
          )
        ),
      onSome: (compiled) => Effect.succeed({ compiled, state }),
    });

  return WinkCorpusManager.of({
    createCorpus: Effect.fn("Nlp.Wink.WinkCorpusManager.createCorpus")(function* (request?: CreateCorpusParams) {
      const requestedId = request?.corpusId;
      const corpusId = requestedId ?? (yield* makeGeneratedId);
      const nowMs = yield* Clock.currentTimeMillis;
      const config = BM25Config.makeUnsafe({
        b: request?.bm25Config?.b ?? DefaultBM25Config.b,
        k: request?.bm25Config?.k ?? DefaultBM25Config.k,
        k1: request?.bm25Config?.k1 ?? DefaultBM25Config.k1,
        norm: request?.bm25Config?.norm ?? DefaultBM25Config.norm,
      });
      const inserted = yield* Ref.modify(sessionsRef, (current) =>
        HashMap.has(current, corpusId)
          ? ([false, current] as const)
          : ([true, HashMap.set(current, corpusId, makeCorpusSessionState(corpusId, config, nowMs))] as const)
      );

      if (!inserted) {
        return yield* CorpusManagerError.fromMessage(`Corpus "${corpusId}" already exists`, corpusId);
      }

      return {
        config,
        corpusId,
        createdAtMs: nowMs,
        documentCount: 0,
        vocabularySize: 0,
      };
    }),

    deleteCorpus: Effect.fn("Nlp.Wink.WinkCorpusManager.deleteCorpus")(function* (corpusId: string) {
      return yield* Ref.modify(sessionsRef, (sessions) => {
        const exists = HashMap.has(sessions, corpusId);
        return [exists, HashMap.remove(sessions, corpusId)] as const;
      });
    }),

    getStats: Effect.fn("Nlp.Wink.WinkCorpusManager.getStats")(function* (request: CorpusStatsParams) {
      const state = yield* getState(request.corpusId);
      const { compiled, state: compiledState } = yield* ensureCompiled(state);

      if (compiledState.documents.length === 0) {
        return {
          averageDocumentLength: 0,
          corpusId: request.corpusId,
          documentTermMatrix: [],
          idfValues: [],
          matrixShape: { cols: 0, rows: 0 },
          terms: [],
          totalDocuments: 0,
          vocabularySize: 0,
        };
      }

      const its = yield* engine.its.pipe(
        Effect.mapError((cause) =>
          CorpusManagerError.fromCause(cause, "Failed to access wink helpers", request.corpusId)
        )
      );

      const idfValues =
        (request.includeIdf ?? false)
          ? yield* Effect.gen(function* () {
              const accessor = yield* resolveAccessor(its, "idf", request.corpusId);
              const raw = yield* Effect.try({
                try: () => compiled.vectorizer.out(accessor),
                catch: (cause) =>
                  CorpusManagerError.fromCause(cause, "Failed to compute corpus idf values", request.corpusId),
              });
              const decoded = yield* decodeTermScorePairs(raw, "corpus idf output", request.corpusId);
              return pipe(
                decoded,
                A.sortBy(
                  descendingNumber(([, idf]) => idf),
                  ascendingString(([term]) => term)
                ),
                A.take(sanitizeLimit(request.topIdfTerms, A.length(decoded))),
                A.map(([term, idf]) => ({
                  idf,
                  term,
                }))
              );
            })
          : [];

      const documentTermMatrix =
        (request.includeMatrix ?? false)
          ? yield* Effect.gen(function* () {
              const accessor = yield* resolveAccessor(its, "docTermMatrix", request.corpusId);
              const raw = yield* Effect.try({
                try: () => compiled.vectorizer.out(accessor),
                catch: (cause) =>
                  CorpusManagerError.fromCause(cause, "Failed to compute corpus matrix", request.corpusId),
              });

              if (!A.isArray(raw)) {
                return yield* CorpusManagerError.fromMessage("Invalid document-term matrix output", request.corpusId);
              }

              return yield* Effect.forEach(raw, (row) =>
                decodeNumberArray(row, "document-term matrix row", request.corpusId)
              );
            })
          : [];

      return {
        averageDocumentLength:
          compiledState.documents.length === 0 ? 0 : compiledState.totalTokenCount / compiledState.documents.length,
        corpusId: request.corpusId,
        documentTermMatrix,
        idfValues,
        matrixShape: {
          cols: compiled.terms.length,
          rows: (request.includeMatrix ?? false) ? documentTermMatrix.length : compiledState.documents.length,
        },
        terms: compiled.terms,
        totalDocuments: compiledState.documents.length,
        vocabularySize: HashSet.size(compiledState.vocabulary),
      };
    }),

    learnDocuments: Effect.fn("Nlp.Wink.WinkCorpusManager.learnDocuments")(function* (request: LearnCorpusParams) {
      const state = yield* getState(request.corpusId);
      const dedupeById = request.dedupeById ?? true;
      let existingIds = HashSet.fromIterable(
        pipe(
          state.documents,
          A.map((document) => document.id)
        )
      );
      let vocabulary = state.vocabulary;
      const learnedDocuments: Array<Document> = [];
      let skippedCount = 0;
      let totalTokenCount = state.totalTokenCount;

      for (const document of request.documents) {
        if (dedupeById && HashSet.has(existingIds, document.id)) {
          skippedCount += 1;
          continue;
        }

        const tokens = yield* readNormalizedTokens(document, request.corpusId);
        for (const token of tokens) {
          vocabulary = HashSet.add(vocabulary, token);
        }
        existingIds = HashSet.add(existingIds, document.id);
        learnedDocuments.push(document);
        totalTokenCount += A.length(tokens);
      }

      const updatedState: CorpusSessionState = {
        ...state,
        compiled: O.none(),
        documents: A.appendAll(state.documents, learnedDocuments),
        totalTokenCount,
        updatedAtMs: yield* Clock.currentTimeMillis,
        vocabulary,
      };

      yield* setState(updatedState);

      return {
        corpusId: request.corpusId,
        learnedCount: learnedDocuments.length,
        reindexRequired: true,
        skippedCount,
        totalDocuments: updatedState.documents.length,
        vocabularySize: HashSet.size(updatedState.vocabulary),
      };
    }),

    query: Effect.fn("Nlp.Wink.WinkCorpusManager.query")(function* (request: QueryCorpusParams) {
      const state = yield* getState(request.corpusId);
      const { compiled, state: compiledState } = yield* ensureCompiled(state);

      if (compiledState.documents.length === 0) {
        return {
          corpusId: request.corpusId,
          method: "vector.cosine" as const,
          query: request.query,
          ranked: [],
          returned: 0,
          totalDocuments: 0,
        };
      }

      const its = yield* engine.its.pipe(
        Effect.mapError((cause) =>
          CorpusManagerError.fromCause(cause, "Failed to access wink helpers", request.corpusId)
        )
      );
      const queryDoc = yield* engine
        .getWinkDoc(request.query)
        .pipe(
          Effect.mapError((cause) =>
            CorpusManagerError.fromCause(cause, "Failed to tokenize query text", request.corpusId)
          )
        );
      const queryTokens = yield* decodeStringArray(
        queryDoc.tokens().out(its.normal),
        "query token output",
        request.corpusId
      );
      const nowMs = yield* Clock.currentTimeMillis;
      const queryVector = DocumentVector.makeUnsafe({
        documentId: DocumentId.makeUnsafe(`${request.corpusId}-query-${nowMs}`),
        terms: compiled.terms,
        vector: compiled.vectorizer.vectorOf(A.fromIterable(queryTokens)),
      });

      const scored = yield* Effect.forEach(compiledState.documents, (document, index) =>
        Effect.gen(function* () {
          const candidateVector = DocumentVector.makeUnsafe({
            documentId: document.id,
            terms: compiled.terms,
            vector: compiled.documentVectors[index] ?? [],
          });
          const score = yield* similarity
            .vectorCosine(queryVector, candidateVector)
            .pipe(
              Effect.mapError((cause) =>
                CorpusManagerError.fromCause(cause, "Failed to compute query similarity", request.corpusId)
              )
            );

          return (request.includeText ?? false)
            ? {
                id: document.id,
                index,
                score: score.score,
                text: document.text,
              }
            : {
                id: document.id,
                index,
                score: score.score,
              };
        })
      );

      const ranked = pipe(
        scored,
        A.sortBy(
          descendingNumber((entry) => entry.score),
          ascendingNumber((entry) => entry.index)
        ),
        A.take(sanitizeLimit(request.topN, A.length(scored)))
      );

      return {
        corpusId: request.corpusId,
        method: "vector.cosine" as const,
        query: request.query,
        ranked,
        returned: A.length(ranked),
        totalDocuments: A.length(compiledState.documents),
      };
    }),
  });
}).pipe(Effect.withSpan("Nlp.Wink.WinkCorpusManager.make"));

/**
 * Wink corpus manager service.
 *
 * @since 0.0.0
 * @category Services
 */
export class WinkCorpusManager extends ServiceMap.Service<WinkCorpusManager, WinkCorpusManagerShape>()(
  $I`WinkCorpusManager`
) {}

/**
 * Live wink corpus manager layer.
 *
 * @since 0.0.0
 * @category Layers
 */
export const WinkCorpusManagerLive = Layer.effect(WinkCorpusManager, makeWinkCorpusManager);
