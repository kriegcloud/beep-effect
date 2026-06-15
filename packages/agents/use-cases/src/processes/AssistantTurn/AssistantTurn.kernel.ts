/**
 * The assistant-turn generation kernel port.
 *
 * This is the single port both the (future) Anthropic implementation and the
 * deterministic fixture satisfy: given a plain-text history, stream the next
 * assistant turn as a sequence of indexed blocks. Implementations translate
 * their internal failures into the public {@link TurnGenerationError}.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AgentsUseCasesId } from "@beep/identity/packages";
import { Context } from "effect";
import type * as Stream from "effect/Stream";
import type { IndexedBlock, TurnHistoryItem } from "./AssistantTurn.contracts.js";
import type { TurnGenerationError } from "./AssistantTurn.errors.js";

const $I = $AgentsUseCasesId.create("processes/AssistantTurn/AssistantTurn.kernel");

/**
 * Service shape of the assistant-turn generation kernel.
 *
 * @example
 * ```ts
 * import type { AgentTurnKernelShape } from "@beep/agents-use-cases/public"
 *
 * declare const kernel: AgentTurnKernelShape
 * console.log(kernel.streamTurn)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface AgentTurnKernelShape {
  readonly streamTurn: (history: ReadonlyArray<TurnHistoryItem>) => Stream.Stream<IndexedBlock, TurnGenerationError>;
}

/**
 * Assistant-turn generation kernel service tag.
 *
 * @example
 * ```ts
 * import { AgentTurnKernel } from "@beep/agents-use-cases/public"
 *
 * console.log(AgentTurnKernel)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class AgentTurnKernel extends Context.Service<AgentTurnKernel, AgentTurnKernelShape>()($I`AgentTurnKernel`) {}
