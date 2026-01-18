/**
 * @fileoverview
 * Layer composition for sign-in handlers with ReCaptcha middleware.
 *
 * Composes sign-in handlers into a WrapperGroup and provides the complete layer
 * with ReCaptcha integration for secure authentication.
 *
 * @module @beep/iam-client/sign-in/layer
 * @category SignIn
 * @since 0.1.0
 */

import { ReCaptcha } from "@beep/shared-client";
import { Wrap } from "@beep/wrap";
import * as Layer from "effect/Layer";
import { Email } from "./email";
import { Username } from "./username";

/**
 * Wrapper group combining email and username sign-in wrappers.
 *
 * @example
 * ```typescript
 * import { SignIn } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const handlers = SignIn.Group.accessHandlers("Email", "Username")
 * ```
 *
 * @category SignIn/Layers
 * @since 0.1.0
 */
export const Group = Wrap.WrapperGroup.make(Email.Wrapper, Username.Wrapper);

/**
 * Effect layer providing sign-in service with ReCaptcha middleware.
 *
 * @example
 * ```typescript
 * import { SignIn } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 * import * as Layer from "effect/Layer"
 *
 * const program = Effect.gen(function* () {
 *   // Sign-in handlers available via dependency injection
 * }).pipe(Effect.provide(SignIn.layer))
 * ```
 *
 * @category SignIn/Layers
 * @since 0.1.0
 */
export const layer = Group.toLayer({
  Email: Email.Handler,
  Username: Username.Handler,
}).pipe(Layer.provide(ReCaptcha.ReCaptchaLive));
