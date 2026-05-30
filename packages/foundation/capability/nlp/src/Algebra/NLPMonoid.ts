/**
 * Algebra/NLPMonoid - NLP-specific monoid structures.
 *
 * Defines monoid instances specifically for NLP data structures, building on
 * the general monoid framework in {@link Monoid}. These provide mathematically
 * sound aggregation for:
 * - Tokens (words and their features)
 * - Sentences (sequences of tokens)
 * - Documents (collections of sentences)
 * - Linguistic annotations (POS tags, named entities, etc.)
 *
 * Each monoid satisfies the monoid laws (associativity + left/right identity),
 * except {@link SentenceConcat}, which is a "near-monoid" (identity only) due to
 * punctuation normalization. Laws are verified in test/Algebra/NLPMonoid.test.ts.
 *
 * Ported from the `adjunct` repo (Effect v3) to Effect v4 / `@beep/nlp`. The
 * `BagOfWords` carrier is kept as a native `Map<string, number>` to match the
 * package's existing tool seams; it will be reconciled when `NLPService` merges
 * into the Core tokenization seam.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { dual } from "effect/Function";
import * as Monoid from "./Monoid.ts";

/**
 * Bag-of-words frequency map carrier: term -\> frequency.
 *
 * @example
 * ```ts
 * import type * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
 *
 * const bow: NLPMonoid.BagOfWords = new Map([
 *   ["effect", 2],
 *   ["schema", 1]
 * ])
 *
 * console.log(Array.from(bow.entries()))
 * // [["effect", 2], ["schema", 1]]
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type BagOfWords = Map<string, number>;

// =============================================================================
// Token Monoids
// =============================================================================

/**
 * Token concatenation monoid (join with a space).
 *
 * This is the forgetful functor `Token* -> Text` in the adjunction.
 *
 * @example
 * ```ts
 * import * as Monoid from "@beep/nlp/Algebra/Monoid"
 * import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
 *
 * const text = Monoid.fold(NLPMonoid.TokenConcat)(["effect", "schema", "docs"])
 *
 * console.log(text)
 * // "effect schema docs"
 * ```
 *
 * @since 0.0.0
 * @category combinators
 */
export const TokenConcat: Monoid.Monoid<string> = Monoid.StringJoin(" ");

/**
 * Token bag-of-words monoid (union with frequency addition).
 *
 * A monoid homomorphism from the free monoid `Token*` to the multiset monoid.
 *
 * @example
 * ```ts
 * import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
 *
 * const left = new Map([["effect", 2]])
 * const right = new Map([["effect", 1], ["schema", 1]])
 * const counts = NLPMonoid.TokenBagOfWords.combine(left, right)
 *
 * console.log(Array.from(counts.entries()))
 * // [["effect", 3], ["schema", 1]]
 * ```
 *
 * @since 0.0.0
 * @category combinators
 */
export const TokenBagOfWords: Monoid.Monoid<BagOfWords> = {
  empty: new Map(),
  combine: dual(2, (bow1: BagOfWords, bow2: BagOfWords) => {
    const result = new Map(bow1);
    bow2.forEach((count: number, token: string) => {
      result.set(token, (result.get(token) ?? 0) + count);
    });
    return result;
  }),
};

/**
 * Token set-union monoid (collect unique tokens; useful for vocabulary).
 *
 * @example
 * ```ts
 * import * as Monoid from "@beep/nlp/Algebra/Monoid"
 * import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
 *
 * const vocabulary = Monoid.fold(NLPMonoid.TokenSetUnion)([
 *   new Set(["effect", "schema"]),
 *   new Set(["schema", "docs"])
 * ])
 *
 * console.log(Array.from(vocabulary).sort())
 * // ["docs", "effect", "schema"]
 * ```
 *
 * @since 0.0.0
 * @category combinators
 */
export const TokenSetUnion: Monoid.Monoid<ReadonlySet<string>> = Monoid.SetUnion<string>();

// =============================================================================
// Sentence Monoids
// =============================================================================

/**
 * Sentence concatenation "near-monoid".
 *
 * Combines sentences with a space and ensures the left sentence ends with
 * terminal punctuation. NOTE: this satisfies the identity laws but NOT strict
 * associativity (punctuation normalization is not associative), so it is a
 * pragmatic near-monoid for text joining.
 *
 * @example
 * ```ts
 * import * as Monoid from "@beep/nlp/Algebra/Monoid"
 * import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
 *
 * const paragraph = Monoid.fold(NLPMonoid.SentenceConcat)(["Effect parses text", "Schemas validate output"])
 *
 * console.log(paragraph)
 * // "Effect parses text. Schemas validate output"
 * ```
 *
 * @since 0.0.0
 * @category combinators
 */
export const SentenceConcat: Monoid.Monoid<string> = {
  empty: "",
  combine: dual(2, (s1, s2) => {
    if (s1 === "") return s2;
    if (s2 === "") return s1;
    const s1Normalized = /[.!?]$/.test(s1) ? s1 : `${s1}.`;
    return `${s1Normalized} ${s2}`;
  }),
};

/**
 * Sentence array monoid (concatenation; preserves order and boundaries).
 *
 * @example
 * ```ts
 * import * as Monoid from "@beep/nlp/Algebra/Monoid"
 * import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
 *
 * const sentences = Monoid.fold(NLPMonoid.SentenceArray)([
 *   ["First sentence."],
 *   ["Second sentence.", "Third sentence."]
 * ])
 *
 * console.log(sentences)
 * // ["First sentence.", "Second sentence.", "Third sentence."]
 * ```
 *
 * @since 0.0.0
 * @category combinators
 */
export const SentenceArray: Monoid.Monoid<ReadonlyArray<string>> = Monoid.ArrayConcat<string>();

// =============================================================================
// Document Monoids
// =============================================================================

/**
 * Document text monoid (join paragraphs with a blank line).
 *
 * @example
 * ```ts
 * import * as Monoid from "@beep/nlp/Algebra/Monoid"
 * import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
 *
 * const document = Monoid.fold(NLPMonoid.DocumentText)(["Intro paragraph.", "Details paragraph."])
 *
 * console.log(document)
 * // "Intro paragraph.\n\nDetails paragraph."
 * ```
 *
 * @since 0.0.0
 * @category combinators
 */
export const DocumentText: Monoid.Monoid<string> = Monoid.StringJoin("\n\n");

/**
 * Document statistics carrier.
 *
 * @example
 * ```ts
 * import type * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
 *
 * const stats: NLPMonoid.DocumentStatistics = {
 *   charCount: 42,
 *   sentenceCount: 2,
 *   wordCount: 7
 * }
 *
 * console.log(stats.wordCount)
 * // 7
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export interface DocumentStatistics {
  readonly charCount: number;
  readonly sentenceCount: number;
  readonly wordCount: number;
}

/**
 * Document statistics monoid (sum counts component-wise).
 *
 * @example
 * ```ts
 * import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
 *
 * const totals = NLPMonoid.DocumentStats.combine(
 *   { charCount: 12, sentenceCount: 1, wordCount: 3 },
 *   { charCount: 18, sentenceCount: 2, wordCount: 4 }
 * )
 *
 * console.log(totals)
 * // { wordCount: 7, sentenceCount: 3, charCount: 30 }
 * ```
 *
 * @since 0.0.0
 * @category combinators
 */
export const DocumentStats: Monoid.Monoid<DocumentStatistics> = {
  empty: { wordCount: 0, sentenceCount: 0, charCount: 0 },
  combine: dual(2, (s1, s2) => ({
    wordCount: s1.wordCount + s2.wordCount,
    sentenceCount: s1.sentenceCount + s2.sentenceCount,
    charCount: s1.charCount + s2.charCount,
  })),
};

// =============================================================================
// Linguistic Feature Monoids
// =============================================================================

/**
 * Linguistic annotation monoid (left-biased map merge).
 *
 * On key conflict the first (left) value wins. Useful for combining POS tags,
 * NER labels, dependency parses, etc. keyed by position.
 *
 * @example
 * ```ts
 * import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
 *
 * const Tags = NLPMonoid.AnnotationMap<number, string>()
 * const tags = Tags.combine(new Map([[0, "NOUN"]]), new Map([[0, "PROPN"], [1, "VERB"]]))
 *
 * console.log(Array.from(tags.entries()))
 * // [[0, "NOUN"], [1, "VERB"]]
 * ```
 *
 * @since 0.0.0
 * @category combinators
 */
export const AnnotationMap = <K, V>(): Monoid.Monoid<Map<K, V>> => ({
  empty: new Map(),
  combine: dual(2, (m1, m2) => {
    const result = new Map(m1);
    m2.forEach((value: V, key: K) => {
      if (!result.has(key)) {
        result.set(key, value);
      }
    });
    return result;
  }),
});

/**
 * Named entity carrier.
 *
 * @example
 * ```ts
 * import type * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
 *
 * const entity: NLPMonoid.NamedEntity = {
 *   endPos: 13,
 *   startPos: 0,
 *   text: "Effect Schema",
 *   type: "PRODUCT"
 * }
 *
 * console.log(entity.type)
 * // "PRODUCT"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export interface NamedEntity {
  readonly endPos: number;
  readonly startPos: number;
  readonly text: string;
  readonly type: string;
}

/**
 * Named entity list monoid (concatenation; preserves order, allows duplicates).
 *
 * @example
 * ```ts
 * import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
 *
 * const entities = NLPMonoid.NamedEntityList.combine(
 *   [{ endPos: 6, startPos: 0, text: "Effect", type: "LIBRARY" }],
 *   [{ endPos: 19, startPos: 7, text: "Schema", type: "MODULE" }]
 * )
 *
 * console.log(entities.map((entity) => entity.text))
 * // ["Effect", "Schema"]
 * ```
 *
 * @since 0.0.0
 * @category combinators
 */
export const NamedEntityList: Monoid.Monoid<ReadonlyArray<NamedEntity>> = Monoid.ArrayConcat<NamedEntity>();

/**
 * Dependency parse edge carrier: a syntactic dependency (head, dependent, relation).
 *
 * @example
 * ```ts
 * import type * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
 *
 * const edge: NLPMonoid.DependencyEdge = {
 *   dependent: 2,
 *   head: 1,
 *   relation: "amod"
 * }
 *
 * console.log(edge.relation)
 * // "amod"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export interface DependencyEdge {
  readonly dependent: number;
  readonly head: number;
  readonly relation: string;
}

/**
 * Dependency parse monoid (concatenate edges).
 *
 * @example
 * ```ts
 * import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
 *
 * const edges = NLPMonoid.DependencyParse.combine(
 *   [{ dependent: 1, head: 0, relation: "nsubj" }],
 *   [{ dependent: 2, head: 0, relation: "obj" }]
 * )
 *
 * console.log(edges.map((edge) => edge.relation))
 * // ["nsubj", "obj"]
 * ```
 *
 * @since 0.0.0
 * @category combinators
 */
export const DependencyParse: Monoid.Monoid<ReadonlyArray<DependencyEdge>> = Monoid.ArrayConcat<DependencyEdge>();

// =============================================================================
// Corpus Monoids (for large-scale text collections)
// =============================================================================

/**
 * Term frequency monoid (alias of {@link TokenBagOfWords}; semantic distinction).
 *
 * @example
 * ```ts
 * import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
 *
 * const termCounts = NLPMonoid.TermFrequency.combine(
 *   new Map([["effect", 1]]),
 *   new Map([["effect", 2], ["docs", 1]])
 * )
 *
 * console.log(Array.from(termCounts.entries()))
 * // [["effect", 3], ["docs", 1]]
 * ```
 *
 * @since 0.0.0
 * @category combinators
 */
export const TermFrequency: Monoid.Monoid<BagOfWords> = TokenBagOfWords;

/**
 * Document frequency monoid (counts presence across documents; union with addition).
 *
 * @example
 * ```ts
 * import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
 *
 * const frequencies = NLPMonoid.DocumentFrequency.combine(
 *   new Map([["effect", 2], ["schema", 1]]),
 *   new Map([["effect", 1], ["nlp", 1]])
 * )
 *
 * console.log(Array.from(frequencies.entries()))
 * // [["effect", 3], ["schema", 1], ["nlp", 1]]
 * ```
 *
 * @since 0.0.0
 * @category combinators
 */
export const DocumentFrequency: Monoid.Monoid<Map<string, number>> = {
  empty: new Map(),
  combine: dual(2, (df1: Map<string, number>, df2: Map<string, number>) => {
    const result = new Map(df1);
    df2.forEach((count, term) => {
      result.set(term, (result.get(term) ?? 0) + count);
    });
    return result;
  }),
};

/**
 * Vocabulary monoid (unique terms; alias of {@link TokenSetUnion}).
 *
 * @example
 * ```ts
 * import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
 *
 * const vocabulary = NLPMonoid.Vocabulary.combine(
 *   new Set(["effect", "schema"]),
 *   new Set(["schema", "nlp"])
 * )
 *
 * console.log(Array.from(vocabulary).sort())
 * // ["effect", "nlp", "schema"]
 * ```
 *
 * @since 0.0.0
 * @category combinators
 */
export const Vocabulary: Monoid.Monoid<ReadonlySet<string>> = TokenSetUnion;

// =============================================================================
// Specialized Aggregation Monoids
// =============================================================================

/**
 * Weighted token monoid (combine weights additively per token).
 *
 * @example
 * ```ts
 * import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
 *
 * const weights = NLPMonoid.WeightedTokens.combine(
 *   new Map([["effect", 0.4], ["schema", 0.8]]),
 *   new Map([["effect", 0.3]])
 * )
 *
 * console.log(Array.from(weights.entries()))
 * // [["effect", 0.7], ["schema", 0.8]]
 * ```
 *
 * @since 0.0.0
 * @category combinators
 */
export const WeightedTokens: Monoid.Monoid<Map<string, number>> = {
  empty: new Map(),
  combine: dual(2, (wt1: Map<string, number>, wt2: Map<string, number>) => {
    const result = new Map(wt1);
    wt2.forEach((weight, token) => {
      result.set(token, (result.get(token) ?? 0) + weight);
    });
    return result;
  }),
};

/**
 * N-gram frequency monoid (bag-of-words over space-joined n-gram keys).
 *
 * @example
 * ```ts
 * import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
 *
 * const ngrams = NLPMonoid.NGramFrequency.combine(
 *   new Map([["effect schema", 2]]),
 *   new Map([["effect schema", 1], ["schema docs", 1]])
 * )
 *
 * console.log(Array.from(ngrams.entries()))
 * // [["effect schema", 3], ["schema docs", 1]]
 * ```
 *
 * @since 0.0.0
 * @category combinators
 */
export const NGramFrequency: Monoid.Monoid<Map<string, number>> = {
  empty: new Map(),
  combine: dual(2, (ng1: Map<string, number>, ng2: Map<string, number>) => {
    const result = new Map(ng1);
    ng2.forEach((count, ngram) => {
      result.set(ngram, (result.get(ngram) ?? 0) + count);
    });
    return result;
  }),
};

// =============================================================================
// Composite Monoids for Multi-Feature Analysis
// =============================================================================

/**
 * Combined text analysis carrier (bag-of-words + entities + sentence count + vocabulary).
 *
 * @example
 * ```ts
 * import type * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
 *
 * const analysis: NLPMonoid.TextAnalysis = {
 *   bow: new Map([["effect", 2]]),
 *   entities: [{ endPos: 6, startPos: 0, text: "Effect", type: "LIBRARY" }],
 *   sentenceCount: 1,
 *   vocabulary: new Set(["effect"])
 * }
 *
 * console.log(analysis.sentenceCount)
 * // 1
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export interface TextAnalysis {
  readonly bow: BagOfWords;
  readonly entities: ReadonlyArray<NamedEntity>;
  readonly sentenceCount: number;
  readonly vocabulary: ReadonlySet<string>;
}

/**
 * Text analysis monoid (product monoid over the linguistic features).
 *
 * @example
 * ```ts
 * import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
 *
 * const combined = NLPMonoid.TextAnalysisMonoid.combine(
 *   {
 *     bow: new Map([["effect", 1]]),
 *     entities: [{ endPos: 6, startPos: 0, text: "Effect", type: "LIBRARY" }],
 *     sentenceCount: 1,
 *     vocabulary: new Set(["effect"])
 *   },
 *   {
 *     bow: new Map([["schema", 2]]),
 *     entities: [],
 *     sentenceCount: 2,
 *     vocabulary: new Set(["schema"])
 *   }
 * )
 *
 * console.log({
 *   bow: Array.from(combined.bow.entries()),
 *   sentenceCount: combined.sentenceCount,
 *   vocabulary: Array.from(combined.vocabulary).sort()
 * })
 * // { bow: [["effect", 1], ["schema", 2]], sentenceCount: 3, vocabulary: ["effect", "schema"] }
 * ```
 *
 * @since 0.0.0
 * @category combinators
 */
export const TextAnalysisMonoid: Monoid.Monoid<TextAnalysis> = {
  empty: {
    bow: new Map(),
    entities: [],
    sentenceCount: 0,
    vocabulary: new Set(),
  },
  combine: dual(2, (a1, a2) => ({
    bow: TokenBagOfWords.combine(a1.bow, a2.bow),
    entities: NamedEntityList.combine(a1.entities, a2.entities),
    sentenceCount: a1.sentenceCount + a2.sentenceCount,
    vocabulary: TokenSetUnion.combine(a1.vocabulary, a2.vocabulary),
  })),
};

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Convert a bag of words to term frequency (each count normalized by the total).
 *
 * @example
 * ```ts
 * import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
 *
 * const tf = NLPMonoid.bagOfWordsToTF(new Map([["effect", 3], ["schema", 1]]))
 *
 * console.log(Array.from(tf.entries()))
 * // [["effect", 0.75], ["schema", 0.25]]
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const bagOfWordsToTF = (bow: BagOfWords): Map<string, number> => {
  let total = 0;
  bow.forEach((count) => {
    total += count;
  });
  if (total === 0) return new Map();

  const tf = new Map<string, number>();
  bow.forEach((count, term) => {
    tf.set(term, count / total);
  });
  return tf;
};

/**
 * Compute TF-IDF scores from term frequency and document frequency.
 *
 * `TF-IDF(t, d) = TF(t, d) * log(N / DF(t))`.
 *
 * @example
 * ```ts
 * import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
 *
 * const scores = NLPMonoid.computeTFIDF(
 *   new Map([["effect", 0.5], ["schema", 0.5]]),
 *   new Map([["effect", 2], ["schema", 1]]),
 *   4
 * )
 *
 * console.log(Array.from(scores.entries()))
 * // [["effect", 0.34657359027997264], ["schema", 0.6931471805599453]]
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const computeTFIDF = (
  tf: Map<string, number>,
  df: Map<string, number>,
  totalDocs: number
): Map<string, number> => {
  const tfidf = new Map<string, number>();
  tf.forEach((tfScore, term) => {
    const docFreq = df.get(term) ?? 1;
    const idf = Math.log(totalDocs / docFreq);
    tfidf.set(term, tfScore * idf);
  });
  return tfidf;
};

// =============================================================================
// Convenience aggregators
// =============================================================================

/**
 * Aggregate tokens into a bag of words.
 *
 * @example
 * ```ts
 * import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
 *
 * const counts = NLPMonoid.aggregateTokens(["effect", "schema", "effect"])
 *
 * console.log(Array.from(counts.entries()))
 * // [["effect", 2], ["schema", 1]]
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const aggregateTokens = (tokens: ReadonlyArray<string>): BagOfWords =>
  Monoid.fold(TokenBagOfWords)(
    tokens.map((token) => {
      const bow: BagOfWords = new Map();
      bow.set(token, 1);
      return bow;
    })
  );

/**
 * Aggregate sentences into a single document string.
 *
 * @example
 * ```ts
 * import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
 *
 * const text = NLPMonoid.aggregateSentences(["Effect parses text", "Schemas validate output"])
 *
 * console.log(text)
 * // "Effect parses text. Schemas validate output"
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const aggregateSentences = (sentences: ReadonlyArray<string>): string => Monoid.fold(SentenceConcat)(sentences);

/**
 * Aggregate document statistics.
 *
 * @example
 * ```ts
 * import * as NLPMonoid from "@beep/nlp/Algebra/NLPMonoid"
 *
 * const totals = NLPMonoid.aggregateStats([
 *   { charCount: 10, sentenceCount: 1, wordCount: 2 },
 *   { charCount: 25, sentenceCount: 2, wordCount: 5 }
 * ])
 *
 * console.log(totals)
 * // { wordCount: 7, sentenceCount: 3, charCount: 35 }
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const aggregateStats = (stats: ReadonlyArray<DocumentStatistics>): DocumentStatistics =>
  Monoid.fold(DocumentStats)(stats);
