/**
 * Prompt template request/response schemas.
 *
 * @module
 * @since 0.1.0
 */
import { $GraphSchemaId } from "@beep/identity";
import * as S from "effect/Schema";

import { TgError } from "./Primitives.ts";

const $I = $GraphSchemaId.create("Prompt");

/**
 * Request payload for prompt template rendering.
 *
 * @since 0.1.0
 * @category models
 */
export class PromptRequest extends S.Class<PromptRequest>($I`PromptRequest`)({
  name: S.String.annotateKey({
    description: "Prompt template name to render.",
  }),
  variables: S.OptionFromOptionalKey(S.Record(S.String, S.String)).annotateKey({
    description: "Optional template variables supplied to the renderer.",
  }),
}, $I.annote("PromptRequest", {
  description: "Request payload for prompt template rendering.",
})) {}

/**
 * Response payload for prompt template rendering.
 *
 * @since 0.1.0
 * @category models
 */
export class PromptResponse extends S.Class<PromptResponse>($I`PromptResponse`)({
  system: S.String.annotateKey({
    description: "Rendered system prompt passed to the model runtime.",
  }),
  prompt: S.String.annotateKey({
    description: "Rendered user prompt passed to the model runtime.",
  }),
  error: S.OptionFromOptionalKey(TgError).annotateKey({
    description: "Embedded error payload when template rendering fails.",
  }),
}, $I.annote("PromptResponse", {
  description: "Response payload for prompt template rendering.",
})) {}
