/**
 * MCP tool input/output schemas for the `@beep/nlp` MCP server.
 *
 * Schema-first I/O contracts for each NLP tool exposed over the Model Context
 * Protocol: the parameter schemas validate incoming tool calls and the output
 * schemas shape the structured results returned to the MCP client. They mirror
 * the `@beep/nlp` backend operations (tokenize/sentencize/posTag/lemmatize/
 * extractEntities) in a flat, JSON-friendly form.
 *
 * Ported from the `adjunct` repo (Effect v3) to Effect v4 / `@beep/nlp-mcp`:
 * `Schema.Class("Name")` becomes the identity-composer `S.Class` form with
 * `annote` metadata, and field constraints use v4 `S.check` combinators.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { $NlpMcpId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $NlpMcpId.create("Schemas");

/**
 * Parameters for a text-only NLP tool call.
 *
 * @example
 * ```ts
 * import { TextInput } from "@beep/nlp-mcp/Schemas"
 *
 * console.log(TextInput.make({ text: "hello" }))
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export class TextInput extends S.Class<TextInput>($I`TextInput`)(
  {
    text: S.NonEmptyString,
  },
  $I.annote("TextInput", { description: "Parameters for a text-only NLP tool call." })
) {}

/**
 * The failure a tool returns when the underlying NLP backend operation fails.
 *
 * @example
 * ```ts
 * import { NlpToolError } from "@beep/nlp-mcp/Schemas"
 *
 * console.log(NlpToolError.make({ message: "boom", operation: "tokenize" }))
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export class NlpToolError extends S.Class<NlpToolError>($I`NlpToolError`)(
  {
    message: S.String,
    operation: S.String,
  },
  $I.annote("NlpToolError", { description: "Failure returned by an NLP tool when the backend operation fails." })
) {}

/**
 * A single part-of-speech tagged token.
 *
 * @since 0.0.0
 * @category schemas
 */
export class POSEntry extends S.Class<POSEntry>($I`POSEntry`)(
  {
    position: S.Number,
    tag: S.String,
    text: S.String,
  },
  $I.annote("POSEntry", { description: "A token paired with its part-of-speech tag and position." })
) {}

/**
 * A single lemmatized token.
 *
 * @since 0.0.0
 * @category schemas
 */
export class LemmaEntry extends S.Class<LemmaEntry>($I`LemmaEntry`)(
  {
    lemma: S.String,
    position: S.Number,
    token: S.String,
  },
  $I.annote("LemmaEntry", { description: "A token paired with its canonical lemma and position." })
) {}

/**
 * A single extracted named entity.
 *
 * @since 0.0.0
 * @category schemas
 */
export class EntityEntry extends S.Class<EntityEntry>($I`EntityEntry`)(
  {
    confidence: S.optionalKey(S.Number),
    entityType: S.String,
    span: S.optionalKey(S.Struct({ end: S.Number, start: S.Number })),
    text: S.String,
  },
  $I.annote("EntityEntry", {
    description: "A named entity with its type, optional character span, and optional confidence.",
  })
) {}

/**
 * Output of a tool that returns an array of strings (tokens or sentences).
 *
 * @example
 * ```ts
 * import { TextArrayOutput } from "@beep/nlp-mcp/Schemas"
 *
 * console.log(TextArrayOutput.make({ result: ["a", "b"], count: 2 }))
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export class TextArrayOutput extends S.Class<TextArrayOutput>($I`TextArrayOutput`)(
  {
    count: S.Number,
    result: S.Array(S.String),
  },
  $I.annote("TextArrayOutput", { description: "An array of result strings with its count." })
) {}

/**
 * Output of the part-of-speech tagging tool.
 *
 * @since 0.0.0
 * @category schemas
 */
export class POSOutput extends S.Class<POSOutput>($I`POSOutput`)(
  {
    count: S.Number,
    result: S.Array(POSEntry),
  },
  $I.annote("POSOutput", { description: "Part-of-speech tagged tokens with their count." })
) {}

/**
 * Output of the lemmatization tool.
 *
 * @since 0.0.0
 * @category schemas
 */
export class LemmaOutput extends S.Class<LemmaOutput>($I`LemmaOutput`)(
  {
    count: S.Number,
    result: S.Array(LemmaEntry),
  },
  $I.annote("LemmaOutput", { description: "Lemmatized tokens with their count." })
) {}

/**
 * Output of the named-entity extraction tool.
 *
 * @since 0.0.0
 * @category schemas
 */
export class EntityOutput extends S.Class<EntityOutput>($I`EntityOutput`)(
  {
    count: S.Number,
    result: S.Array(EntityEntry),
  },
  $I.annote("EntityOutput", { description: "Extracted named entities with their count." })
) {}
