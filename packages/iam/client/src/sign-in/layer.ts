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
import { Anonymous } from "./anonymous";
import { Email } from "./email";
import { OAuth2 } from "./oauth2";
import { Passkey } from "./passkey";
import { PhoneNumber } from "./phone-number";
import { Social } from "./social";
import { Sso } from "./sso";
import { Username } from "./username";

/**
 * Wrapper group combining all sign-in wrappers.
 *
 * @example
 * ```typescript
 * import { SignIn } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const handlers = SignIn.Group.accessHandlers("Email", "Username", "SignInSso")
 * ```
 *
 * @category SignIn/Layers
 * @since 0.1.0
 */
export const Group = Wrap.WrapperGroup.make(
  Email.Wrapper,
  Username.Wrapper,
  Sso.Wrapper,
  Passkey.Wrapper,
  PhoneNumber.Wrapper,
  Social.Wrapper,
  OAuth2.Wrapper,
  Anonymous.Wrapper
);

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
  SignInSso: Sso.Handler,
  SignInPasskey: Passkey.Handler,
  SignInPhoneNumber: PhoneNumber.Handler,
  SignInSocial: Social.Handler,
  SignInOAuth2: OAuth2.Handler,
  SignInAnonymous: Anonymous.Handler,
}).pipe(Layer.provide(ReCaptcha.ReCaptchaLive));
