/**
 * Package entry point for `@beep/agents-client`.
 *
 * @packageDocumentation
 * @category clients
 * @since 0.0.0
 */

/**
 * Desktop chat surface atoms backed by the `ChatRpcs` wire contract.
 *
 * @example
 * ```ts
 * import { ChatClient, threadsAtoms } from "@beep/agents-client"
 *
 * console.log(ChatClient, threadsAtoms)
 * ```
 *
 * @category clients
 * @since 0.0.0
 */
export * from "./Chat.atoms.ts";
/**
 * Env-gated client-side OTLP observability layer wired into the atom runtime so
 * the webview's rpc calls carry span context (joined traces).
 *
 * @example
 * ```ts
 * import { ClientObservabilityLive } from "@beep/agents-client"
 *
 * console.log(ClientObservabilityLive)
 * ```
 *
 * @category observability
 * @since 0.0.0
 */
export * from "./ClientObservability.ts";
