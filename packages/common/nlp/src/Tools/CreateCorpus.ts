/**
 * CreateCorpus tool definition.
 *
 * @since 0.0.0
 * @module @beep/nlp/Tools/CreateCorpus
 */

import { $NlpId } from "@beep/identity";
import * as S from "effect/Schema";
import { Tool } from "effect/unstable/ai";
import { BM25Norm } from "../Wink/WinkVectorizer.ts";
import { AiCorpusSummary } from "./_schemas.ts";

const $I = $NlpId.create("Tools/CreateCorpus");

class CreateCorpusBM25Config extends S.Class<CreateCorpusBM25Config>($I`CreateCorpusBM25Config`)(
  {
    b: S.optionalKey(S.Number),
    k: S.optionalKey(S.Number),
    k1: S.optionalKey(S.Number),
    norm: S.optionalKey(BM25Norm),
  },
  $I.annote("CreateCorpusBM25Config", {
    description: "Optional BM25 overrides for a new corpus session.",
  })
) {}

class CreateCorpusParameters extends S.Class<CreateCorpusParameters>($I`CreateCorpusParameters`)(
  {
    bm25Config: S.optionalKey(CreateCorpusBM25Config).annotateKey({
      description: "Optional BM25 overrides. Omitted fields use defaults.",
    }),
    corpusId: S.optionalKey(S.String.check(S.isMinLength(1))).annotateKey({
      description: "Optional stable corpus identifier. If omitted, a generated id is returned.",
    }),
  },
  $I.annote("CreateCorpusParameters", {
    description: "Inputs required to create a new stateful BM25-style corpus session.",
  })
) {}

/**
 * Tool for creating a stateful corpus session.
 *
 * @since 0.0.0
 * @category Tools
 */
export const CreateCorpus = Tool.make("CreateCorpus", {
  description: "Create a stateful BM25-style corpus session that can be learned incrementally across tool calls.",
  parameters: CreateCorpusParameters,
  success: AiCorpusSummary,
});
