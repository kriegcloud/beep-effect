/**
 * @fileoverview Phone number sign-in endpoint contract.
 *
 * Allows users to authenticate using their phone number and password.
 *
 * @category IAM API
 * @subcategory Sign In
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * import { V1 } from "@beep/iam-domain/api";
 *
 * const payload = V1.SignIn.PhoneNumber.Payload.make({
 *   phoneNumber: "+1234567890",
 *   password: "secret",
 *   rememberMe: true,
 * });
 * ```
 *
 * @see {@link https://www.better-auth.com/docs/plugins/phone-number | Better Auth Phone Number Plugin}
 */
import { CommonFields, CommonHeaders, IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { Session, User } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/sign-in/phone-number");

// TODO: Define PhoneNumber schema in CommonFields or @beep/schema
// For now using placeholder S.String with annotations

/**
 * Request payload for phone number sign-in.
 *
 * @since 1.0.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /** Phone number to sign in with (E.164 format recommended, e.g., "+1234567890") */
    phoneNumber: S.String.annotations({
      description: 'Phone number to sign in. Eg: "+1234567890"',
      // TODO: Add phone number validation schema
    }),
    /** Password for the account */
    password: CommonFields.UserPassword,
    /** Whether to extend session duration */
    rememberMe: CommonFields.RememberMe,
  },
  $I.annotations("SignInPhoneNumberPayload", {
    description: "Sign in with phone number and password.",
  })
) {}

/**
 * Success response for phone number sign-in.
 *
 * @since 1.0.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /** The authenticated user */
    user: User.Model,
    /** The user's session */
    session: Session.Model,
  },
  $I.annotations("SignInPhoneNumberSuccess", {
    description: "Phone number sign-in success response containing user and session.",
  })
) {}

/**
 * Phone number sign-in endpoint contract.
 *
 * POST /sign-in/phone-number
 *
 * Authenticates a user using their phone number and password.
 *
 * @since 1.0.0
 */
export const Contract = HttpApiEndpoint.post("phoneNumber", "/phone-number")
  .setPayload(Payload)
  .addSuccess(Success)
  .setHeaders(CommonHeaders.CaptchaRequestHeaders)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to sign in with phone number.",
      })
    )
  );
