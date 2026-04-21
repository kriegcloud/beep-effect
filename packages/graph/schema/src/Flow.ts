/**
 * Flow management request/response schemas.
 *
 * Flow messages carry arbitrary key/value pairs on the wire (kebab-case
 * field names). The schemas define the known fields; additional properties
 * pass through at the JSON level.
 *
 * @module
 * @since 0.1.0
 */
import { $GraphSchemaId } from "@beep/identity";
import * as S from "effect/Schema";

import { TgError } from "./Primitives.ts";

const $I = $GraphSchemaId.create("Flow");

/**
 * Request payload for graph flow-management operations.
 *
 * @since 0.1.0
 * @category models
 */
export class FlowRequest extends S.Class<FlowRequest>($I`FlowRequest`)({
  operation: S.String.annotateKey({
    description: "Flow-management operation to perform.",
  }),
}, $I.annote("FlowRequest", {
  description: "Request payload for graph flow-management operations.",
})) {}

/**
 * Response payload for graph flow-management operations.
 *
 * @since 0.1.0
 * @category models
 */
export class FlowResponse extends S.Class<FlowResponse>($I`FlowResponse`)({
  error: S.OptionFromOptionalKey(TgError).annotateKey({
    description: "Embedded error payload when the flow operation fails.",
  }),
}, $I.annote("FlowResponse", {
  description: "Response payload for graph flow-management operations.",
})) {}
