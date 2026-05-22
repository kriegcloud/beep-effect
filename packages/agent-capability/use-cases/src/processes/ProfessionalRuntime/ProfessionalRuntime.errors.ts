/**
 * SDK errors for the Agentic Professional Runtime proof.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AgentCapabilityUseCasesId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $AgentCapabilityUseCasesId.create("processes/ProfessionalRuntime/ProfessionalRuntime.errors");

/**
 * Validation failure for runtime SDK requests and candidate proposals.
 *
 * @example
 * ```ts
 * import { ProfessionalRuntimeValidationError } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(ProfessionalRuntimeValidationError.make({ message: "invalid runtime proposal" }))
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class ProfessionalRuntimeValidationError extends TaggedErrorClass<ProfessionalRuntimeValidationError>(
  $I`ProfessionalRuntimeValidationError`
)(
  "ProfessionalRuntimeValidationError",
  {
    message: S.String,
  },
  $I.annote("ProfessionalRuntimeValidationError", {
    description: "Raised when runtime request or proposal data violates SDK validation rules.",
  })
) {}
