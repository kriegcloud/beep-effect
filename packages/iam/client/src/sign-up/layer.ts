/**
 * @fileoverview Sign-up layer composition.
 *
 * Composes sign-up handlers into a WrapperGroup and provides the complete layer
 * with ReCaptcha integration for secure user registration.
 *
 * @module @beep/iam-client/sign-up/layer
 * @category SignUp
 * @since 0.1.0
 */

import { ReCaptcha } from "@beep/shared-client";
import { Wrap } from "@beep/wrap";
import * as Layer from "effect/Layer";
import { Email } from "./email";

/**
 * WrapperGroup containing all sign-up handlers.
 *
 * @example
 * ```typescript
 * import { Group } from "@beep/iam-client/sign-up"
 * import * as Effect from "effect/Effect"
 *
 * const handlers = Group.accessHandlers("Email")
 * ```
 *
 * @category SignUp/Layers
 * @since 0.1.0
 */
export const Group = Wrap.WrapperGroup.make(Email.Wrapper);

/**
 * Complete sign-up layer with ReCaptcha integration.
 *
 * Provides all sign-up handlers with required dependencies including ReCaptcha
 * for secure user registration.
 *
 * @example
 * ```typescript
 * import { layer } from "@beep/iam-client/sign-up"
 * import * as Effect from "effect/Effect"
 * import * as Layer from "effect/Layer"
 *
 * const program = Effect.gen(function* () {
 *   // sign-up operations here
 * }).pipe(Effect.provide(layer))
 * ```
 *
 * @category SignUp/Layers
 * @since 0.1.0
 */
export const layer = Group.toLayer({
  Email: Email.Handler,
}).pipe(Layer.provide(ReCaptcha.ReCaptchaLive));
