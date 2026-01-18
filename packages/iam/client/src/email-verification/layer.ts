/**
 * @fileoverview
 * Layer composition for email verification handlers.
 *
 * Composes email verification handlers into a WrapperGroup and provides the complete layer.
 *
 * @module @beep/iam-client/email-verification/layer
 * @category EmailVerification
 * @since 0.1.0
 */

import { Wrap } from "@beep/wrap";
import { SendVerification } from "./send-verification";

/**
 * Wrapper group containing the send verification wrapper.
 *
 * @example
 * ```typescript
 * import { EmailVerification } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const handlers = EmailVerification.Group.accessHandlers("SendVerification")
 * ```
 *
 * @category EmailVerification/Layers
 * @since 0.1.0
 */
export const Group = Wrap.WrapperGroup.make(SendVerification.Wrapper);

/**
 * Effect layer providing email verification service.
 *
 * @example
 * ```typescript
 * import { EmailVerification } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 * import * as Layer from "effect/Layer"
 *
 * const program = Effect.gen(function* () {
 *   // Email verification handlers available via dependency injection
 * }).pipe(Effect.provide(EmailVerification.layer))
 * ```
 *
 * @category EmailVerification/Layers
 * @since 0.1.0
 */
export const layer = Group.toLayer({
  SendVerification: SendVerification.Handler,
});
