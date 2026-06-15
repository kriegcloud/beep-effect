/**
 * Agents server test surface.
 *
 * @packageDocumentation
 * @category testing
 * @since 0.0.0
 */

import { initialScanState } from "./AssistantTurn/index.ts";

/**
 * Deterministic seed scan state re-exported for tests and fixtures.
 *
 * @example
 * ```ts
 * import { AgentsServerInitialScanState } from "@beep/agents-server/test"
 *
 * console.log(AgentsServerInitialScanState)
 * ```
 *
 * @category testing
 * @since 0.0.0
 */
export const AgentsServerInitialScanState = initialScanState;
