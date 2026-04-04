/**
 * Sentences tool - splits text into sentences with metadata.
 * @since 3.0.0
 */

import { Tool } from "@effect/ai";
import { Schema } from "effect";
import { AiSentenceSchema } from "./_schemas.ts";

export const Sentences = Tool.make("Sentences", {
  description: "Split text into sentences with token counts and character positions",
  parameters: {
    text: Schema.String.annotations({
      description: "The text to split into sentences",
      examples: ["Hello world. How are you? I am fine."],
    }),
  },
  success: Schema.Struct({
    sentences: Schema.Array(AiSentenceSchema),
    sentenceCount: Schema.Number,
  }),
});
