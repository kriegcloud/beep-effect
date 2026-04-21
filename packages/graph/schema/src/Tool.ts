/**
 * MCP tool invocation request/response schemas.
 *
 * @module
 * @since 0.1.0
 */
import { $GraphSchemaId } from "@beep/identity";
import * as S from "effect/Schema";

import { TgError } from "./Primitives.ts";

const $I = $GraphSchemaId.create("Tool");

/**
 * Request payload for MCP tool invocations.
 *
 * @since 0.1.0
 * @category models
 */
export class ToolRequest extends S.Class<ToolRequest>($I`ToolRequest`)({
  name: S.String.annotateKey({
    description: "Name of the MCP tool to invoke.",
  }),
  parameters: S.String.annotateKey({
    description: "Serialized tool parameters passed over the wire.",
  }),
}, $I.annote("ToolRequest", {
  description: "Request payload for MCP tool invocations.",
})) {}

/**
 * Response payload for MCP tool invocations.
 *
 * @since 0.1.0
 * @category models
 */
export class ToolResponse extends S.Class<ToolResponse>($I`ToolResponse`)({
  error: S.OptionFromOptionalKey(TgError).annotateKey({
    description: "Embedded error payload when the tool invocation fails.",
  }),
  text: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Optional textual response returned by the tool.",
  }),
  object: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Optional serialized object response returned by the tool.",
  }),
}, $I.annote("ToolResponse", {
  description: "Response payload for MCP tool invocations.",
})) {}
