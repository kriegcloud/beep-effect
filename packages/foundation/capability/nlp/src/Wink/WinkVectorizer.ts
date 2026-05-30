/**
 * Wink BM25 vectorizer service and related domain models.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { createRequire } from "node:module";
import { $NlpId } from "@beep/identity";
import { LiteralKit, SchemaUtils, TaggedErrorClass } from "@beep/schema";
import { A } from "@beep/utils";
import { Chunk, Context, Effect, Inspectable, Layer, pipe, Ref } from "effect";
import * as Bool from "effect/Boolean";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { DocumentId } from "../Core/Document.ts";
import { PositiveNumber, UnitInterval } from "../internal/numbers.ts";
import { WinkEngine } from "./WinkEngine.ts";
import type { ItsHelpers } from "wink-nlp";
import type { Document } from "../Core/Document.ts";
import type { Token } from "../Core/Token.ts";

const $I = $NlpId.create("Wink/WinkVectorizer");
const require = createRequire(import.meta.url);
const BM25NormKit = LiteralKit(["none", "l1", "l2"]).annotate(
  $I.annote("BM25NormKit", {
    description: "LiteralKit backing schema for BM25 normalization modes.",
  })
);

type BM25Accessor<T> = (...args: ReadonlyArray<never>) => T;

type BM25VectorizerInstance = {
  readonly bowOf: (tokens: Array<string>, processOov?: boolean) => Record<string, number>;
  readonly doc: (index: number) => {
    readonly out: <T>(accessor: BM25Accessor<T>) => T;
  };
  readonly learn: (tokens: Array<string>) => void;
  readonly out: <T>(accessor: BM25Accessor<T>) => T;
  readonly vectorOf: (tokens: Array<string>) => Array<number>;
};

type BM25VectorizerFactory = (config?: {
  readonly b?: number;
  readonly k?: number;
  readonly k1?: number;
  readonly norm?: "none" | "l1" | "l2";
}) => BM25VectorizerInstance;

type VectorizerState = {
  readonly documentIds: ReadonlyArray<DocumentId>;
  readonly vectorizer: BM25VectorizerInstance;
};
type WinkEngineService = typeof WinkEngine.Service;

const appendDocument = (state: VectorizerState, document: Document): VectorizerState => ({
  documentIds: [...state.documentIds, document.id],
  vectorizer: state.vectorizer,
});

const learnDocumentState = (
  state: VectorizerState,
  document: Document,
  tokens: ReadonlyArray<string>
): VectorizerState => {
  state.vectorizer.learn(A.fromIterable(tokens));
  return appendDocument(state, document);
};

/**
 * Isolated vectorizer surface passed to scoped BM25 workflows.
 *
 * @remarks
 * Implementations created by `withFreshInstance` do not mutate the shared live
 * vectorizer state, which makes them useful for one-off ranking and keyword
 * extraction jobs.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import type { ScopedVectorizer } from "@beep/nlp/Wink/WinkVectorizer"
 *
 * const readFirstDocumentTerms = (scoped: ScopedVectorizer) =>
 *   scoped.getDocumentTermFrequencies(0).pipe(Effect.map((terms) => terms.length))
 *
 * console.log(typeof readFirstDocumentTerms)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface ScopedVectorizer {
  readonly getDocumentTermFrequencies: (
    docIndex: number
  ) => Effect.Effect<ReadonlyArray<TermFrequency>, VectorizerError>;
  readonly learnDocument: (document: Document) => Effect.Effect<void, VectorizerError>;
  readonly vectorizeDocument: (document: Document) => Effect.Effect<DocumentVector, VectorizerError>;
}

type WinkVectorizerShape = {
  readonly getBagOfWords: (document: Document) => Effect.Effect<BagOfWords, VectorizerError>;
  readonly getConfig: Effect.Effect<BM25Config>;
  readonly getDocumentTermFrequencies: (
    docIndex: number
  ) => Effect.Effect<ReadonlyArray<TermFrequency>, VectorizerError>;
  readonly learnDocument: (document: Document) => Effect.Effect<void, VectorizerError>;
  readonly learnDocuments: (documents: ReadonlyArray<Document>) => Effect.Effect<void, VectorizerError>;
  readonly reset: Effect.Effect<void, VectorizerError>;
  readonly vectorizeDocument: (document: Document) => Effect.Effect<DocumentVector, VectorizerError>;
  readonly withFreshInstance: <A, E, R>(
    f: (isolated: ScopedVectorizer) => Effect.Effect<A, E, R>
  ) => Effect.Effect<A, E | VectorizerError, R>;
};

const loadBM25Vectorizer = (): BM25VectorizerFactory => require("wink-nlp/utilities/bm25-vectorizer");
/**
 * BM25 normalization mode used by vectorizer and corpus services.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { BM25Norm } from "@beep/nlp/Wink/WinkVectorizer"
 *
 * const norm = S.decodeSync(BM25Norm)("l2")
 * console.log(norm)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const BM25Norm = BM25NormKit.pipe(
  $I.annoteSchema("BM25Norm", {
    description: "Vector normalization mode used by the BM25 vectorizer.",
  }),
  SchemaUtils.withLiteralKitStatics(BM25NormKit)
);

const normalizeTokenText = (token: Token): string =>
  O.match(token.normal, {
    onNone: () => token.text,
    onSome: (normal) => normal ?? token.text,
  });

const toFiniteRecord = (record: Record<string, number>): Record<string, number> =>
  R.fromEntries(A.map(R.toEntries(record), ([key, value]) => [key, P.isNumber(value) ? value : 0] as const));

const isStringArray = (value: unknown): value is ReadonlyArray<string> =>
  A.isArray(value) && A.every(value, P.isString);

const isTermFrequencyPair = (value: unknown): value is readonly [string, number] =>
  A.isArray(value) && value.length >= 2 && P.isString(value[0]) && P.isNumber(value[1]);

const decodeStringArray = (value: unknown, operation: string): Effect.Effect<ReadonlyArray<string>, VectorizerError> =>
  isStringArray(value)
    ? Effect.succeed(value)
    : Effect.fail(VectorizerError.fromMessage(`Invalid ${operation} result: expected string[]`, operation));

const decodeTermFrequencyPairs = (
  value: unknown,
  operation: string
): Effect.Effect<ReadonlyArray<readonly [string, number]>, VectorizerError> =>
  A.isArray(value) && A.every(value, isTermFrequencyPair)
    ? Effect.succeed(value)
    : Effect.fail(VectorizerError.fromMessage(`Invalid ${operation} result: expected [string, number][]`, operation));

const readNormalizedTokensFromWink = (
  engine: WinkEngineService,
  document: Document,
  its: ItsHelpers
): Effect.Effect<ReadonlyArray<string>, VectorizerError> =>
  engine.getWinkDoc(document.text).pipe(
    Effect.flatMap((winkDoc) => decodeStringArray(winkDoc.tokens().out(its.normal), "readNormalizedTokens")),
    Effect.map(A.fromIterable),
    Effect.mapError(VectorizerError.fromCause("readNormalizedTokens"))
  );

/**
 * Resolved BM25 hyperparameters used by wink vectorization and corpus management.
 *
 * @example
 * ```ts
 * import { BM25Config } from "@beep/nlp/Wink/WinkVectorizer"
 *
 * const config = BM25Config.make({
 *   b: 0.75,
 *   k: 1,
 *   k1: 1.2,
 *   norm: "none"
 * })
 *
 * console.log(config.k1)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class BM25Config extends S.Class<BM25Config>($I`BM25Config`)(
  {
    b: UnitInterval,
    k: PositiveNumber,
    k1: PositiveNumber,
    norm: BM25Norm,
  },
  $I.annote("BM25Config", {
    description: "Resolved BM25 hyperparameters used by wink vectorization.",
  })
) {
  /**
   * Backwards-compatible unsafe constructor alias.
   */
}

/**
 * Default BM25 hyperparameters used by the live wink vectorizer.
 *
 * @example
 * ```ts
 * import { DefaultBM25Config } from "@beep/nlp/Wink/WinkVectorizer"
 *
 * console.log(DefaultBM25Config.norm)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const DefaultBM25Config = BM25Config.make({
  b: 0.75,
  k: 1,
  k1: 1.2,
  norm: "none",
});

/**
 * Dense BM25 vector representation for a document or query.
 *
 * @example
 * ```ts
 * import { DocumentId } from "@beep/nlp/Core/Document"
 * import { DocumentVector } from "@beep/nlp/Wink/WinkVectorizer"
 *
 * const vector = DocumentVector.make({
 *   documentId: DocumentId.make("doc-a"),
 *   terms: ["effect", "schema"],
 *   vector: [0.7, 0.3]
 * })
 *
 * console.log(vector.vector.length)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class DocumentVector extends S.Class<DocumentVector>($I`DocumentVector`)(
  {
    documentId: DocumentId,
    terms: S.Array(S.String),
    vector: S.Array(S.Number),
  },
  $I.annote("DocumentVector", {
    description: "Dense BM25 vector representation for a document-like input.",
  })
) {}

/**
 * Bag-of-words term-frequency representation for a document or query.
 *
 * @example
 * ```ts
 * import { DocumentId } from "@beep/nlp/Core/Document"
 * import { BagOfWords } from "@beep/nlp/Wink/WinkVectorizer"
 *
 * const bow = BagOfWords.make({
 *   bow: { effect: 2, schema: 1 },
 *   documentId: DocumentId.make("doc-a")
 * })
 *
 * console.log(bow.bow.effect)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class BagOfWords extends S.Class<BagOfWords>($I`BagOfWords`)(
  {
    bow: S.Record(S.String, S.Number),
    documentId: DocumentId,
  },
  $I.annote("BagOfWords", {
    description: "Bag-of-words term-frequency representation for a document-like input.",
  })
) {}

/**
 * Term-frequency entry reported for a learned BM25 document.
 *
 * @example
 * ```ts
 * import { TermFrequency } from "@beep/nlp/Wink/WinkVectorizer"
 *
 * const tf = TermFrequency.make({
 *   frequency: 3,
 *   term: "effect"
 * })
 *
 * console.log(`${tf.term}:${tf.frequency}`)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TermFrequency extends S.Class<TermFrequency>($I`TermFrequency`)(
  {
    frequency: S.Number,
    term: S.String,
  },
  $I.annote("TermFrequency", {
    description: "Normalized BM25 term contribution for a learned document.",
  })
) {}

/**
 * Typed failure for learning documents or querying wink BM25 vector data.
 *
 * @example
 * ```ts
 * import { VectorizerError } from "@beep/nlp/Wink/WinkVectorizer"
 *
 * const error = VectorizerError.fromMessage("Document index is out of range", "tf")
 * console.log(error.message)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class VectorizerError extends TaggedErrorClass<VectorizerError>($I`VectorizerError`)(
  "VectorizerError",
  {
    cause: S.DefectWithStack,
    message: S.String,
    operation: S.String,
  },
  $I.annote("VectorizerError", {
    description: "Failure raised while learning or querying wink BM25 vectors.",
  })
) {
  /**
   * Convert an unknown cause into a typed vectorizer error.
   *
   * @param cause - The underlying failure or defect.
   * @param operation - The vectorizer operation that failed.
   * @returns A typed vectorizer error value.
   */
  static readonly fromCause: {
    (cause: unknown, operation: string): VectorizerError;
    (operation: string): (cause: unknown) => VectorizerError;
  } = dual(
    2,
    (cause: unknown, operation: string): VectorizerError =>
      VectorizerError.make({
        cause,
        message: `Wink vectorizer ${operation} failed: ${Inspectable.toStringUnknown(cause)}`,
        operation,
      })
  );

  /**
   * Create a vectorizer error without an external cause.
   *
   * @param message - The human-readable vectorizer error message.
   * @param operation - The vectorizer operation associated with the failure.
   * @returns A typed vectorizer error value without an external cause.
   */
  static readonly fromMessage: {
    (message: string, operation: string): VectorizerError;
    (message: string): (operation: string) => VectorizerError;
  } = dual(
    2,
    (message: string, operation: string): VectorizerError =>
      VectorizerError.make({
        cause: undefined,
        message,
        operation,
      })
  );
}

const makeWinkVectorizer = Effect.gen(function* () {
  const engine = yield* WinkEngine;
  const its = yield* engine.its;
  const bm25 = yield* Effect.try({
    try: loadBM25Vectorizer,
    catch: VectorizerError.fromCause("initialize"),
  });

  const config = DefaultBM25Config;
  const vectorizerRef = yield* Ref.make<VectorizerState>({
    documentIds: [],
    vectorizer: bm25(config),
  });

  const readNormalizedTokens = (document: Document): Effect.Effect<ReadonlyArray<string>, VectorizerError> =>
    Bool.match(document.tokenCount > 0, {
      onFalse: () => readNormalizedTokensFromWink(engine, document, its),
      onTrue: () =>
        Effect.succeed(A.fromIterable(pipe(Chunk.toReadonlyArray(document.tokens), A.map(normalizeTokenText)))),
    });

  const getTerms = (vectorizer: BM25VectorizerInstance): Effect.Effect<ReadonlyArray<string>, VectorizerError> =>
    pipe(
      Effect.try({
        try: () => vectorizer.out(its.terms),
        catch: VectorizerError.fromCause("terms"),
      }),
      Effect.flatMap((output) => decodeStringArray(output, "terms"))
    );

  const getTermFrequencies = (vectorizer: BM25VectorizerInstance, docIndex: number) =>
    pipe(
      Effect.try({
        try: () => vectorizer.doc(docIndex).out(its.tf),
        catch: VectorizerError.fromCause("tf"),
      }),
      Effect.flatMap((output) => decodeTermFrequencyPairs(output, "tf")),
      Effect.map((raw) =>
        A.map(raw, ([term, frequency]) =>
          TermFrequency.make({
            frequency,
            term,
          })
        )
      )
    );

  return WinkVectorizer.of({
    getBagOfWords: Effect.fn("Nlp.Wink.WinkVectorizer.getBagOfWords")(function* (document: Document) {
      const state = yield* Ref.get(vectorizerRef);
      const tokens = yield* readNormalizedTokens(document);

      return BagOfWords.make({
        bow: toFiniteRecord(state.vectorizer.bowOf(A.fromIterable(tokens), true)),
        documentId: document.id,
      });
    }),
    getConfig: Effect.succeed(config),
    getDocumentTermFrequencies: Effect.fn("Nlp.Wink.WinkVectorizer.getDocumentTermFrequencies")(function* (
      docIndex: number
    ) {
      const state = yield* Ref.get(vectorizerRef);
      return yield* getTermFrequencies(state.vectorizer, docIndex);
    }),
    learnDocument: Effect.fn("Nlp.Wink.WinkVectorizer.learnDocument")(function* (document: Document) {
      const tokens = yield* readNormalizedTokens(document);
      yield* Ref.update(vectorizerRef, (state) => learnDocumentState(state, document, tokens));
    }),
    learnDocuments: Effect.fn("Nlp.Wink.WinkVectorizer.learnDocuments")(function* (documents: ReadonlyArray<Document>) {
      for (const document of documents) {
        const tokens = yield* readNormalizedTokens(document);
        yield* Ref.update(vectorizerRef, (state) => learnDocumentState(state, document, tokens));
      }
    }),
    reset: Ref.set(vectorizerRef, {
      documentIds: [],
      vectorizer: bm25(config),
    }).pipe(Effect.mapError(VectorizerError.fromCause("reset"))),
    vectorizeDocument: Effect.fn("Nlp.Wink.WinkVectorizer.vectorizeDocument")(function* (document: Document) {
      const state = yield* Ref.get(vectorizerRef);
      const tokens = yield* readNormalizedTokens(document);
      const terms = yield* getTerms(state.vectorizer);

      return DocumentVector.make({
        documentId: document.id,
        terms,
        vector: state.vectorizer.vectorOf(A.fromIterable(tokens)),
      });
    }),
    withFreshInstance: Effect.fn("Nlp.Wink.WinkVectorizer.withFreshInstance")(
      <A, E, R>(f: (isolated: ScopedVectorizer) => Effect.Effect<A, E, R>) => {
        const freshVectorizer = bm25(config);

        const isolated: ScopedVectorizer = {
          getDocumentTermFrequencies: (docIndex) => getTermFrequencies(freshVectorizer, docIndex),
          learnDocument: (document) =>
            pipe(
              readNormalizedTokens(document),
              Effect.flatMap((tokens) =>
                Effect.sync(() => {
                  freshVectorizer.learn(A.fromIterable(tokens));
                })
              ),
              Effect.mapError(VectorizerError.fromCause("freshLearnDocument"))
            ),
          vectorizeDocument: (document) =>
            Effect.flatMap(readNormalizedTokens(document), (tokens) =>
              getTerms(freshVectorizer).pipe(
                Effect.map((terms) =>
                  DocumentVector.make({
                    documentId: document.id,
                    terms,
                    vector: freshVectorizer.vectorOf(A.fromIterable(tokens)),
                  })
                )
              )
            ),
        };

        return f(isolated);
      }
    ),
  });
}).pipe(Effect.withSpan("Nlp.Wink.WinkVectorizer.make"));

/**
 * Service for learning documents and producing BM25 vectors, bags, and term frequencies.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { WinkEngineLive } from "@beep/nlp/Wink/WinkEngine"
 * import { WinkVectorizer, WinkVectorizerLive } from "@beep/nlp/Wink/WinkVectorizer"
 *
 * const readConfig = Effect.gen(function* () {
 *   const vectorizer = yield* WinkVectorizer
 *   return yield* vectorizer.getConfig
 * })
 *
 * Effect.runPromise(
 *   readConfig.pipe(Effect.provide(WinkVectorizerLive), Effect.provide(WinkEngineLive))
 * ).then((config) => console.log(config.norm))
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class WinkVectorizer extends Context.Service<WinkVectorizer, WinkVectorizerShape>()($I`WinkVectorizer`) {}

/**
 * Live BM25 vectorizer layer that depends on the wink engine.
 *
 * @example
 * ```ts
 * import { Effect, Layer } from "effect"
 * import { WinkEngineLive } from "@beep/nlp/Wink/WinkEngine"
 * import { WinkVectorizer, WinkVectorizerLive } from "@beep/nlp/Wink/WinkVectorizer"
 *
 * const readDefaultConfig = Effect.gen(function* () {
 *   const vectorizer = yield* WinkVectorizer
 *   return yield* vectorizer.getConfig
 * })
 *
 * Effect.runPromise(
 *   readDefaultConfig.pipe(Effect.provide(WinkVectorizerLive.pipe(Layer.provide(WinkEngineLive))))
 * ).then((config) => console.log(config.k1))
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const WinkVectorizerLive = Layer.effect(WinkVectorizer, makeWinkVectorizer);
