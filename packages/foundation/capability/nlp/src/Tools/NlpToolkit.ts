/**
 * Driver-neutral NLP toolkit contract.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { Toolkit } from "effect/unstable/ai";
import { BowCosineSimilarity } from "./BowCosineSimilarity.ts";
import { ChunkBySentences } from "./ChunkBySentences.ts";
import { CorpusStats } from "./CorpusStats.ts";
import { CreateCorpus } from "./CreateCorpus.ts";
import { DeleteCorpus } from "./DeleteCorpus.ts";
import { DocumentStats } from "./DocumentStats.ts";
import { ExtractEntities } from "./ExtractEntities.ts";
import { ExtractKeywords } from "./ExtractKeywords.ts";
import { LearnCorpus } from "./LearnCorpus.ts";
import { LearnCustomEntities } from "./LearnCustomEntities.ts";
import { NGrams } from "./NGrams.ts";
import { PhoneticMatch } from "./PhoneticMatch.ts";
import { QueryCorpus } from "./QueryCorpus.ts";
import { RankByRelevance } from "./RankByRelevance.ts";
import { Sentences } from "./Sentences.ts";
import { TextSimilarity } from "./TextSimilarity.ts";
import { Tokenize } from "./Tokenize.ts";
import { TransformText } from "./TransformText.ts";
import { TverskySimilarity } from "./TverskySimilarity.ts";

type NlpToolList = readonly [
  typeof BowCosineSimilarity,
  typeof ChunkBySentences,
  typeof CorpusStats,
  typeof CreateCorpus,
  typeof DeleteCorpus,
  typeof DocumentStats,
  typeof ExtractEntities,
  typeof ExtractKeywords,
  typeof LearnCorpus,
  typeof LearnCustomEntities,
  typeof NGrams,
  typeof PhoneticMatch,
  typeof QueryCorpus,
  typeof RankByRelevance,
  typeof Sentences,
  typeof TextSimilarity,
  typeof Tokenize,
  typeof TransformText,
  typeof TverskySimilarity,
];

type NlpToolkitTools = Toolkit.ToolsByName<NlpToolList>;

/**
 * Canonical ordered NLP tool list used to build the toolkit and export
 * adapters.
 *
 * The order is stable for export adapters that present tools to non-Effect
 * runtimes and for agents that need to inspect the available NLP surface.
 *
 * @example
 * ```ts
 * import { NlpTools } from "@beep/nlp/Tools/NlpToolkit"
 *
 * const toolNames = NlpTools.map((tool) => tool.name)
 * const summary = {
 *   count: toolNames.length,
 *   hasTokenize: toolNames.includes("Tokenize")
 * }
 *
 * console.log(summary)
 * // { count: 19, hasTokenize: true }
 * ```
 *
 * @category tools
 * @since 0.0.0
 */
export const NlpTools: NlpToolList = [
  BowCosineSimilarity,
  ChunkBySentences,
  CorpusStats,
  CreateCorpus,
  DeleteCorpus,
  DocumentStats,
  ExtractEntities,
  ExtractKeywords,
  LearnCorpus,
  LearnCustomEntities,
  NGrams,
  PhoneticMatch,
  QueryCorpus,
  RankByRelevance,
  Sentences,
  TextSimilarity,
  Tokenize,
  TransformText,
  TverskySimilarity,
] as const;

/**
 * Effect AI toolkit definition containing the full NLP tool surface.
 *
 * Drivers provide the handler layer for this contract. For example,
 * `@beep/wink` provides a wink-backed implementation.
 *
 * @example
 * ```ts
 * import { NlpToolkit, NlpTools } from "@beep/nlp/Tools/NlpToolkit"
 *
 * const toolkitToolNames = Object.keys(NlpToolkit.tools)
 * const summary = {
 *   hasTokenize: toolkitToolNames.includes("Tokenize"),
 *   sameToolCount: toolkitToolNames.length === NlpTools.length
 * }
 *
 * console.log(summary)
 * // { hasTokenize: true, sameToolCount: true }
 * ```
 *
 * @category tools
 * @since 0.0.0
 */
export const NlpToolkit: Toolkit.Toolkit<NlpToolkitTools> = Toolkit.make(...NlpTools);
