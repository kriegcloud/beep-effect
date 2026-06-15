/**
 * SDK data-transfer contracts for the assistant-turn generation kernel.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AgentsUseCasesId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import type { Turn } from "@beep/agents-domain";

const $I = $AgentsUseCasesId.create("processes/AssistantTurn/AssistantTurn.contracts");

/**
 * The plain-text prompt projection of a single thread item. The kernel consumes
 * a history of these to generate the next assistant turn.
 *
 * @example
 * ```ts
 * import { TurnHistoryItem } from "@beep/agents-use-cases/public"
 *
 * const item = TurnHistoryItem.make({ role: "user", text: "Hello" })
 * console.log(item.role)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TurnHistoryItem extends S.Class<TurnHistoryItem>($I`TurnHistoryItem`)(
  {
    role: S.Literals(["user", "assistant"]),
    text: S.String,
  },
  $I.annote("TurnHistoryItem", {
    description: "Plain-text prompt projection of a thread item consumed by the turn kernel.",
  })
) {}

/**
 * A single assistant block paired with its position in the generated turn.
 * Blocks may be emitted out of order on the wire, so the index restores the
 * persisted order.
 *
 * @example
 * ```ts
 * import type { IndexedBlock } from "@beep/agents-use-cases/public"
 * import { Turn } from "@beep/agents-domain"
 * import * as S from "effect/Schema"
 *
 * const block = S.decodeUnknownSync(Turn.AssistantBlock)({
 *   type: "paragraph",
 *   children: [{ type: "text", text: "Hello" }],
 * })
 * const indexed: IndexedBlock = { index: 0, block }
 * console.log(indexed.index)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface IndexedBlock {
  readonly block: Turn.AssistantBlock;
  readonly index: number;
}
