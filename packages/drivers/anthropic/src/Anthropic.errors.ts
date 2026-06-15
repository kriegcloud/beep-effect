/**
 * Technical errors raised by the Anthropic driver boundary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AnthropicId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $AnthropicId.create("Anthropic.errors");

/**
 * Technical failure raised while running an Anthropic repair helper.
 *
 * @example
 * ```ts
 * import { RepairError } from "@beep/anthropic"
 *
 * const error = RepairError.make({
 *   message: "repair call failed",
 *   operation: "generate_tool_json",
 * })
 * console.log(error.message)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class RepairError extends TaggedErrorClass<RepairError>($I`RepairError`)(
  "RepairError",
  {
    message: S.String,
    operation: S.String,
  },
  $I.annote("RepairError", {
    description: "Technical Anthropic driver failure raised while running repair helper calls.",
  })
) {}
