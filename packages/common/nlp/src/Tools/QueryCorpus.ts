/**
 * QueryCorpus tool definition.
 *
 * @since 0.0.0
 * @module
 */

import { $NlpId } from "@beep/identity";
import { PosInt } from "@beep/schema";
import * as S from "effect/Schema";
import { Tool } from "effect/unstable/ai";
import { AiCorpusRankedDocument } from "./_schemas.ts";

const $I = $NlpId.create("Tools/QueryCorpus");

class QueryCorpusParameters extends S.Class<QueryCorpusParameters>($I`QueryCorpusParameters`)(
  {
    corpusId: S.String.check(S.isMinLength(1)).annotateKey({
      description: "Corpus identifier returned by CreateCorpus",
    }),
    includeText: S.optionalKey(S.Boolean).annotateKey({
      description: "Include source document text for each ranked result",
    }),
    query: S.String.annotateKey({
      description: "Query text to rank corpus documents against",
    }),
    topN: S.optionalKey(PosInt).annotateKey({
      description: "Maximum ranked results to return (default: all documents)",
    }),
  },
  $I.annote("QueryCorpusParameters", {
    description: "Inputs required to query a previously learned corpus session.",
  })
) {}

class QueryCorpusSuccess extends S.Class<QueryCorpusSuccess>($I`QueryCorpusSuccess`)(
  {
    corpusId: S.String.annotateKey({
      description: "Corpus identifier used for the query.",
    }),
    method: S.Literal("vector.cosine").annotateKey({
      description: "Similarity method used to rank corpus documents.",
    }),
    query: S.String.annotateKey({
      description: "Original query text used for ranking.",
    }),
    ranked: S.Array(AiCorpusRankedDocument).annotateKey({
      description: "Ranked documents returned from the corpus query.",
    }),
    returned: S.Number.annotateKey({
      description: "Number of ranked documents returned in this response.",
    }),
    totalDocuments: S.Number.annotateKey({
      description: "Total number of learned documents available in the corpus.",
    }),
  },
  $I.annote("QueryCorpusSuccess", {
    description: "Ranked corpus query results and result-count metadata.",
  })
) {}

/**
 * Tool for querying a previously learned corpus session.
 *
 * @example
 * ```ts
 * import { QueryCorpus } from "@beep/nlp/Tools/QueryCorpus"
 *
 * console.log(QueryCorpus)
 * ```
 *
 * @since 0.0.0
 * @category Tools
 */
export const QueryCorpus = Tool.make("QueryCorpus", {
  description: "Query a learned corpus session and return vector-ranked results without relearning.",
  parameters: QueryCorpusParameters,
  success: QueryCorpusSuccess,
});
