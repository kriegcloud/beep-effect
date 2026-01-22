/**
 * @fileoverview
 * Link social account handler implementation.
 *
 * Implements the link social contract using Better Auth's client and notifies
 * session watchers via `$sessionSignal` after successful linking.
 *
 * @module @beep/iam-client/core/link-social/handler
 * @category Core/LinkSocial
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Link social handler that connects a social provider to the current user's account.
 *
 * Calls Better Auth's linkSocial method, validates the response, and notifies
 * session watchers via `$sessionSignal` after successful linking.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { LinkSocial } from "@beep/iam-client/core"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* LinkSocial.Handler({ provider: "google" })
 *   if (result.url) {
 *     window.location.href = result.url
 *   }
 * })
 * ```
 *
 * @category Core/LinkSocial/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encodedPayload) => client.linkSocial(encodedPayload))
);
