/**
 * Pure Wink BM25 Vectorizer Service with Ref-based State Management
 * Clean wrapper around wink-nlp's BM25 vectorizer with Effect patterns
 * @since 3.0.0
 */

import { Effect, Data, Layer, Chunk, Option, Ref, Schema, Context } from "effect";
import { WinkEngine } from "./WinkEngine.js";
import type { Document } from "../Core/Document.js";
import { DocumentId } from "../Core/Document.js";
import type { Token } from "../Core/Token.js";
import { createRequire } from "module";

// Import the BM25 vectorizer utility using createRequire for ES modules
const require = createRequire(import.meta.url);
const BM25Vectorizer: BM25VectorizerFactory = require("wink-nlp/utilities/bm25-vectorizer");

/**
 * Type for BM25Vectorizer output functions
 * These functions receive tf, idf, terms, docId, and sumOfAllDLs parameters
 * Note: The actual signature varies based on the specific its function being used
 */
export type BM25OutputFunction<T> = (...args: Array<any>) => T;

/**
 * BM25 configuration parameters
 */
export interface BM25Config {
  readonly k1: number; // Controls TF saturation (default: 1.2)
  readonly b: number; // Controls doc length normalization (default: 0.75)
  readonly k: number; // Controls IDF saturation (default: 1)
  readonly norm: "none" | "l1" | "l2"; // Vector normalization (default: "none")
  readonly precision?: number; // Decimal precision for calculations (default: 6)
}

/**
 * Type definition for the BM25Vectorizer instance returned by wink-nlp
 * Based on the actual implementation in wink-nlp/utilities/bm25-vectorizer.js
 */
export interface BM25VectorizerInstance {
  /**
   * Learn from a tokenized document
   * @param tokens - Array of tokenized strings
   */
  learn(tokens: Array<string>): void;

  /**
   * Get output based on the specified function
   * @param f - Output function from wink-nlp's its module
   * @returns Array containing strings, objects, or arrays based on the function
   */
  out<T>(f: BM25OutputFunction<T>): T;

  /**
   * Get document-specific APIs
   * @param n - Document index
   * @returns Document API object
   */
  doc(n: number): {
    /**
     * Get document output based on function
     * @param f - Output function
     * @returns Document-specific output
     */
    out(f: any): any;
    /**
     * Get number of unique tokens in the document
     * @returns Number of unique tokens
     */
    length(): number;
  };

  /**
   * Compute vector for input tokens using learned tf-idf
   * @param tokens - Array of tokenized strings
   * @returns Array of numbers representing the vector
   */
  vectorOf(tokens: Array<string>): Array<number>;

  /**
   * Compute bag-of-words for input tokens
   * @param tokens - Array of tokenized strings
   * @param processOOV - Whether to process out-of-vocabulary tokens (default: false)
   * @returns Object with term frequencies
   */
  bowOf(tokens: Array<string>, processOOV?: boolean): Record<string, number>;

  /**
   * Get current configuration
   * @returns Configuration object
   */
  config(): { k: number; k1: number; b: number; norm: string };

  /**
   * Load model from JSON
   * @param json - Model JSON string
   */
  loadModel(json: string): void;
}

/**
 * Type definition for the BM25Vectorizer factory function
 */
export type BM25VectorizerFactory = (
  config?: BM25Config
) => BM25VectorizerInstance;

/**
 * Default BM25 configuration
 */
export const DefaultBM25Config: BM25Config = {
  k1: 1.2,
  b: 0.75,
  k: 1,
  norm: "none",
};

const BM25ConfigTag = Context.GenericTag<Partial<BM25Config>>(
  "effect-nlp/WinkVectorizer/BM25Config"
);

/**
 * Document vector representation
 */
export const DocumentVector = Data.case<{
  readonly documentId: DocumentId;
  readonly vector: Chunk.Chunk<number>;
  readonly terms: Chunk.Chunk<string>;
}>();
export type DocumentVector = ReturnType<typeof DocumentVector>;

/**
 * Bag of words representation
 */
export const BagOfWords = Data.case<{
  readonly documentId: DocumentId;
  readonly bow: Record<string, number>;
}>();
export type BagOfWords = ReturnType<typeof BagOfWords>;

/**
 * Term frequency data
 */
export const TermFrequency = Data.case<{
  readonly term: string;
  readonly frequency: number;
}>();
export type TermFrequency = ReturnType<typeof TermFrequency>;

/**
 * IDF (Inverse Document Frequency) data
 */
export const InverseDocumentFrequency = Data.case<{
  readonly term: string;
  readonly idf: number;
}>();
export type InverseDocumentFrequency = ReturnType<
  typeof InverseDocumentFrequency
>;

/**
 * Corpus statistics
 */
export const CorpusStats = Data.case<{
  readonly totalDocuments: number;
  readonly uniqueTerms: Chunk.Chunk<string>;
  readonly documentTermMatrix: Chunk.Chunk<Chunk.Chunk<number>>;
  readonly idfValues: Chunk.Chunk<InverseDocumentFrequency>;
}>();
export type CorpusStats = ReturnType<typeof CorpusStats>;

/**
 * Vectorizer error types
 */
export class VectorizerError extends Data.TaggedError("VectorizerError")<{
  message: string;
  cause?: unknown;
}> {}

/**
 * Vectorizer state managed by Ref
 */
export interface VectorizerState {
  readonly vectorizer: BM25VectorizerInstance;
  readonly documentIds: ReadonlyArray<DocumentId>;
  readonly config: BM25Config;
}

/**
 * Minimal vectorizer interface for scoped/isolated usage.
 * Only exposes the methods needed by tool handlers.
 */
export interface ScopedVectorizer {
  readonly learnDocument: (document: Document) => Effect.Effect<void, VectorizerError>
  readonly vectorizeDocument: (document: Document) => Effect.Effect<DocumentVector, VectorizerError>
  readonly getDocumentTermFrequencies: (docIndex: number) => Effect.Effect<Chunk.Chunk<TermFrequency>, VectorizerError>
}

/**
 * Wink BM25 Vectorizer Service
 */
export class WinkVectorizer extends Effect.Service<WinkVectorizer>()(
  "effect-nlp/WinkVectorizer",
  {
    effect: Effect.gen(function* () {
      const engine = yield* WinkEngine;
      const its = yield* engine.its;
      const customConfigOption = yield* Effect.serviceOption(BM25ConfigTag);

      // Initialize vectorizer state with Ref
      const config = Option.match(customConfigOption, {
        onNone: () => DefaultBM25Config,
        onSome: (customConfig) => ({
          ...DefaultBM25Config,
          ...customConfig,
        }),
      });
      const stateRef = yield* Ref.make<VectorizerState>({
        vectorizer: BM25Vectorizer(config),
        documentIds: [],
        config,
      });
      const sharedVectorizerSemaphore = yield* Effect.makeSemaphore(1);

      const withSharedLock = <A, E, R>(
        effect: Effect.Effect<A, E, R>
      ): Effect.Effect<A, E, R> =>
        sharedVectorizerSemaphore.withPermits(1)(effect);

      /**
       * Extract normalized tokens from Core Token objects
       * Falls back to text if normal is not available
       */
      const extractNormalizedTokens = (
        tokens: Chunk.Chunk<Token>
      ): Array<string> =>
        Chunk.toArray(
          Chunk.map(tokens, (token) =>
            Option.match(token.normal, {
              onNone: () => token.text,
              onSome: (normal) => normal ?? token.text,
            })
          )
        );

      return {
        /**
         * Learn from a single document
         */
        learnDocument: (document: Document) =>
          withSharedLock(
            Effect.gen(function* () {
              const state = yield* Ref.get(stateRef);

              // Use existing Core Token data if available, otherwise tokenize
              const tokens =
                Chunk.size(document.tokens) > 0
                  ? extractNormalizedTokens(document.tokens)
                  : yield* Effect.gen(function* () {
                      const winkDoc = yield* engine.getWinkDoc(document.text);
                      return winkDoc.tokens().out(its.normal);
                    });

              state.vectorizer.learn(tokens);

              // Update state with new document ID
              yield* Ref.update(stateRef, (s) => ({
                ...s,
                documentIds: [...s.documentIds, document.id],
              }));
            }).pipe(
              Effect.mapError(
                (error) =>
                  new VectorizerError({
                    message: `Failed to learn document ${document.id}`,
                    cause: error,
                  })
              )
            )
          ),

        /**
         * Learn from multiple documents (batch learning)
         */
        learnDocuments: (documents: Chunk.Chunk<Document>) =>
          withSharedLock(
            Effect.forEach(
              documents,
              (doc) =>
                Effect.gen(function* () {
                  const state = yield* Ref.get(stateRef);

                  // Use existing Core Token data if available, otherwise tokenize
                  const tokens =
                    Chunk.size(doc.tokens) > 0
                      ? extractNormalizedTokens(doc.tokens)
                      : yield* Effect.gen(function* () {
                          const winkDoc = yield* engine.getWinkDoc(doc.text);
                          return winkDoc.tokens().out(its.normal);
                        });

                  state.vectorizer.learn(tokens);

                  // Update state with new document ID
                  yield* Ref.update(stateRef, (s) => ({
                    ...s,
                    documentIds: [...s.documentIds, doc.id],
                  }));
                }).pipe(
                  Effect.mapError(
                    (error) =>
                      new VectorizerError({
                        message: `Failed to learn document ${doc.id}`,
                        cause: error,
                      })
                  )
                ),
              { discard: true }
            )
          ),

        /**
         * Get vector representation of a document
         */
        vectorizeDocument: (document: Document) =>
          withSharedLock(
            Effect.gen(function* () {
              const state = yield* Ref.get(stateRef);

              // Use existing Core Token data if available, otherwise tokenize
              const tokens =
                Chunk.size(document.tokens) > 0
                  ? extractNormalizedTokens(document.tokens)
                  : yield* Effect.gen(function* () {
                      const winkDoc = yield* engine.getWinkDoc(document.text);
                      return winkDoc.tokens().out(its.normal);
                    });

              const vector = state.vectorizer.vectorOf(tokens);
              const terms = state.vectorizer.out(its.terms) as Array<string>;

              return DocumentVector({
                documentId: document.id,
                vector: Chunk.fromIterable(vector),
                terms: Chunk.fromIterable(terms),
              });
            }).pipe(
              Effect.mapError(
                (error) =>
                  new VectorizerError({
                    message: `Failed to vectorize document ${document.id}`,
                    cause: error,
                  })
              )
            )
          ),

        /**
         * Get bag-of-words representation of a document
         */
        getBagOfWords: (document: Document) =>
          withSharedLock(
            Effect.gen(function* () {
              const state = yield* Ref.get(stateRef);

              // Use existing Core Token data if available, otherwise tokenize
              const tokens =
                Chunk.size(document.tokens) > 0
                  ? extractNormalizedTokens(document.tokens)
                  : yield* Effect.gen(function* () {
                      const winkDoc = yield* engine.getWinkDoc(document.text);
                      return winkDoc.tokens().out(its.normal);
                    });

              const bow = state.vectorizer.bowOf(tokens, true); // processOOV = true

              return BagOfWords({
                documentId: document.id,
                bow,
              });
            }).pipe(
              Effect.mapError(
                (error) =>
                  new VectorizerError({
                    message: `Failed to get bag-of-words for document ${document.id}`,
                    cause: error,
                  })
              )
            )
          ),

        /**
         * Get vector for arbitrary text (doesn't need to be a learned document)
         */
        vectorizeText: (text: string, id?: string) =>
          withSharedLock(
            Effect.gen(function* () {
              const state = yield* Ref.get(stateRef);
              const winkDoc = yield* engine.getWinkDoc(text);
              const tokens = winkDoc.tokens().out(its.normal);
              const vector = state.vectorizer.vectorOf(tokens);
              const terms = state.vectorizer.out(its.terms) as Array<string>;

              return DocumentVector({
                documentId: DocumentId.make(id || `text-${Date.now()}`),
                vector: Chunk.fromIterable(vector),
                terms: Chunk.fromIterable(terms),
              });
            }).pipe(
              Effect.mapError(
                (error) =>
                  new VectorizerError({
                    message: "Failed to vectorize text",
                    cause: error,
                  })
              )
            )
          ),

        /**
         * Get corpus statistics after learning
         */
        getCorpusStats: () =>
          withSharedLock(
            Effect.gen(function* () {
              const state = yield* Ref.get(stateRef);
              const terms = state.vectorizer.out(its.terms) as Array<string>;
              const docTermMatrix = state.vectorizer.out(
                its.docTermMatrix
              ) as Array<Array<number>>;
              const idfData = state.vectorizer.out(its.idf) as Array<
                [string, number]
              >;

              const idfValues = Chunk.fromIterable(
                idfData.map(([term, idf]: [string, number]) =>
                  InverseDocumentFrequency({ term, idf })
                )
              );

              return CorpusStats({
                totalDocuments: state.documentIds.length,
                uniqueTerms: Chunk.fromIterable(terms),
                documentTermMatrix: Chunk.fromIterable(
                  docTermMatrix.map((row: Array<number>) =>
                    Chunk.fromIterable(row)
                  )
                ),
                idfValues: idfValues as Chunk.Chunk<InverseDocumentFrequency>,
              });
            }).pipe(
              Effect.mapError(
                (error) =>
                  new VectorizerError({
                    message: "Failed to get corpus statistics",
                    cause: error,
                  })
              )
            )
          ),

        /**
         * Get term frequencies for a specific learned document by index
         */
        getDocumentTermFrequencies: (docIndex: number) =>
          withSharedLock(
            Effect.gen(function* () {
              const state = yield* Ref.get(stateRef);
              const tfData = state.vectorizer.doc(docIndex).out(its.tf);
              return Chunk.fromIterable(
                tfData.map(([term, frequency]: [string, number]) =>
                  TermFrequency({ term, frequency })
                )
              );
            }).pipe(
              Effect.mapError(
                (error) =>
                  new VectorizerError({
                    message: `Failed to get term frequencies for document ${docIndex}`,
                    cause: error,
                  })
              )
            )
          ),

        /**
         * Export model as JSON for saving
         */
        exportModel: () =>
          withSharedLock(
            Effect.gen(function* () {
              const state = yield* Ref.get(stateRef);
              const encodeModel = Schema.encode(Schema.parseJson(Schema.Unknown));
              return yield* encodeModel(state.vectorizer.out(its.modelJSON));
            }).pipe(
              Effect.mapError(
                (error) =>
                  new VectorizerError({
                    message: "Failed to export model",
                    cause: error,
                  })
              )
            )
          ),

        /**
         * Load model from JSON
         */
        loadModel: (modelJson: string) =>
          withSharedLock(
            Effect.gen(function* () {
              const state = yield* Ref.get(stateRef);
              state.vectorizer.loadModel(modelJson);
            }).pipe(
              Effect.mapError(
                (error) =>
                  new VectorizerError({
                    message: "Failed to load model",
                    cause: error,
                  })
              )
            )
          ),

        /**
         * Get current configuration
         */
        getConfig: () => Effect.sync(() => config),

        /**
         * Reset vectorizer (clear all learned data)
         */
        reset: () =>
          withSharedLock(
            Ref.set(stateRef, {
              vectorizer: BM25Vectorizer(config),
              documentIds: [],
              config,
            }).pipe(
              Effect.mapError(
                (error) =>
                  new VectorizerError({
                    message: "Failed to reset vectorizer",
                    cause: error,
                  })
              )
            )
          ),

        /**
         * Run an effect with a fresh, isolated BM25 vectorizer instance.
         * The fresh instance is GC'd after the effect completes — no reset needed.
         * Use this to avoid shared mutable state under concurrent calls.
         */
        withFreshInstance: <A, E, R>(
          f: (isolated: ScopedVectorizer) => Effect.Effect<A, E, R>
        ): Effect.Effect<A, E, R> =>
          Effect.gen(function*() {
            const freshVec = BM25Vectorizer(config);
            const freshDocIds: Array<DocumentId> = [];

            const freshTokens = (
              document: Document
            ): Effect.Effect<Array<string>, VectorizerError> =>
              Chunk.size(document.tokens) > 0
                ? Effect.succeed(extractNormalizedTokens(document.tokens))
                : engine.getWinkDoc(document.text).pipe(
                    Effect.map((winkDoc) => winkDoc.tokens().out(its.normal)),
                    Effect.mapError(
                      (error) =>
                        new VectorizerError({
                          message: `Failed to extract tokens for document ${document.id}`,
                          cause: error,
                        })
                    )
                  );

            const isolated: ScopedVectorizer = {
              learnDocument: (document: Document) =>
                freshTokens(document).pipe(
                  Effect.tap((tokens) =>
                    Effect.sync(() => {
                      freshVec.learn(tokens);
                      freshDocIds.push(document.id);
                    })
                  ),
                  Effect.asVoid
                ),
              vectorizeDocument: (document: Document) =>
                freshTokens(document).pipe(
                  Effect.map((tokens) => {
                    const vector = freshVec.vectorOf(tokens);
                    const terms = freshVec.out(its.terms) as Array<string>;
                    return DocumentVector({
                      documentId: document.id,
                      vector: Chunk.fromIterable(vector),
                      terms: Chunk.fromIterable(terms),
                    });
                  })
                ),
              getDocumentTermFrequencies: (docIndex: number) =>
                Effect.try({
                  try: () => {
                    const tfData = freshVec.doc(docIndex).out(its.tf);
                    return Chunk.fromIterable(
                      tfData.map(([term, frequency]: [string, number]) =>
                        TermFrequency({ term, frequency })
                      )
                    );
                  },
                  catch: (error) =>
                    new VectorizerError({
                      message: `Failed to get term frequencies for document ${docIndex}`,
                      cause: error,
                    }),
                }),
            };

            return yield* f(isolated);
          }),
      };
    }),
    dependencies: [WinkEngine.Default],
  }
) {}

/**
 * Live layer for WinkVectorizer
 */
export const WinkVectorizerLive = WinkVectorizer.Default;

/**
 * Live implementation of WinkVectorizer with custom config
 */
export const WinkVectorizerWithConfig = (_config?: Partial<BM25Config>) =>
  _config === undefined
    ? WinkVectorizer.Default
    : WinkVectorizer.Default.pipe(
        Layer.provide(Layer.succeed(BM25ConfigTag, _config))
      );

/**
 * Data-first convenience functions
 */

export const learnDocument = (document: Document) =>
  Effect.flatMap(WinkVectorizer, (service) => service.learnDocument(document));

export const learnDocuments = (documents: Chunk.Chunk<Document>) =>
  Effect.flatMap(WinkVectorizer, (service) =>
    service.learnDocuments(documents)
  );

export const vectorizeDocument = (document: Document) =>
  Effect.flatMap(WinkVectorizer, (service) =>
    service.vectorizeDocument(document)
  );

export const getBagOfWords = (document: Document) =>
  Effect.flatMap(WinkVectorizer, (service) => service.getBagOfWords(document));

export const vectorizeText = (text: string, id?: string) =>
  Effect.flatMap(WinkVectorizer, (service) => service.vectorizeText(text, id));

export const getCorpusStats = () =>
  Effect.flatMap(WinkVectorizer, (service) => service.getCorpusStats());

export const getDocumentTermFrequencies = (docIndex: number) =>
  Effect.flatMap(WinkVectorizer, (service) =>
    service.getDocumentTermFrequencies(docIndex)
  );

export const exportModel = () =>
  Effect.flatMap(WinkVectorizer, (service) => service.exportModel());

export const loadModel = (modelJson: string) =>
  Effect.flatMap(WinkVectorizer, (service) => service.loadModel(modelJson));

export const resetVectorizer = () =>
  Effect.flatMap(WinkVectorizer, (service) => service.reset());
