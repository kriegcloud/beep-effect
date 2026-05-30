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
 * @since 0.0.0
 * @category combinators
 */
export const TokenConcat: Monoid.Monoid<string> = Monoid.StringJoin(" ");

/**
 * Token bag-of-words monoid (union with frequency addition).
 *
 * A monoid homomorphism from the free monoid `Token*` to the multiset monoid.
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
 * @since 0.0.0
 * @category combinators
 */
export const DocumentText: Monoid.Monoid<string> = Monoid.StringJoin("\n\n");

/**
 * Document statistics carrier.
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
 * @since 0.0.0
 * @category combinators
 */
export const NamedEntityList: Monoid.Monoid<ReadonlyArray<NamedEntity>> = Monoid.ArrayConcat<NamedEntity>();

/**
 * Dependency parse edge carrier: a syntactic dependency (head, dependent, relation).
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
 * @since 0.0.0
 * @category combinators
 */
export const TermFrequency: Monoid.Monoid<BagOfWords> = TokenBagOfWords;

/**
 * Document frequency monoid (counts presence across documents; union with addition).
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
 * @since 0.0.0
 * @category utilities
 */
export const aggregateSentences = (sentences: ReadonlyArray<string>): string => Monoid.fold(SentenceConcat)(sentences);

/**
 * Aggregate document statistics.
 *
 * @since 0.0.0
 * @category utilities
 */
export const aggregateStats = (stats: ReadonlyArray<DocumentStatistics>): DocumentStatistics =>
  Monoid.fold(DocumentStats)(stats);
