/**
 * Client-safe runtime SDK contracts.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Assistant-turn generation kernel contracts, errors, and port tag.
 *
 * @example
 * ```ts
 * import { AgentTurnKernel, TurnGenerationError, TurnHistoryItem } from "@beep/agents-use-cases/public"
 *
 * console.log(AgentTurnKernel, TurnGenerationError, TurnHistoryItem)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export * from "./processes/AssistantTurn/index.js";
/**
 * Chat wire contract: rpc declarations, the `ChatRpcs` group, and the
 * client-safe `ChatActionError` carried on every chat request.
 *
 * @example
 * ```ts
 * import { ChatActionError, ChatRpcs } from "@beep/agents-use-cases/public"
 *
 * console.log(ChatRpcs, ChatActionError)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export * from "./processes/Chat/index.js";
/**
 * Candidate output command contracts accepted by the runtime SDK.
 *
 * @example
 * ```ts
 * import { ProposeCandidateOutputSet } from "@beep/agents-use-cases/public"
 *
 * console.log(ProposeCandidateOutputSet)
 * ```
 *
 * @category commands
 * @since 0.0.0
 */
export * from "./processes/ProfessionalRuntime/ProfessionalRuntime.commands.js";
/**
 * Client-safe runtime DTO and context packet contracts.
 *
 * @example
 * ```ts
 * import { CandidateOutputSet } from "@beep/agents-use-cases/public"
 *
 * console.log(CandidateOutputSet)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export * from "./processes/ProfessionalRuntime/ProfessionalRuntime.contracts.js";
/**
 * Client-safe runtime validation errors.
 *
 * @example
 * ```ts
 * import { ProfessionalRuntimeValidationError } from "@beep/agents-use-cases/public"
 *
 * console.log(ProfessionalRuntimeValidationError.make({ message: "invalid runtime proposal" }))
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export * from "./processes/ProfessionalRuntime/ProfessionalRuntime.errors.js";
/**
 * Context packet query contracts accepted by the runtime SDK.
 *
 * @example
 * ```ts
 * import { GetContextPacket } from "@beep/agents-use-cases/public"
 *
 * console.log(GetContextPacket)
 * ```
 *
 * @category queries
 * @since 0.0.0
 */
export * from "./processes/ProfessionalRuntime/ProfessionalRuntime.queries.js";
/**
 * Client-safe runtime literal vocabularies.
 *
 * @example
 * ```ts
 * import { RuntimeCandidateLifecycle } from "@beep/agents-use-cases/public"
 *
 * console.log(RuntimeCandidateLifecycle)
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export * from "./processes/ProfessionalRuntime/ProfessionalRuntime.values.js";
/**
 * Client-safe SDK facade interface.
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
export type { ProfessionalRuntimeSdk } from "./processes/ProfessionalRuntime/ProfessionalRuntime.service.js";
