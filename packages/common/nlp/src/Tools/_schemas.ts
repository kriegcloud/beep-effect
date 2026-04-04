/**
 * AI-facing output models for NLP tools.
 *
 * @since 0.0.0
 * @module @beep/nlp/Tools/_schemas
 */

import { $NlpId } from "@beep/identity";
import { LiteralKit, SchemaUtils } from "@beep/schema";
import * as S from "effect/Schema";
import { BM25Norm } from "../Wink/WinkVectorizer.ts";

const $I = $NlpId.create("Tools/_schemas");

const describe = <Schema extends S.Top>(
  schema: Schema,
  description: string,
  extras?: Record<string, unknown>
): Schema["~rebuild.out"] => schema.annotateKey({ description, ...(extras ?? {}) });

const AiEntitySourceKit = LiteralKit(["builtin", "custom"] as const);
const AiPhoneticAlgorithmKit = LiteralKit(["soundex", "phonetize"] as const);

const AiEntitySource = AiEntitySourceKit.pipe(
  $I.annoteSchema("AiEntitySource", {
    description: "Source used to extract a named entity.",
  }),
  SchemaUtils.withLiteralKitStatics(AiEntitySourceKit)
);

const AiPhoneticAlgorithm = AiPhoneticAlgorithmKit.pipe(
  $I.annoteSchema("AiPhoneticAlgorithm", {
    description: "Phonetic encoding algorithm used to compare text.",
  }),
  SchemaUtils.withLiteralKitStatics(AiPhoneticAlgorithmKit)
);

/**
 * Flat token model for tool outputs.
 *
 * @since 0.0.0
 * @category ToolSchemas
 */
export class AiToken extends S.Class<AiToken>($I`AiToken`)(
  {
    end: describe(S.Number, "Character offset where the token ends in the source text."),
    isPunctuation: describe(S.Boolean, "Whether the token represents punctuation."),
    isStopWord: describe(S.Boolean, "Whether the token is a common stop word."),
    lemma: describe(S.String, "Base or dictionary form of the token."),
    pos: describe(S.String, "Part-of-speech tag such as NOUN, VERB, or ADJ.", {
      examples: ["NOUN", "VERB", "ADJ", "DET", "ADP"],
    }),
    start: describe(S.Number, "Character offset where the token begins in the source text."),
    stem: describe(S.String, "Stemmed form of the token."),
    text: describe(S.String, "The token text as it appears in the source input."),
  },
  $I.annote("AiToken", {
    description: "A linguistic token with POS, lemma, stemming, and character offsets.",
  })
) {}

/**
 * Flat sentence model for tool outputs.
 *
 * @since 0.0.0
 * @category ToolSchemas
 */
export class AiSentence extends S.Class<AiSentence>($I`AiSentence`)(
  {
    end: describe(S.Number, "Character offset where the sentence ends."),
    index: describe(S.Number, "Zero-based sentence index in the document."),
    start: describe(S.Number, "Character offset where the sentence begins."),
    text: describe(S.String, "The sentence text."),
    tokenCount: describe(S.Number, "Number of tokens contained in the sentence."),
  },
  $I.annote("AiSentence", {
    description: "A sentence with token count and character positions.",
  })
) {}

/**
 * Flat keyword model for tool outputs.
 *
 * @since 0.0.0
 * @category ToolSchemas
 */
export class AiKeyword extends S.Class<AiKeyword>($I`AiKeyword`)(
  {
    score: describe(S.Number, "Keyword importance score."),
    term: describe(S.String, "The extracted keyword term."),
  },
  $I.annote("AiKeyword", {
    description: "A keyword term paired with its ranking score.",
  })
) {}

/**
 * Flat document-stats model for tool outputs.
 *
 * @since 0.0.0
 * @category ToolSchemas
 */
export class AiDocumentStats extends S.Class<AiDocumentStats>($I`AiDocumentStats`)(
  {
    avgSentenceLength: describe(S.Number, "Average number of word-like tokens per sentence."),
    charCount: describe(S.Number, "Character count of the input text."),
    sentenceCount: describe(S.Number, "Number of detected sentences."),
    wordCount: describe(S.Number, "Approximate count of word-like tokens excluding punctuation."),
  },
  $I.annote("AiDocumentStats", {
    description: "High-level statistics describing a text document.",
  })
) {}

/**
 * Flat sentence-chunk model for tool outputs.
 *
 * @since 0.0.0
 * @category ToolSchemas
 */
export class AiSentenceChunk extends S.Class<AiSentenceChunk>($I`AiSentenceChunk`)(
  {
    charCount: describe(S.Number, "Character count of the chunk."),
    endSentenceIndex: describe(S.Number, "Inclusive sentence index where the chunk ends."),
    sentenceCount: describe(S.Number, "Number of sentences in the chunk."),
    startSentenceIndex: describe(S.Number, "Inclusive sentence index where the chunk starts."),
    text: describe(S.String, "Chunk text built from one or more complete sentences."),
  },
  $I.annote("AiSentenceChunk", {
    description: "A sentence-aligned chunk of text with boundary metadata.",
  })
) {}

/**
 * Flat ranked-text model for tool outputs.
 *
 * @since 0.0.0
 * @category ToolSchemas
 */
export class AiRankedText extends S.Class<AiRankedText>($I`AiRankedText`)(
  {
    index: describe(S.Number, "Index of the original input text in the candidate array."),
    score: describe(S.Number, "Relevance score where higher means more relevant."),
  },
  $I.annote("AiRankedText", {
    description: "A ranked candidate entry for query-to-text relevance scoring.",
  })
) {}

/**
 * Flat entity model for tool outputs.
 *
 * @since 0.0.0
 * @category ToolSchemas
 */
export class AiEntity extends S.Class<AiEntity>($I`AiEntity`)(
  {
    end: describe(S.Number, "Character offset where the entity ends."),
    endTokenIndex: describe(S.Number, "Inclusive token index where the entity ends."),
    source: describe(S.optionalKey(AiEntitySource), "Whether the entity came from built-in or custom matching."),
    start: describe(S.Number, "Character offset where the entity begins."),
    startTokenIndex: describe(S.Number, "Inclusive token index where the entity begins."),
    type: describe(S.String, "Entity type label such as DATE, MONEY, EMAIL, or URL."),
    value: describe(S.String, "The extracted entity text."),
  },
  $I.annote("AiEntity", {
    description: "A named entity with offsets, token boundaries, and extraction source.",
  })
) {}

/**
 * Flat n-gram model for tool outputs.
 *
 * @since 0.0.0
 * @category ToolSchemas
 */
export class AiNGram extends S.Class<AiNGram>($I`AiNGram`)(
  {
    count: describe(S.Number, "Number of occurrences for the n-gram."),
    value: describe(S.String, "The n-gram string value."),
  },
  $I.annote("AiNGram", {
    description: "An n-gram value paired with its frequency count.",
  })
) {}

/**
 * Flat phonetic-match model for tool outputs.
 *
 * @since 0.0.0
 * @category ToolSchemas
 */
export class AiPhoneticMatch extends S.Class<AiPhoneticMatch>($I`AiPhoneticMatch`)(
  {
    algorithm: describe(AiPhoneticAlgorithm, "The phonetic encoding algorithm that was used."),
    leftCodes: describe(S.Array(S.String), "Sorted unique phonetic codes derived from the first text."),
    rightCodes: describe(S.Array(S.String), "Sorted unique phonetic codes derived from the second text."),
    score: describe(S.Number, "Jaccard overlap score over unique phonetic codes."),
    sharedCodes: describe(S.Array(S.String), "Sorted phonetic codes that appear in both texts."),
  },
  $I.annote("AiPhoneticMatch", {
    description: "Phonetic overlap details for two texts.",
  })
) {}

/**
 * BM25 corpus configuration model for tool outputs.
 *
 * @since 0.0.0
 * @category ToolSchemas
 */
export class AiCorpusConfig extends S.Class<AiCorpusConfig>($I`AiCorpusConfig`)(
  {
    b: describe(S.Number, "BM25 document length normalization parameter."),
    k: describe(S.Number, "BM25 inverse-document-frequency saturation parameter."),
    k1: describe(S.Number, "BM25 term-frequency saturation parameter."),
    norm: describe(BM25Norm, "Vector normalization mode applied by the BM25 corpus."),
  },
  $I.annote("AiCorpusConfig", {
    description: "Resolved BM25 configuration values for a managed corpus.",
  })
) {}

/**
 * Corpus summary model for tool outputs.
 *
 * @since 0.0.0
 * @category ToolSchemas
 */
export class AiCorpusSummary extends S.Class<AiCorpusSummary>($I`AiCorpusSummary`)(
  {
    config: AiCorpusConfig,
    corpusId: describe(S.String, "Stable corpus identifier."),
    createdAtMs: describe(S.Number, "Unix epoch timestamp in milliseconds when the corpus was created."),
    documentCount: describe(S.Number, "Number of learned documents currently in the corpus."),
    vocabularySize: describe(S.Number, "Number of unique normalized terms across the corpus."),
  },
  $I.annote("AiCorpusSummary", {
    description: "Summary information describing a managed BM25 corpus session.",
  })
) {}

/**
 * Ranked corpus document model for tool outputs.
 *
 * @since 0.0.0
 * @category ToolSchemas
 */
export class AiCorpusRankedDocument extends S.Class<AiCorpusRankedDocument>($I`AiCorpusRankedDocument`)(
  {
    id: describe(S.String, "Document identifier."),
    index: describe(S.Number, "Zero-based index of the learned document inside the corpus."),
    score: describe(S.Number, "Similarity score assigned to the document."),
    text: describe(S.optionalKey(S.String), "Source document text when the caller requested text inclusion."),
  },
  $I.annote("AiCorpusRankedDocument", {
    description: "A ranked document returned from a corpus query.",
  })
) {}

/**
 * Corpus IDF value model for tool outputs.
 *
 * @since 0.0.0
 * @category ToolSchemas
 */
export class AiCorpusIdf extends S.Class<AiCorpusIdf>($I`AiCorpusIdf`)(
  {
    idf: describe(S.Number, "Inverse document frequency value for the term."),
    term: describe(S.String, "Corpus term associated with the IDF value."),
  },
  $I.annote("AiCorpusIdf", {
    description: "An inverse document frequency entry for a corpus term.",
  })
) {}

/**
 * Corpus matrix-shape model for tool outputs.
 *
 * @since 0.0.0
 * @category ToolSchemas
 */
export class AiCorpusMatrixShape extends S.Class<AiCorpusMatrixShape>($I`AiCorpusMatrixShape`)(
  {
    cols: describe(S.Number, "Number of columns in the document-term matrix."),
    rows: describe(S.Number, "Number of rows in the document-term matrix."),
  },
  $I.annote("AiCorpusMatrixShape", {
    description: "Shape metadata for the optional document-term matrix.",
  })
) {}

/**
 * Corpus stats model for tool outputs.
 *
 * @since 0.0.0
 * @category ToolSchemas
 */
export class AiCorpusStats extends S.Class<AiCorpusStats>($I`AiCorpusStats`)(
  {
    averageDocumentLength: describe(S.Number, "Average normalized token count per learned document."),
    corpusId: describe(S.String, "Stable corpus identifier."),
    documentTermMatrix: describe(
      S.Array(S.Number).pipe(S.Array),
      "Optional document-term matrix, one row per learned document."
    ),
    idfValues: describe(S.Array(AiCorpusIdf), "Optional IDF values sorted by descending score."),
    matrixShape: AiCorpusMatrixShape,
    terms: describe(S.Array(S.String), "Learned corpus vocabulary terms in vector order."),
    totalDocuments: describe(S.Number, "Number of learned documents currently in the corpus."),
    vocabularySize: describe(S.Number, "Number of unique normalized terms across the corpus."),
  },
  $I.annote("AiCorpusStats", {
    description: "Detailed statistics for a managed corpus session.",
  })
) {}
