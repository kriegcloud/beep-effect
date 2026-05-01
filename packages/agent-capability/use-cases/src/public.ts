/**
 * Client-safe runtime SDK contracts.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Candidate output command contracts accepted by the runtime SDK.
 *
 * @example
 * ```ts
 * import { ProposeCandidateOutputSet } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(ProposeCandidateOutputSet)
 * ```
 *
 * @category exports
 * @since 0.0.0
 */
export * from "./processes/ProfessionalRuntime/ProfessionalRuntime.commands.js";
/**
 * Client-safe runtime DTO and context packet contracts.
 *
 * @example
 * ```ts
 * import { CandidateOutputSet } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(CandidateOutputSet)
 * ```
 *
 * @category exports
 * @since 0.0.0
 */
export * from "./processes/ProfessionalRuntime/ProfessionalRuntime.contracts.js";
/**
 * Client-safe runtime validation errors.
 *
 * @example
 * ```ts
 * import { ProfessionalRuntimeValidationError } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(new ProfessionalRuntimeValidationError({ message: "invalid runtime proposal" }))
 * ```
 *
 * @category exports
 * @since 0.0.0
 */
export * from "./processes/ProfessionalRuntime/ProfessionalRuntime.errors.js";
/**
 * Context packet query contracts accepted by the runtime SDK.
 *
 * @example
 * ```ts
 * import { GetContextPacket } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(GetContextPacket)
 * ```
 *
 * @category exports
 * @since 0.0.0
 */
export * from "./processes/ProfessionalRuntime/ProfessionalRuntime.queries.js";
/**
 * Client-safe SDK facade interface.
 *
 * @example
 * ```ts
 * import type { ProfessionalRuntimeSdk } from "@beep/agent-capability-use-cases/public"
 *
 * declare const sdk: ProfessionalRuntimeSdk
 * console.log(sdk)
 * ```
 *
 * @category exports
 * @since 0.0.0
 */
export type { ProfessionalRuntimeSdk } from "./processes/ProfessionalRuntime/ProfessionalRuntime.service.js";
/**
 * Client-safe runtime literal vocabularies.
 *
 * @example
 * ```ts
 * import { RuntimeCandidateLifecycle } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(RuntimeCandidateLifecycle)
 * ```
 *
 * @category exports
 * @since 0.0.0
 */
export * from "./processes/ProfessionalRuntime/ProfessionalRuntime.values.js";
