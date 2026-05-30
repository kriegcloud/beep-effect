/**
 * MCP tool definitions for the `@beep/nlp` MCP server.
 *
 * Declares each NLP operation as an `effect/unstable/ai` {@link Tool} with a
 * schema-validated parameter and success contract, and bundles them into a single
 * {@link NlpToolkit}. The handlers are wired separately (see `./Server.ts`) so the
 * tool surface stays a pure, declarative description.
 *
 * Ported from the `adjunct` repo (Effect v3, `@effect/ai`) to Effect v4 /
 * `effect/unstable/ai`: `Tool.make` parameters take a single Schema (the
 * {@link Schemas.TextInput} class) rather than a field record.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import * as Tool from "effect/unstable/ai/Tool";
import * as Toolkit from "effect/unstable/ai/Toolkit";
import * as Schemas from "./Schemas.ts";

/**
 * Split text into sentences.
 *
 * @example
 * ```ts
 * import { Sentencize } from "@beep/nlp-mcp/Tools"
 *
 * console.log(Sentencize.name)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const Sentencize = Tool.make("nlp_sentencize", {
  description: "Split text into sentences using sentence boundary detection.",
  failure: Schemas.NlpToolError,
  parameters: Schemas.TextInput,
  success: Schemas.TextArrayOutput,
});

/**
 * Split text into tokens (words).
 *
 * @example
 * ```ts
 * import { Tokenize } from "@beep/nlp-mcp/Tools"
 *
 * console.log(Tokenize.name)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const Tokenize = Tool.make("nlp_tokenize", {
  description: "Split text into tokens (words), including punctuation as separate tokens.",
  failure: Schemas.NlpToolError,
  parameters: Schemas.TextInput,
  success: Schemas.TextArrayOutput,
});

/**
 * Tag each token with its part-of-speech label.
 *
 * @example
 * ```ts
 * import { PosTag } from "@beep/nlp-mcp/Tools"
 *
 * console.log(PosTag.name)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const PosTag = Tool.make("nlp_pos_tag", {
  description: "Tag each token with its part-of-speech label.",
  failure: Schemas.NlpToolError,
  parameters: Schemas.TextInput,
  success: Schemas.POSOutput,
});

/**
 * Reduce each token to its canonical lemma.
 *
 * @example
 * ```ts
 * import { Lemmatize } from "@beep/nlp-mcp/Tools"
 *
 * console.log(Lemmatize.name)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const Lemmatize = Tool.make("nlp_lemmatize", {
  description: "Reduce each token to its canonical lemma.",
  failure: Schemas.NlpToolError,
  parameters: Schemas.TextInput,
  success: Schemas.LemmaOutput,
});

/**
 * Extract named entities from text.
 *
 * @example
 * ```ts
 * import { ExtractEntities } from "@beep/nlp-mcp/Tools"
 *
 * console.log(ExtractEntities.name)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const ExtractEntities = Tool.make("nlp_entities", {
  description: "Extract named entities (type + character span) from text.",
  failure: Schemas.NlpToolError,
  parameters: Schemas.TextInput,
  success: Schemas.EntityOutput,
});

/**
 * The toolkit bundling every NLP tool exposed by this MCP server.
 *
 * @example
 * ```ts
 * import { NlpToolkit } from "@beep/nlp-mcp/Tools"
 *
 * console.log(typeof NlpToolkit)
 * ```
 *
 * @since 0.0.0
 * @category tools
 */
export const NlpToolkit = Toolkit.make(Sentencize, Tokenize, PosTag, Lemmatize, ExtractEntities);
