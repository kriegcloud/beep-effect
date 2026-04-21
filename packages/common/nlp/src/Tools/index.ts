/**
 * NLP AI tools.
 *
 * @since 0.0.0
 * @module
 */

import {
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
} from "./_schemas.ts";
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
import {
  NlpToolkitLive as NlpToolkitLiveSource,
  NlpToolkit as NlpToolkitSource,
  NlpTools as NlpToolsSource,
} from "./NlpToolkit.ts";
import { PhoneticMatch as PhoneticMatchSource } from "./PhoneticMatch.ts";
import { QueryCorpus as QueryCorpusSource } from "./QueryCorpus.ts";
import { RankByRelevance as RankByRelevanceSource } from "./RankByRelevance.ts";
import { Sentences as SentencesSource } from "./Sentences.ts";
import { TextSimilarity as TextSimilaritySource } from "./TextSimilarity.ts";
import { Tokenize as TokenizeSource } from "./Tokenize.ts";
import { exportTools as exportToolsSource } from "./ToolExport.ts";
import { TransformText as TransformTextSource } from "./TransformText.ts";
import { TverskySimilarity as TverskySimilaritySource } from "./TverskySimilarity.ts";

/**
 * @since 0.0.0
 * @category exports
 */
export const AiCorpusConfig = AiCorpusConfigSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const AiCorpusIdf = AiCorpusIdfSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const AiCorpusMatrixShape = AiCorpusMatrixShapeSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const AiCorpusRankedDocument = AiCorpusRankedDocumentSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const AiCorpusStats = AiCorpusStatsSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const AiCorpusSummary = AiCorpusSummarySource;
/**
 * @since 0.0.0
 * @category exports
 */
export const AiDocumentStats = AiDocumentStatsSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const AiEntity = AiEntitySource;
/**
 * @since 0.0.0
 * @category exports
 */
export const AiKeyword = AiKeywordSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const AiNGram = AiNGramSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const AiPhoneticMatch = AiPhoneticMatchSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const AiRankedText = AiRankedTextSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const AiSentence = AiSentenceSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const AiSentenceChunk = AiSentenceChunkSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const AiToken = AiTokenSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const BowCosineSimilarity = BowCosineSimilaritySource;
/**
 * @since 0.0.0
 * @category exports
 */
export const ChunkBySentences = ChunkBySentencesSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const CorpusStats = CorpusStatsSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const CreateCorpus: typeof CreateCorpusSource = CreateCorpusSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const DeleteCorpus = DeleteCorpusSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const DocumentStats = DocumentStatsSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const ExtractEntities = ExtractEntitiesSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const ExtractKeywords = ExtractKeywordsSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const LearnCorpus = LearnCorpusSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const LearnCustomEntities = LearnCustomEntitiesSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const NGrams = NGramsSource;
/**
 * @since 0.0.0
 * @category exports
 */
/**
 * @since 0.0.0
 * @category exports
 */
export const PhoneticMatch = PhoneticMatchSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const QueryCorpus = QueryCorpusSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const RankByRelevance = RankByRelevanceSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const Sentences = SentencesSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const TextSimilarity = TextSimilaritySource;
/**
 * @since 0.0.0
 * @category exports
 */
export const Tokenize = TokenizeSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const TransformText = TransformTextSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const TverskySimilarity = TverskySimilaritySource;

/**
 * @since 0.0.0
 * @category exports
 */
export const NlpToolkit: typeof NlpToolkitSource = NlpToolkitSource;

/**
 * @since 0.0.0
 * @category exports
 */
export const NlpToolkitLive: typeof NlpToolkitLiveSource = NlpToolkitLiveSource;

/**
 * @since 0.0.0
 * @category exports
 */
export const NlpTools: typeof NlpToolsSource = NlpToolsSource;

/**
 * @since 0.0.0
 * @category exports
 */
export const exportTools: typeof exportToolsSource = exportToolsSource;
