/**
 * Public SDK facade contract for the Agentic Professional Runtime proof.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import type { Effect } from "effect";
import type { ProposeCandidateOutputSet } from "./ProfessionalRuntime.commands.js";
import type { CandidateOutputSet, SdkContextPacket } from "./ProfessionalRuntime.contracts.js";
import type { ProfessionalRuntimeValidationError } from "./ProfessionalRuntime.errors.js";
import type { GetContextPacket } from "./ProfessionalRuntime.queries.js";

/**
 * SDK facade shape exposed to clients and adapters.
 *
 * @example
 * ```ts
 * import type { ProfessionalRuntimeSdk } from "@beep/agents-use-cases/public"
 *
 * declare const sdk: ProfessionalRuntimeSdk
 * console.log(sdk)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface ProfessionalRuntimeSdk {
  readonly getContextPacket: (
    query: GetContextPacket
  ) => Effect.Effect<SdkContextPacket, ProfessionalRuntimeValidationError>;
  readonly proposeCandidateOutputSet: (
    command: ProposeCandidateOutputSet
  ) => Effect.Effect<CandidateOutputSet, ProfessionalRuntimeValidationError>;
}
