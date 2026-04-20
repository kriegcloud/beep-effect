/**
 * LearnCorpus tool definition.
 *
 * @since 0.0.0
 * @module \@beep/nlp/Tools/LearnCorpus
 */

import { $NlpId } from "@beep/identity";
import * as S from "effect/Schema";
import { Tool } from "effect/unstable/ai";

const $I = $NlpId.create("Tools/LearnCorpus");

class LearnCorpusDocument extends S.Class<LearnCorpusDocument>($I`LearnCorpusDocument`)(
  {
    id: S.optionalKey(S.String.check(S.isMinLength(1))),
    text: S.String,
  },
  $I.annote("LearnCorpusDocument", {
    description: "One document to learn into a corpus session.",
  })
) {}

class LearnCorpusParameters extends S.Class<LearnCorpusParameters>($I`LearnCorpusParameters`)(
  {
    corpusId: S.String.check(S.isMinLength(1)).annotateKey({
      description: "Corpus identifier returned by CreateCorpus",
    }),
    dedupeById: S.optionalKey(S.Boolean).annotateKey({
      description: "If true, skip incoming documents whose ids already exist in the corpus.",
    }),
    documents: S.NonEmptyArray(LearnCorpusDocument).annotateKey({
      description: "Documents to learn into the corpus",
    }),
  },
  $I.annote("LearnCorpusParameters", {
    description: "Inputs required to incrementally learn documents into an existing corpus session.",
  })
) {}

class LearnCorpusSuccess extends S.Class<LearnCorpusSuccess>($I`LearnCorpusSuccess`)(
  {
    corpusId: S.String,
    learnedCount: S.Number,
    reindexRequired: S.Boolean,
    skippedCount: S.Number,
    totalDocuments: S.Number,
    vocabularySize: S.Number,
  },
  $I.annote("LearnCorpusSuccess", {
    description: "Learning result summary for an incremental corpus update.",
  })
) {}

/**
 * Tool for incrementally learning documents into a corpus.
 *
 * @since 0.0.0
 * @category Tools
 */
export const LearnCorpus = Tool.make("LearnCorpus", {
  description: "Learn one or more documents into an existing corpus session for incremental indexing.",
  parameters: LearnCorpusParameters,
  success: LearnCorpusSuccess,
});
