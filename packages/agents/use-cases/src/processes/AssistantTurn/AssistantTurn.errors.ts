/**
 * Client-safe errors for the assistant-turn generation kernel.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AgentsUseCasesId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $AgentsUseCasesId.create("processes/AssistantTurn/AssistantTurn.errors");

/**
 * Public action failure raised when an assistant turn cannot be generated.
 * This is the client-safe error a turn kernel implementation may fail with.
 *
 * **Example** (Creating a TurnGenerationError)
 *
 * ```ts
 * import { TurnGenerationError } from "@beep/agents-use-cases/public"
 *
 * console.log(TurnGenerationError.make({ message: "turn generation failed" }))
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class TurnGenerationError extends S.TaggedError<TurnGenerationError, { readonly brand: unique symbol }>(
  $I`TurnGenerationError`
)(
  "TurnGenerationError",
  {
    message: S.String,
  },
  $I.annoteError<TurnGenerationError>("TurnGenerationError", {
    description: "Raised when an assistant turn cannot be generated from the supplied history.",
  })
) {
  static readonly new = (message: string) => TurnGenerationError.make({ message });
}
