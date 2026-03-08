/**
 * Stateful BM25 corpus manager for incremental indexing and querying.
 * @since 3.1.0
 */

import { Chunk, Data, Effect, Option, Ref } from "effect";
import { createRequire } from "module";
import type { ItsFunction } from "wink-nlp";
import type { Document } from "../Core/Document.js";
import { DocumentId } from "../Core/Document.js";
import type { Token } from "../Core/Token.js";
import { WinkEngine } from "./WinkEngine.js";
import {
  DefaultBM25Config,
  type BM25Config,
  type BM25VectorizerFactory,
  type BM25VectorizerInstance,
  DocumentVector,
} from "./WinkVectorizer.js";
import { CosineSimilarityRequest, WinkSimilarity, WinkSimilarityLive } from "./WinkSimilarity.js";

const require = createRequire(import.meta.url);
const BM25Vectorizer: BM25VectorizerFactory = require("wink-nlp/utilities/bm25-vectorizer");

export interface CreateCorpusRequest {
  readonly corpusId?: string;
  readonly bm25Config?: Partial<BM25Config>;
}

export interface CorpusSummary {
  readonly corpusId: string;
  readonly documentCount: number;
  readonly vocabularySize: number;
  readonly createdAtMs: number;
  readonly config: BM25Config;
}

export interface LearnCorpusRequest {
  readonly corpusId: string;
  readonly documents: Chunk.Chunk<Document>;
  readonly dedupeById?: boolean;
}

export interface LearnCorpusResult {
  readonly corpusId: string;
  readonly learnedCount: number;
  readonly skippedCount: number;
  readonly totalDocuments: number;
  readonly vocabularySize: number;
  readonly reindexRequired: boolean;
}

export interface QueryCorpusRequest {
  readonly corpusId: string;
  readonly query: string;
  readonly topN?: number;
  readonly includeText?: boolean;
}

export interface RankedCorpusDocument {
  readonly index: number;
  readonly id: string;
  readonly score: number;
  readonly text?: string;
}

export interface QueryCorpusResult {
  readonly corpusId: string;
  readonly query: string;
  readonly method: "vector.cosine";
  readonly ranked: ReadonlyArray<RankedCorpusDocument>;
  readonly totalDocuments: number;
  readonly returned: number;
}

export interface CorpusStatsRequest {
  readonly corpusId: string;
  readonly includeIdf?: boolean;
  readonly includeMatrix?: boolean;
  readonly topIdfTerms?: number;
}

export interface CorpusIdfValue {
  readonly term: string;
  readonly idf: number;
}

export interface CorpusStatsResult {
  readonly corpusId: string;
  readonly totalDocuments: number;
  readonly vocabularySize: number;
  readonly averageDocumentLength: number;
  readonly terms: ReadonlyArray<string>;
  readonly idfValues: ReadonlyArray<CorpusIdfValue>;
  readonly documentTermMatrix: ReadonlyArray<ReadonlyArray<number>>;
  readonly matrixShape: {
    readonly rows: number;
    readonly cols: number;
  };
}

export class CorpusManagerError extends Data.TaggedError("CorpusManagerError")<{
  readonly message: string;
  readonly corpusId?: string;
  readonly cause?: unknown;
}> {}

interface CompiledCorpus {
  readonly vectorizer: BM25VectorizerInstance;
  readonly terms: ReadonlyArray<string>;
  readonly documentVectors: ReadonlyArray<ReadonlyArray<number>>;
}

interface CorpusSessionState {
  readonly corpusId: string;
  readonly documents: ReadonlyArray<Document>;
  readonly vocabulary: ReadonlySet<string>;
  readonly totalTokenCount: number;
  readonly compiled: Option.Option<CompiledCorpus>;
  readonly config: BM25Config;
  readonly createdAtMs: number;
  readonly updatedAtMs: number;
}

interface CorpusSession {
  readonly stateRef: Ref.Ref<CorpusSessionState>;
  readonly lock: Effect.Semaphore;
}

const makeCorpusError = (
  message: string,
  options?: {
    readonly corpusId?: string;
    readonly cause?: unknown;
  }
): CorpusManagerError => {
  const args: {
    readonly message: string;
    readonly corpusId?: string;
    readonly cause?: unknown;
  } = { message };

  if (options?.corpusId !== undefined) {
    Object.assign(args, { corpusId: options.corpusId });
  }
  if (options?.cause !== undefined) {
    Object.assign(args, { cause: options.cause });
  }

  return new CorpusManagerError(args);
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const corpusIdOptions = (
  corpusId?: string
): {
  readonly corpusId: string;
} | undefined => (corpusId === undefined ? undefined : { corpusId });

const decodeStringArray = (
  value: unknown,
  context: string,
  corpusId?: string
): Effect.Effect<ReadonlyArray<string>, CorpusManagerError> =>
  Array.isArray(value) && value.every((item) => typeof item === "string")
    ? Effect.succeed(value)
    : Effect.fail(
        makeCorpusError(
          `Invalid ${context}: expected string[]`,
          corpusIdOptions(corpusId)
        )
      );

const decodeNumberArray = (
  value: unknown,
  context: string,
  corpusId?: string
): Effect.Effect<ReadonlyArray<number>, CorpusManagerError> =>
  Array.isArray(value) && value.every(isFiniteNumber)
    ? Effect.succeed(value)
    : Effect.fail(
        makeCorpusError(
          `Invalid ${context}: expected number[]`,
          corpusIdOptions(corpusId)
        )
      );

const decodeIdfEntries = (
  value: unknown,
  corpusId?: string
): Effect.Effect<ReadonlyArray<readonly [string, number]>, CorpusManagerError> => {
  if (!Array.isArray(value)) {
    return Effect.fail(
      makeCorpusError(
        "Invalid idf output: expected [term, idf][]",
        corpusIdOptions(corpusId)
      )
    );
  }

  const decoded: Array<readonly [string, number]> = [];
  for (const entry of value) {
    if (
      !Array.isArray(entry) ||
      entry.length !== 2 ||
      typeof entry[0] !== "string" ||
      !isFiniteNumber(entry[1])
    ) {
      return Effect.fail(
        makeCorpusError(
          "Invalid idf output: expected [term, idf][]",
          corpusIdOptions(corpusId)
        )
      );
    }
    decoded.push([entry[0], entry[1]]);
  }

  return Effect.succeed(decoded);
};

const decodeMatrix = (
  value: unknown,
  corpusId?: string
): Effect.Effect<ReadonlyArray<ReadonlyArray<number>>, CorpusManagerError> => {
  if (!Array.isArray(value)) {
    return Effect.fail(
      makeCorpusError(
        "Invalid document-term matrix output",
        corpusIdOptions(corpusId)
      )
    );
  }

  const rows: Array<ReadonlyArray<number>> = [];
  for (const row of value) {
    if (!Array.isArray(row) || !row.every(isFiniteNumber)) {
      return Effect.fail(
        makeCorpusError(
          "Invalid document-term matrix output",
          corpusIdOptions(corpusId)
        )
      );
    }
    rows.push(row);
  }

  return Effect.succeed(rows);
};

const extractNormalizedTokens = (tokens: Chunk.Chunk<Token>): ReadonlyArray<string> =>
  Chunk.toReadonlyArray(
    Chunk.map(tokens, (token) =>
      Option.match(token.normal, {
        onNone: () => token.text,
        onSome: (normal) => normal ?? token.text,
      })
    )
  );

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isAccessorFn = (
  value: unknown
): value is (...args: Array<any>) => unknown => typeof value === "function";

const isItsFunction = (value: unknown): value is ItsFunction<unknown> =>
  typeof value === "function";

const resolveAccessor = (
  its: unknown,
  name: string,
  corpusId?: string
): Effect.Effect<(...args: Array<any>) => unknown, CorpusManagerError> =>
  isRecord(its) && isAccessorFn(its[name])
    ? Effect.succeed(its[name])
    : Effect.fail(
        makeCorpusError(
          `Wink accessor its.${name} is unavailable`,
          corpusIdOptions(corpusId)
        )
      );

const resolveTokenAccessor = (
  its: unknown,
  name: string,
  corpusId?: string
): Effect.Effect<ItsFunction<unknown>, CorpusManagerError> =>
  isRecord(its) && isItsFunction(its[name])
    ? Effect.succeed(its[name])
    : Effect.fail(
        makeCorpusError(
          `Wink accessor its.${name} is unavailable`,
          corpusIdOptions(corpusId)
        )
      );

const resolveVectorizerAccessor = (
  its: unknown,
  name: string,
  corpusId?: string
): Effect.Effect<(...args: Array<any>) => unknown, CorpusManagerError> =>
  resolveAccessor(its, name, corpusId);

const makeDefaultSessionState = (
  corpusId: string,
  config: BM25Config,
  nowMs: number
): CorpusSessionState => ({
  corpusId,
  documents: [],
  vocabulary: new Set<string>(),
  totalTokenCount: 0,
  compiled: Option.none(),
  config,
  createdAtMs: nowMs,
  updatedAtMs: nowMs,
});

const sanitizeTopN = (topN: number | undefined, max: number): number => {
  if (topN === undefined) {
    return max;
  }
  if (!Number.isFinite(topN)) {
    return max;
  }
  return Math.min(max, Math.max(1, Math.floor(topN)));
};

const sanitizeTopIdfTerms = (top: number | undefined, max: number): number => {
  if (top === undefined) {
    return max;
  }
  if (!Number.isFinite(top)) {
    return max;
  }
  return Math.min(max, Math.max(1, Math.floor(top)));
};

export class WinkCorpusManager extends Effect.Service<WinkCorpusManager>()(
  "effect-nlp/WinkCorpusManager",
  {
    effect: Effect.gen(function* () {
      const engine = yield* WinkEngine;
      const similarity = yield* WinkSimilarity;
      const sessionsRef = yield* Ref.make(
        new Map<string, CorpusSession>()
      );
      const sessionsLock = yield* Effect.makeSemaphore(1);
      const idCounterRef = yield* Ref.make(0);

      const makeGeneratedId = (): Effect.Effect<string> =>
        Ref.updateAndGet(idCounterRef, (current) => current + 1).pipe(
          Effect.map((counter) => `corpus-${Date.now()}-${counter}`)
        );

      const withSessionsLock = <A, E, R>(
        effect: Effect.Effect<A, E, R>
      ): Effect.Effect<A, E, R> => sessionsLock.withPermits(1)(effect);

      const getSession = (
        corpusId: string
      ): Effect.Effect<CorpusSession, CorpusManagerError> =>
        withSessionsLock(
          Effect.gen(function* () {
            const sessions = yield* Ref.get(sessionsRef);
            const session = sessions.get(corpusId);
            if (session === undefined) {
              return yield* makeCorpusError(`Corpus "${corpusId}" does not exist`, {
                corpusId,
              });
            }
            return session;
          })
        );

      const withCorpusLock = <A, E>(
        corpusId: string,
        f: (
          session: CorpusSession
        ) => Effect.Effect<A, E | CorpusManagerError>
      ): Effect.Effect<A, E | CorpusManagerError> =>
        Effect.gen(function* () {
          const session = yield* getSession(corpusId);
          return yield* session.lock.withPermits(1)(f(session));
        });

      const readTextTokens = (
        text: string,
        its: unknown,
        corpusId: string
      ): Effect.Effect<ReadonlyArray<string>, CorpusManagerError> =>
        Effect.gen(function* () {
          const normalAccessor = yield* resolveTokenAccessor(
            its,
            "normal",
            corpusId
          );
          const winkDoc = yield* engine.getWinkDoc(text).pipe(
            Effect.mapError((cause) =>
              makeCorpusError("Failed to tokenize text", {
                corpusId,
                cause,
              })
            )
          );

          const raw = winkDoc.tokens().out(normalAccessor);
          return yield* decodeStringArray(raw, "normalized token output", corpusId);
        });

      const readDocumentTokens = (
        document: Document,
        its: unknown,
        corpusId: string
      ): Effect.Effect<ReadonlyArray<string>, CorpusManagerError> =>
        Chunk.size(document.tokens) > 0
          ? Effect.succeed(extractNormalizedTokens(document.tokens))
          : readTextTokens(document.text, its, corpusId);

      const compileSession = (
        state: CorpusSessionState,
        its: unknown
      ): Effect.Effect<CompiledCorpus, CorpusManagerError> =>
        Effect.gen(function* () {
          const vectorizer = BM25Vectorizer(state.config);

          if (state.documents.length === 0) {
            return {
              vectorizer,
              terms: [],
              documentVectors: [],
            };
          }

          const termsAccessor = yield* resolveVectorizerAccessor(
            its,
            "terms",
            state.corpusId
          );
          const vectorAccessor = yield* resolveVectorizerAccessor(
            its,
            "vector",
            state.corpusId
          );

          const tokenizedDocuments = yield* Effect.forEach(
            state.documents,
            (document) => readDocumentTokens(document, its, state.corpusId)
          );

          yield* Effect.forEach(
            tokenizedDocuments,
            (tokens) =>
              Effect.try({
                try: () => {
                  vectorizer.learn([...tokens]);
                },
                catch: (cause) =>
                  makeCorpusError("Failed to learn document into corpus index", {
                    corpusId: state.corpusId,
                    cause,
                  }),
              }),
            { discard: true }
          );

          const terms = yield* Effect.try({
            try: () => vectorizer.out(termsAccessor),
            catch: (cause) =>
              makeCorpusError("Failed to compute corpus terms", {
                corpusId: state.corpusId,
                cause,
              }),
          }).pipe(
            Effect.flatMap((raw) =>
              decodeStringArray(raw, "corpus term output", state.corpusId)
            )
          );

          const documentVectors = yield* Effect.forEach(
            state.documents,
            (_document, index) =>
              Effect.try({
                try: () => vectorizer.doc(index).out(vectorAccessor),
                catch: (cause) =>
                  makeCorpusError("Failed to compute document vector", {
                    corpusId: state.corpusId,
                    cause,
                  }),
              }).pipe(
                Effect.flatMap((raw) =>
                  decodeNumberArray(raw, "document vector output", state.corpusId)
                )
              )
          );

          return {
            vectorizer,
            terms,
            documentVectors,
          };
        });

      const ensureCompiled = (
        session: CorpusSession,
        its: unknown
      ): Effect.Effect<{
        readonly state: CorpusSessionState;
        readonly compiled: CompiledCorpus;
      }, CorpusManagerError> =>
        Effect.gen(function* () {
          const state = yield* Ref.get(session.stateRef);
          if (Option.isSome(state.compiled)) {
            return { state, compiled: state.compiled.value };
          }

          const compiled = yield* compileSession(state, its);
          const updatedState: CorpusSessionState = {
            ...state,
            compiled: Option.some(compiled),
          };
          yield* Ref.set(session.stateRef, updatedState);
          return { state: updatedState, compiled };
        });

      return {
        createCorpus: (request?: CreateCorpusRequest) =>
          withSessionsLock(
            Effect.gen(function* () {
              const sessions = yield* Ref.get(sessionsRef);
              const requestedId = request?.corpusId;
              const corpusId =
                requestedId !== undefined ? requestedId : yield* makeGeneratedId();

              if (sessions.has(corpusId)) {
                return yield* makeCorpusError(`Corpus "${corpusId}" already exists`, {
                  corpusId,
                });
              }

              const config: BM25Config = {
                ...DefaultBM25Config,
                ...(request?.bm25Config ?? {}),
              };

              const sessionLock = yield* Effect.makeSemaphore(1);
              const nowMs = Date.now();
              const stateRef = yield* Ref.make(
                makeDefaultSessionState(corpusId, config, nowMs)
              );

              yield* Ref.update(sessionsRef, (current) => {
                const next = new Map(current);
                next.set(corpusId, {
                  stateRef,
                  lock: sessionLock,
                });
                return next;
              });

              return {
                corpusId,
                documentCount: 0,
                vocabularySize: 0,
                createdAtMs: nowMs,
                config,
              };
            })
          ),

        deleteCorpus: (corpusId: string) =>
          withSessionsLock(
            Effect.gen(function* () {
              const sessions = yield* Ref.get(sessionsRef);
              const session = sessions.get(corpusId);
              if (session === undefined) {
                return false;
              }

              return yield* session.lock.withPermits(1)(
                Ref.update(sessionsRef, (current) => {
                  const next = new Map(current);
                  next.delete(corpusId);
                  return next;
                }).pipe(Effect.as(true))
              );
            })
          ),

        learnDocuments: (request: LearnCorpusRequest) =>
          withCorpusLock(request.corpusId, (session) =>
            Effect.gen(function* () {
              const its = yield* engine.its;
              const state = yield* Ref.get(session.stateRef);
              const dedupeById = request.dedupeById ?? true;
              const existingIds = new Set(
                state.documents.map((document) => document.id)
              );

              const incoming = Chunk.toReadonlyArray(request.documents);
              const learnedDocuments: Array<Document> = [];
              const vocabulary = new Set(state.vocabulary);
              let totalTokenCount = state.totalTokenCount;
              let skippedCount = 0;

              for (const document of incoming) {
                if (dedupeById && existingIds.has(document.id)) {
                  skippedCount += 1;
                  continue;
                }

                const tokens = yield* readDocumentTokens(
                  document,
                  its,
                  request.corpusId
                );
                for (const token of tokens) {
                  vocabulary.add(token);
                }
                totalTokenCount += tokens.length;
                existingIds.add(document.id);
                learnedDocuments.push(document);
              }

              const nowMs = Date.now();
              const updatedDocuments = [...state.documents, ...learnedDocuments];
              const updatedState: CorpusSessionState = {
                ...state,
                documents: updatedDocuments,
                vocabulary,
                totalTokenCount,
                compiled: Option.none(),
                updatedAtMs: nowMs,
              };

              yield* Ref.set(session.stateRef, updatedState);

              return {
                corpusId: request.corpusId,
                learnedCount: learnedDocuments.length,
                skippedCount,
                totalDocuments: updatedDocuments.length,
                vocabularySize: vocabulary.size,
                reindexRequired: true,
              };
            })
          ),

        query: (request: QueryCorpusRequest) =>
          withCorpusLock(request.corpusId, (session) =>
            Effect.gen(function* () {
              const its = yield* engine.its;
              const { compiled, state } = yield* ensureCompiled(session, its);

              if (state.documents.length === 0) {
                return {
                  corpusId: request.corpusId,
                  query: request.query,
                  method: "vector.cosine" as const,
                  ranked: [],
                  totalDocuments: 0,
                  returned: 0,
                };
              }

              const queryTokens = yield* readTextTokens(
                request.query,
                its,
                request.corpusId
              );
              const queryVectorRaw = yield* Effect.try({
                try: () => compiled.vectorizer.vectorOf([...queryTokens]),
                catch: (cause) =>
                  makeCorpusError("Failed to vectorize query text", {
                    corpusId: request.corpusId,
                    cause,
                  }),
              }).pipe(
                Effect.flatMap((raw) =>
                  decodeNumberArray(raw, "query vector output", request.corpusId)
                )
              );

              const termsChunk = Chunk.fromIterable(compiled.terms);
              const queryVector = DocumentVector({
                documentId: DocumentId.make(
                  `${request.corpusId}-query-${Date.now()}`
                ),
                vector: Chunk.fromIterable(queryVectorRaw),
                terms: termsChunk,
              });

              const includeText = request.includeText ?? false;
              const scored = yield* Effect.forEach(
                state.documents,
                (document, index) =>
                  Effect.gen(function* () {
                    const candidateVectorRaw = compiled.documentVectors[index] ?? [];
                    const candidateVector = DocumentVector({
                      documentId: document.id,
                      vector: Chunk.fromIterable(candidateVectorRaw),
                      terms: termsChunk,
                    });

                    const similarityScore = yield* similarity.vectorCosine(
                      CosineSimilarityRequest({
                        vector1: queryVector,
                        vector2: candidateVector,
                      })
                    ).pipe(
                      Effect.mapError((cause) =>
                        makeCorpusError("Failed to compute query similarity", {
                          corpusId: request.corpusId,
                          cause,
                        })
                      )
                    );

                    const ranked: RankedCorpusDocument = includeText
                      ? {
                          index,
                          id: document.id,
                          score: Number.isFinite(similarityScore.score)
                            ? similarityScore.score
                            : 0,
                          text: document.text,
                        }
                      : {
                          index,
                          id: document.id,
                          score: Number.isFinite(similarityScore.score)
                            ? similarityScore.score
                            : 0,
                        };

                    return ranked;
                  })
              );

              const sorted = [...scored].sort(
                (a, b) => b.score - a.score || a.index - b.index
              );
              const limit = sanitizeTopN(request.topN, sorted.length);
              const ranked = sorted.slice(0, limit);

              return {
                corpusId: request.corpusId,
                query: request.query,
                method: "vector.cosine" as const,
                ranked,
                totalDocuments: state.documents.length,
                returned: ranked.length,
              };
            })
          ),

        getStats: (request: CorpusStatsRequest) =>
          withCorpusLock(request.corpusId, (session) =>
            Effect.gen(function* () {
              const its = yield* engine.its;
              const { compiled, state } = yield* ensureCompiled(session, its);

              if (state.documents.length === 0) {
                return {
                  corpusId: request.corpusId,
                  totalDocuments: 0,
                  vocabularySize: 0,
                  averageDocumentLength: 0,
                  terms: [],
                  idfValues: [],
                  documentTermMatrix: [],
                  matrixShape: {
                    rows: 0,
                    cols: 0,
                  },
                };
              }

              const includeIdf = request.includeIdf ?? false;
              const includeMatrix = request.includeMatrix ?? false;

              const idfValues: ReadonlyArray<CorpusIdfValue> = includeIdf
                ? yield* Effect.gen(function* () {
                    const accessor = yield* resolveVectorizerAccessor(
                      its,
                      "idf",
                      request.corpusId
                    );
                    const idfRaw = yield* Effect.try({
                      try: () => compiled.vectorizer.out(accessor),
                      catch: (cause) =>
                        makeCorpusError("Failed to compute corpus idf values", {
                          corpusId: request.corpusId,
                          cause,
                        }),
                    });
                    const decoded = yield* decodeIdfEntries(
                      idfRaw,
                      request.corpusId
                    );
                    const sortedByIdf = [...decoded].sort(
                      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
                    );
                    const idfLimit = sanitizeTopIdfTerms(
                      request.topIdfTerms,
                      sortedByIdf.length
                    );
                    return sortedByIdf.slice(0, idfLimit).map(([term, idf]) => ({
                      term,
                      idf,
                    }));
                  })
                : [];

              const matrix: ReadonlyArray<ReadonlyArray<number>> = includeMatrix
                ? yield* Effect.gen(function* () {
                    const accessor = yield* resolveVectorizerAccessor(
                      its,
                      "docTermMatrix",
                      request.corpusId
                    );
                    const matrixRaw = yield* Effect.try({
                      try: () => compiled.vectorizer.out(accessor),
                      catch: (cause) =>
                        makeCorpusError(
                          "Failed to compute corpus document-term matrix",
                          {
                            corpusId: request.corpusId,
                            cause,
                          }
                        ),
                    });
                    return yield* decodeMatrix(matrixRaw, request.corpusId);
                  })
                : [];

              const averageDocumentLength =
                state.documents.length > 0
                  ? state.totalTokenCount / state.documents.length
                  : 0;

              return {
                corpusId: request.corpusId,
                totalDocuments: state.documents.length,
                vocabularySize: state.vocabulary.size,
                averageDocumentLength,
                terms: compiled.terms,
                idfValues,
                documentTermMatrix: matrix,
                matrixShape: {
                  rows: includeMatrix ? matrix.length : state.documents.length,
                  cols: compiled.terms.length,
                },
              };
            })
          ),
      };
    }),
    dependencies: [WinkEngine.Default, WinkSimilarityLive],
  }
) {}

export const WinkCorpusManagerLive = WinkCorpusManager.Default;

export const createCorpus = (request?: CreateCorpusRequest) =>
  Effect.flatMap(WinkCorpusManager, (service) => service.createCorpus(request));

export const deleteCorpus = (corpusId: string) =>
  Effect.flatMap(WinkCorpusManager, (service) => service.deleteCorpus(corpusId));

export const learnCorpusDocuments = (request: LearnCorpusRequest) =>
  Effect.flatMap(WinkCorpusManager, (service) =>
    service.learnDocuments(request)
  );

export const queryCorpus = (request: QueryCorpusRequest) =>
  Effect.flatMap(WinkCorpusManager, (service) => service.query(request));

export const getManagedCorpusStats = (request: CorpusStatsRequest) =>
  Effect.flatMap(WinkCorpusManager, (service) => service.getStats(request));
