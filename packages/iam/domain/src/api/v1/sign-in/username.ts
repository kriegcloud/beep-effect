/**
 * @fileoverview Username sign-in endpoint contract.
 *
 * Allows users to authenticate using their username and password.
 *
 * @category IAM API
 * @subcategory Sign In
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * import { V1 } from "@beep/iam-domain/api";
 *
 * const payload = V1.SignIn.Username.Payload.make({
 *   username: "johndoe",
 *   password: "secret",
 *   rememberMe: true,
 * });
 * ```
 *
 * @see {@link https://www.better-auth.com/docs/plugins/username | Better Auth Username Plugin}
 */
import { CommonFields, CommonHeaders, IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { User } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/sign-in/username");

// TODO: Define Username schema in CommonFields or @beep/schema
// For now using placeholder S.String with annotations

/**
 * Request payload for username sign-in.
 *
 * @since 1.0.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /** The username of the user */
    username: S.String.annotations({
      description: "The username of the user",
      // TODO: Add username validation schema (min/max length, allowed chars)
    }),
    /** Password for the account */
    password: CommonFields.UserPassword,
    /** Whether to extend session duration */
    rememberMe: CommonFields.RememberMe,
    /** Callback URL to redirect to after email verification */
    callbackURL: CommonFields.CallbackURL,
  },
  $I.annotations("SignInUsernamePayload", {
    description: "Sign in with username and password.",
  })
) {}

/**
 * Success response for username sign-in.
 *
 * @since 1.0.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /** Session token for the authenticated session */
    token: CommonFields.SessionToken,
    /** The authenticated user */
    user: User.Model,
  },
  $I.annotations("SignInUsernameSuccess", {
    description: "Username sign-in success response containing token and user.",
  })
) {}

/**
 * Username sign-in endpoint contract.
 *
 * POST /sign-in/username
 *
 * Authenticates a user using their username and password.
 *
 * @since 1.0.0
 */
export const Contract = HttpApiEndpoint.post("username", "/username")
  .setPayload(Payload)
  .setHeaders(CommonHeaders.CaptchaRequestHeaders)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to sign in with username.",
      })
    )
  );
