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
 * @example
 * ```ts
 * import { AiCorpusConfig } from "@beep/nlp/Tools"
 *
 * console.log(AiCorpusConfig)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const AiCorpusConfig = AiCorpusConfigSource;
/**
 * @example
 * ```ts
 * import { AiCorpusIdf } from "@beep/nlp/Tools"
 *
 * console.log(AiCorpusIdf)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const AiCorpusIdf = AiCorpusIdfSource;
/**
 * @example
 * ```ts
 * import { AiCorpusMatrixShape } from "@beep/nlp/Tools"
 *
 * console.log(AiCorpusMatrixShape)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const AiCorpusMatrixShape = AiCorpusMatrixShapeSource;
/**
 * @example
 * ```ts
 * import { AiCorpusRankedDocument } from "@beep/nlp/Tools"
 *
 * console.log(AiCorpusRankedDocument)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const AiCorpusRankedDocument = AiCorpusRankedDocumentSource;
/**
 * @example
 * ```ts
 * import { AiCorpusStats } from "@beep/nlp/Tools"
 *
 * console.log(AiCorpusStats)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const AiCorpusStats = AiCorpusStatsSource;
/**
 * @example
 * ```ts
 * import { AiCorpusSummary } from "@beep/nlp/Tools"
 *
 * console.log(AiCorpusSummary)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const AiCorpusSummary = AiCorpusSummarySource;
/**
 * @example
 * ```ts
 * import { AiDocumentStats } from "@beep/nlp/Tools"
 *
 * console.log(AiDocumentStats)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const AiDocumentStats = AiDocumentStatsSource;
/**
 * @example
 * ```ts
 * import { AiEntity } from "@beep/nlp/Tools"
 *
 * console.log(AiEntity)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const AiEntity = AiEntitySource;
/**
 * @example
 * ```ts
 * import { AiKeyword } from "@beep/nlp/Tools"
 *
 * console.log(AiKeyword)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const AiKeyword = AiKeywordSource;
/**
 * @example
 * ```ts
 * import { AiNGram } from "@beep/nlp/Tools"
 *
 * console.log(AiNGram)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const AiNGram = AiNGramSource;
/**
 * @example
 * ```ts
 * import { AiPhoneticMatch } from "@beep/nlp/Tools"
 *
 * console.log(AiPhoneticMatch)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const AiPhoneticMatch = AiPhoneticMatchSource;
/**
 * @example
 * ```ts
 * import { AiRankedText } from "@beep/nlp/Tools"
 *
 * console.log(AiRankedText)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const AiRankedText = AiRankedTextSource;
/**
 * @example
 * ```ts
 * import { AiSentence } from "@beep/nlp/Tools"
 *
 * console.log(AiSentence)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const AiSentence = AiSentenceSource;
/**
 * @example
 * ```ts
 * import { AiSentenceChunk } from "@beep/nlp/Tools"
 *
 * console.log(AiSentenceChunk)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const AiSentenceChunk = AiSentenceChunkSource;
/**
 * @example
 * ```ts
 * import { AiToken } from "@beep/nlp/Tools"
 *
 * console.log(AiToken)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const AiToken = AiTokenSource;
/**
 * @example
 * ```ts
 * import { BowCosineSimilarity } from "@beep/nlp/Tools"
 *
 * console.log(BowCosineSimilarity)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const BowCosineSimilarity = BowCosineSimilaritySource;
/**
 * @example
 * ```ts
 * import { ChunkBySentences } from "@beep/nlp/Tools"
 *
 * console.log(ChunkBySentences)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const ChunkBySentences = ChunkBySentencesSource;
/**
 * @example
 * ```ts
 * import { CorpusStats } from "@beep/nlp/Tools"
 *
 * console.log(CorpusStats)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const CorpusStats = CorpusStatsSource;
/**
 * @example
 * ```ts
 * import { CreateCorpus } from "@beep/nlp/Tools"
 *
 * console.log(CreateCorpus)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const CreateCorpus: typeof CreateCorpusSource = CreateCorpusSource;
/**
 * @example
 * ```ts
 * import { DeleteCorpus } from "@beep/nlp/Tools"
 *
 * console.log(DeleteCorpus)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const DeleteCorpus = DeleteCorpusSource;
/**
 * @example
 * ```ts
 * import { DocumentStats } from "@beep/nlp/Tools"
 *
 * console.log(DocumentStats)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const DocumentStats = DocumentStatsSource;
/**
 * @example
 * ```ts
 * import { ExtractEntities } from "@beep/nlp/Tools"
 *
 * console.log(ExtractEntities)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const ExtractEntities = ExtractEntitiesSource;
/**
 * @example
 * ```ts
 * import { ExtractKeywords } from "@beep/nlp/Tools"
 *
 * console.log(ExtractKeywords)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const ExtractKeywords = ExtractKeywordsSource;
/**
 * @example
 * ```ts
 * import { LearnCorpus } from "@beep/nlp/Tools"
 *
 * console.log(LearnCorpus)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const LearnCorpus = LearnCorpusSource;
/**
 * @example
 * ```ts
 * import { LearnCustomEntities } from "@beep/nlp/Tools"
 *
 * console.log(LearnCustomEntities)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const LearnCustomEntities = LearnCustomEntitiesSource;
/**
 * @example
 * ```ts
 * import { NGrams } from "@beep/nlp/Tools"
 *
 * console.log(NGrams)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const NGrams = NGramsSource;
/**
 * @since 0.0.0
 * @category exports
 */
/**
 * @example
 * ```ts
 * import { PhoneticMatch } from "@beep/nlp/Tools"
 *
 * console.log(PhoneticMatch)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const PhoneticMatch = PhoneticMatchSource;
/**
 * @example
 * ```ts
 * import { QueryCorpus } from "@beep/nlp/Tools"
 *
 * console.log(QueryCorpus)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const QueryCorpus = QueryCorpusSource;
/**
 * @example
 * ```ts
 * import { RankByRelevance } from "@beep/nlp/Tools"
 *
 * console.log(RankByRelevance)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const RankByRelevance = RankByRelevanceSource;
/**
 * @example
 * ```ts
 * import { Sentences } from "@beep/nlp/Tools"
 *
 * console.log(Sentences)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const Sentences = SentencesSource;
/**
 * @example
 * ```ts
 * import { TextSimilarity } from "@beep/nlp/Tools"
 *
 * console.log(TextSimilarity)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const TextSimilarity = TextSimilaritySource;
/**
 * @example
 * ```ts
 * import { Tokenize } from "@beep/nlp/Tools"
 *
 * console.log(Tokenize)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const Tokenize = TokenizeSource;
/**
 * @example
 * ```ts
 * import { TransformText } from "@beep/nlp/Tools"
 *
 * console.log(TransformText)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const TransformText = TransformTextSource;
/**
 * @example
 * ```ts
 * import { TverskySimilarity } from "@beep/nlp/Tools"
 *
 * console.log(TverskySimilarity)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const TverskySimilarity = TverskySimilaritySource;

/**
 * @example
 * ```ts
 * import { NlpToolkit } from "@beep/nlp/Tools"
 *
 * console.log(NlpToolkit)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const NlpToolkit: typeof NlpToolkitSource = NlpToolkitSource;

/**
 * @example
 * ```ts
 * import { NlpToolkitLive } from "@beep/nlp/Tools"
 *
 * console.log(NlpToolkitLive)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const NlpToolkitLive: typeof NlpToolkitLiveSource = NlpToolkitLiveSource;

/**
 * @example
 * ```ts
 * import { NlpTools } from "@beep/nlp/Tools"
 *
 * console.log(NlpTools)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const NlpTools: typeof NlpToolsSource = NlpToolsSource;

/**
 * @example
 * ```ts
 * import { exportTools } from "@beep/nlp/Tools"
 *
 * console.log(exportTools)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const exportTools: typeof exportToolsSource = exportToolsSource;
