/**
 * @fileoverview Username sign-in contract schemas and wrapper definition.
 *
 * Defines the payload and success schemas for username-based authentication.
 * The payload includes username and password fields with validation.
 * The wrapper applies CaptchaMiddleware for bot protection.
 *
 * @module @beep/iam-client/sign-in/username/contract
 * @category SignIn/Username
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("sign-in/username");

/**
 * Payload schema for username-based sign-in authentication.
 *
 * @example
 * ```typescript
 * import { Username } from "@beep/iam-client/sign-in"
 *
 * const payload = Username.Payload.make({
 *   username: "alice",
 *   password: "secure-password"
 * })
 * ```
 *
 * @category SignIn/Username/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    username: S.String,
    password: Common.UserPassword,
  },
  // Default form values use Encoded types (plain strings for Redacted fields, etc.)
  formValuesAnnotation({
    username: "",
    password: "",
  })
) {}

/**
 * Success response schema for username sign-in operations.
 *
 * @example
 * ```typescript
 * import { Username } from "@beep/iam-client/sign-in"
 * import * as S from "effect/Schema"
 *
 * const result = S.decodeUnknownSync(Username.Success)({
 *   redirect: true,
 *   token: null,
 *   url: null,
 *   user: { id: "usr_123", email: "alice@example.com" }
 * })
 * ```
 *
 * @category SignIn/Username/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    redirect: S.optionalWith(S.Boolean, { default: () => true }),
    token: S.optionalWith(S.Redacted(S.String), { as: "Option", nullable: true }),
    url: BS.OptionFromNullishOptionalProperty(BS.URLString, null),
    user: Common.DomainUserFromBetterAuthUser,
  },
  $I.annotations("Success", {
    description: "The success response for signing in with a username and password.",
  })
) {}

/**
 * Username sign-in contract wrapper combining payload, success, and error schemas with captcha middleware.
 *
 * @example
 * ```typescript
 * import { Username } from "@beep/iam-client/sign-in"
 * import * as Effect from "effect/Effect"
 *
 * const handler = Username.Wrapper.implement((payload) =>
 *   Effect.succeed({ redirect: true, token: null, url: null, user: mockUser })
 * )
 * ```
 *
 * @category SignIn/Username/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("Username", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
}).middleware(Common.CaptchaMiddleware);
