/**
 * Sentences tool definition.
 *
 * @since 0.0.0
 * @module \@beep/nlp/Tools/Sentences
 */

import { $NlpId } from "@beep/identity";
import * as S from "effect/Schema";
import { Tool } from "effect/unstable/ai";
import { AiSentence } from "./_schemas.ts";

const $I = $NlpId.create("Tools/Sentences");

class SentencesParameters extends S.Class<SentencesParameters>($I`SentencesParameters`)(
  {
    text: S.String.annotateKey({
      description: "The text to split into sentences",
      examples: ["Hello world. How are you? I am fine."],
    }),
  },
  $I.annote("SentencesParameters", {
    description: "Text input used to split content into sentence segments.",
  })
) {}

class SentencesSuccess extends S.Class<SentencesSuccess>($I`SentencesSuccess`)(
  {
    sentenceCount: S.Number,
    sentences: S.Array(AiSentence),
  },
  $I.annote("SentencesSuccess", {
    description: "Sentence segmentation result and the total number of detected sentences.",
  })
) {}

/**
 * Tool for splitting text into sentences with metadata.
 *
 * @since 0.0.0
 * @category Tools
 */
export const Sentences = Tool.make("Sentences", {
  description: "Split text into sentences with token counts and character positions.",
  parameters: SentencesParameters,
  success: SentencesSuccess,
});
