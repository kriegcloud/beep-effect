/**
 * NLP AI tools.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import {
  AiAnalysis as AiAnalysisSource,
  AiCorpusConfig as AiCorpusConfigSource,
  AiCorpusIdf as AiCorpusIdfSource,
  AiCorpusMatrixShape as AiCorpusMatrixShapeSource,
  AiCorpusRankedDocument as AiCorpusRankedDocumentSource,
  AiCorpusStats as AiCorpusStatsSource,
  AiCorpusSummary as AiCorpusSummarySource,
  AiDocumentStats as AiDocumentStatsSource,
  AiEntity as AiEntitySource,
  AiKeyword as AiKeywordSource,
  AiNGram as AiNGramSource,
  AiPhoneticMatch as AiPhoneticMatchSource,
  AiRankedText as AiRankedTextSource,
  AiSentenceChunk as AiSentenceChunkSource,
  AiSentence as AiSentenceSource,
  AiToken as AiTokenSource,
  AiToolError as AiToolErrorSource,
} from "./_schemas.ts";
import { Analyze as AnalyzeSource } from "./Analyze.ts";
import { BagOfWords as BagOfWordsSource } from "./BagOfWords.ts";
import { BowCosineSimilarity as BowCosineSimilaritySource } from "./BowCosineSimilarity.ts";
import { ChunkBySentences as ChunkBySentencesSource } from "./ChunkBySentences.ts";
import { CorpusStats as CorpusStatsSource } from "./CorpusStats.ts";
import { CreateCorpus as CreateCorpusSource } from "./CreateCorpus.ts";
import { DeleteCorpus as DeleteCorpusSource } from "./DeleteCorpus.ts";
import { DocumentStats as DocumentStatsSource } from "./DocumentStats.ts";
import { ExtractEntities as ExtractEntitiesSource } from "./ExtractEntities.ts";
import { ExtractKeywords as ExtractKeywordsSource } from "./ExtractKeywords.ts";
import { LearnCorpus as LearnCorpusSource } from "./LearnCorpus.ts";
import { LearnCustomEntities as LearnCustomEntitiesSource } from "./LearnCustomEntities.ts";
import { NGrams as NGramsSource } from "./NGrams.ts";
import { NlpToolkit as NlpToolkitSource, NlpTools as NlpToolsSource } from "./NlpToolkit.ts";
import { Paragraphize as ParagraphizeSource } from "./Paragraphize.ts";
import { PhoneticMatch as PhoneticMatchSource } from "./PhoneticMatch.ts";
import { QueryCorpus as QueryCorpusSource } from "./QueryCorpus.ts";
import { RankByRelevance as RankByRelevanceSource } from "./RankByRelevance.ts";
import { RemoveStopWords as RemoveStopWordsSource } from "./RemoveStopWords.ts";
import { Sentences as SentencesSource } from "./Sentences.ts";
import { Stem as StemSource } from "./Stem.ts";
import { TextSimilarity as TextSimilaritySource } from "./TextSimilarity.ts";
import { Tokenize as TokenizeSource } from "./Tokenize.ts";
import { exportTools as exportToolsSource } from "./ToolExport.ts";
import { TransformText as TransformTextSource } from "./TransformText.ts";
import { TverskySimilarity as TverskySimilaritySource } from "./TverskySimilarity.ts";
import { WordCount as WordCountSource } from "./WordCount.ts";

/**
 * Ai analysis tool schema.
 *
 * @example
 * ```ts
 * import { AiAnalysis } from "@beep/nlp-processing/Tools"
 *
 * console.log(AiAnalysis)
 * ```
 *
 * @since 0.0.0
 * @category tool-schemas
 */
export const AiAnalysis = AiAnalysisSource;
/**
 * Ai corpus config tool schema.
 *
 * @example
 * ```ts
 * import { AiCorpusConfig } from "@beep/nlp-processing/Tools"
 *
 * console.log(AiCorpusConfig)
 * ```
 *
 * @since 0.0.0
 * @category tool-schemas
 */
export const AiCorpusConfig = AiCorpusConfigSource;
/**
 * Ai corpus idf tool schema.
 *
 * @example
 * ```ts
 * import { AiCorpusIdf } from "@beep/nlp-processing/Tools"
 *
 * console.log(AiCorpusIdf)
 * ```
 *
 * @since 0.0.0
 * @category tool-schemas
 */
export const AiCorpusIdf = AiCorpusIdfSource;
/**
 * Ai corpus matrix shape tool schema.
 *
 * @example
 * ```ts
 * import { AiCorpusMatrixShape } from "@beep/nlp-processing/Tools"
 *
 * console.log(AiCorpusMatrixShape)
 * ```
 *
 * @since 0.0.0
 * @category tool-schemas
 */
export const AiCorpusMatrixShape = AiCorpusMatrixShapeSource;
/**
 * Ai corpus ranked document tool schema.
 *
 * @example
 * ```ts
 * import { AiCorpusRankedDocument } from "@beep/nlp-processing/Tools"
 *
 * console.log(AiCorpusRankedDocument)
 * ```
 *
 * @since 0.0.0
 * @category tool-schemas
 */
export const AiCorpusRankedDocument = AiCorpusRankedDocumentSource;
/**
 * Ai corpus stats tool schema.
 *
 * @example
 * ```ts
 * import { AiCorpusStats } from "@beep/nlp-processing/Tools"
 *
 * console.log(AiCorpusStats)
 * ```
 *
 * @since 0.0.0
 * @category tool-schemas
 */
export const AiCorpusStats = AiCorpusStatsSource;
/**
 * Ai corpus summary tool schema.
 *
 * @example
 * ```ts
 * import { AiCorpusSummary } from "@beep/nlp-processing/Tools"
 *
 * console.log(AiCorpusSummary)
 * ```
 *
 * @since 0.0.0
 * @category tool-schemas
 */
export const AiCorpusSummary = AiCorpusSummarySource;
/**
 * Ai document stats tool schema.
 *
 * @example
 * ```ts
 * import { AiDocumentStats } from "@beep/nlp-processing/Tools"
 *
 * console.log(AiDocumentStats)
 * ```
 *
 * @since 0.0.0
 * @category tool-schemas
 */
export const AiDocumentStats = AiDocumentStatsSource;
/**
 * Ai entity tool schema.
 *
 * @example
 * ```ts
 * import { AiEntity } from "@beep/nlp-processing/Tools"
 *
 * console.log(AiEntity)
 * ```
 *
 * @since 0.0.0
 * @category tool-schemas
 */
export const AiEntity = AiEntitySource;
/**
 * Ai keyword tool schema.
 *
 * @example
 * ```ts
 * import { AiKeyword } from "@beep/nlp-processing/Tools"
 *
 * console.log(AiKeyword)
 * ```
 *
 * @since 0.0.0
 * @category tool-schemas
 */
export const AiKeyword = AiKeywordSource;
/**
 * Ai n gram tool schema.
 *
 * @example
 * ```ts
 * import { AiNGram } from "@beep/nlp-processing/Tools"
 *
 * console.log(AiNGram)
 * ```
 *
 * @since 0.0.0
 * @category tool-schemas
 */
export const AiNGram = AiNGramSource;
/**
 * Ai phonetic match tool schema.
 *
 * @example
 * ```ts
 * import { AiPhoneticMatch } from "@beep/nlp-processing/Tools"
 *
 * console.log(AiPhoneticMatch)
 * ```
 *
 * @since 0.0.0
 * @category tool-schemas
 */
export const AiPhoneticMatch = AiPhoneticMatchSource;
/**
 * Ai ranked text tool schema.
 *
 * @example
 * ```ts
 * import { AiRankedText } from "@beep/nlp-processing/Tools"
 *
 * console.log(AiRankedText)
 * ```
 *
 * @since 0.0.0
 * @category tool-schemas
 */
export const AiRankedText = AiRankedTextSource;
/**
 * Ai sentence tool schema.
 *
 * @example
 * ```ts
 * import { AiSentence } from "@beep/nlp-processing/Tools"
 *
 * console.log(AiSentence)
 * ```
 *
 * @since 0.0.0
 * @category tool-schemas
 */
export const AiSentence = AiSentenceSource;
/**
 * Ai sentence chunk tool schema.
 *
 * @example
 * ```ts
 * import { AiSentenceChunk } from "@beep/nlp-processing/Tools"
 *
 * console.log(AiSentenceChunk)
 * ```
 *
 * @since 0.0.0
 * @category tool-schemas
 */
export const AiSentenceChunk = AiSentenceChunkSource;
/**
 * Ai tool error schema.
 *
 * @example
 * ```ts
 * import { AiToolError } from "@beep/nlp-processing/Tools"
 *
 * const failure = AiToolError.make({
 *   message: "Corpus not found",
 *   operation: "query",
 *   retryable: false,
 *   toolName: "QueryCorpus"
 * })
 *
 * console.log(failure.toolName)
 * ```
 *
 * @since 0.0.0
 * @category tool-schemas
 */
export const AiToolError = AiToolErrorSource;
/**
 * Ai token tool schema.
 *
 * @example
 * ```ts
 * import { AiToken } from "@beep/nlp-processing/Tools"
 *
 * console.log(AiToken)
 * ```
 *
 * @since 0.0.0
 * @category tool-schemas
 */
export const AiToken = AiTokenSource;
/**
 * Analyze tool.
 *
 * @example
 * ```ts
 * import { Analyze } from "@beep/nlp-processing/Tools"
 *
 * console.log(Analyze)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const Analyze = AnalyzeSource;
/**
 * Bag of words tool.
 *
 * @example
 * ```ts
 * import { BagOfWords } from "@beep/nlp-processing/Tools"
 *
 * console.log(BagOfWords)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const BagOfWords = BagOfWordsSource;
/**
 * Bow cosine similarity tool.
 *
 * @example
 * ```ts
 * import { BowCosineSimilarity } from "@beep/nlp-processing/Tools"
 *
 * console.log(BowCosineSimilarity)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const BowCosineSimilarity = BowCosineSimilaritySource;
/**
 * Chunk by sentences tool.
 *
 * @example
 * ```ts
 * import { ChunkBySentences } from "@beep/nlp-processing/Tools"
 *
 * console.log(ChunkBySentences)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const ChunkBySentences = ChunkBySentencesSource;
/**
 * Corpus stats layer.
 *
 * @example
 * ```ts
 * import { CorpusStats } from "@beep/nlp-processing/Tools"
 *
 * console.log(CorpusStats)
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const CorpusStats = CorpusStatsSource;
/**
 * Create corpus export.
 *
 * @example
 * ```ts
 * import { CreateCorpus } from "@beep/nlp-processing/Tools"
 *
 * console.log(CreateCorpus)
 * ```
 *
 * @since 0.0.0
 * @category adapters
 */
export const CreateCorpus: typeof CreateCorpusSource = CreateCorpusSource;
/**
 * Delete corpus tool.
 *
 * @example
 * ```ts
 * import { DeleteCorpus } from "@beep/nlp-processing/Tools"
 *
 * console.log(DeleteCorpus)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const DeleteCorpus = DeleteCorpusSource;
/**
 * Document stats tool.
 *
 * @example
 * ```ts
 * import { DocumentStats } from "@beep/nlp-processing/Tools"
 *
 * console.log(DocumentStats)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const DocumentStats = DocumentStatsSource;
/**
 * Extract entities tool.
 *
 * @example
 * ```ts
 * import { ExtractEntities } from "@beep/nlp-processing/Tools"
 *
 * console.log(ExtractEntities)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const ExtractEntities = ExtractEntitiesSource;
/**
 * Extract keywords tool.
 *
 * @example
 * ```ts
 * import { ExtractKeywords } from "@beep/nlp-processing/Tools"
 *
 * console.log(ExtractKeywords)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const ExtractKeywords = ExtractKeywordsSource;
/**
 * Learn corpus tool.
 *
 * @example
 * ```ts
 * import { LearnCorpus } from "@beep/nlp-processing/Tools"
 *
 * console.log(LearnCorpus)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const LearnCorpus = LearnCorpusSource;
/**
 * Learn custom entities tool.
 *
 * @example
 * ```ts
 * import { LearnCustomEntities } from "@beep/nlp-processing/Tools"
 *
 * console.log(LearnCustomEntities)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const LearnCustomEntities = LearnCustomEntitiesSource;
/**
 * N grams tool.
 *
 * @example
 * ```ts
 * import { NGrams } from "@beep/nlp-processing/Tools"
 *
 * console.log(NGrams)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const NGrams = NGramsSource;
/**
 * Paragraphize tool.
 *
 * @example
 * ```ts
 * import { Paragraphize } from "@beep/nlp-processing/Tools"
 *
 * console.log(Paragraphize)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const Paragraphize = ParagraphizeSource;
/**
 * Phonetic match tool.
 *
 * @example
 * ```ts
 * import { PhoneticMatch } from "@beep/nlp-processing/Tools"
 *
 * console.log(PhoneticMatch)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const PhoneticMatch = PhoneticMatchSource;
/**
 * Query corpus tool.
 *
 * @example
 * ```ts
 * import { QueryCorpus } from "@beep/nlp-processing/Tools"
 *
 * console.log(QueryCorpus)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const QueryCorpus = QueryCorpusSource;
/**
 * Rank by relevance tool.
 *
 * @example
 * ```ts
 * import { RankByRelevance } from "@beep/nlp-processing/Tools"
 *
 * console.log(RankByRelevance)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const RankByRelevance = RankByRelevanceSource;
/**
 * Remove stop words tool.
 *
 * @example
 * ```ts
 * import { RemoveStopWords } from "@beep/nlp-processing/Tools"
 *
 * console.log(RemoveStopWords)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const RemoveStopWords = RemoveStopWordsSource;
/**
 * Sentences tool.
 *
 * @example
 * ```ts
 * import { Sentences } from "@beep/nlp-processing/Tools"
 *
 * console.log(Sentences)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const Sentences = SentencesSource;
/**
 * Stem tool.
 *
 * @example
 * ```ts
 * import { Stem } from "@beep/nlp-processing/Tools"
 *
 * console.log(Stem)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const Stem = StemSource;
/**
 * Text similarity tool.
 *
 * @example
 * ```ts
 * import { TextSimilarity } from "@beep/nlp-processing/Tools"
 *
 * console.log(TextSimilarity)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const TextSimilarity = TextSimilaritySource;
/**
 * Tokenize tool.
 *
 * @example
 * ```ts
 * import { Tokenize } from "@beep/nlp-processing/Tools"
 *
 * console.log(Tokenize)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const Tokenize = TokenizeSource;
/**
 * Transform text tool.
 *
 * @example
 * ```ts
 * import { TransformText } from "@beep/nlp-processing/Tools"
 *
 * console.log(TransformText)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const TransformText = TransformTextSource;
/**
 * Tversky similarity tool.
 *
 * @example
 * ```ts
 * import { TverskySimilarity } from "@beep/nlp-processing/Tools"
 *
 * console.log(TverskySimilarity)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const TverskySimilarity = TverskySimilaritySource;
/**
 * Word count tool.
 *
 * @example
 * ```ts
 * import { WordCount } from "@beep/nlp-processing/Tools"
 *
 * console.log(WordCount)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const WordCount = WordCountSource;

/**
 * Nlp toolkit tool.
 *
 * @example
 * ```ts
 * import { NlpToolkit } from "@beep/nlp-processing/Tools"
 *
 * console.log(NlpToolkit)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const NlpToolkit: typeof NlpToolkitSource = NlpToolkitSource;

/**
 * Nlp tools tool.
 *
 * @example
 * ```ts
 * import { NlpTools } from "@beep/nlp-processing/Tools"
 *
 * console.log(NlpTools)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const NlpTools: typeof NlpToolsSource = NlpToolsSource;

/**
 * Export tools tool.
 *
 * @example
 * ```ts
 * import { exportTools } from "@beep/nlp-processing/Tools"
 *
 * console.log(exportTools)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const exportTools: typeof exportToolsSource = exportToolsSource;
