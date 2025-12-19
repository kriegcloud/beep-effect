/**
 * @fileoverview Anonymous sign-in endpoint contract.
 *
 * Allows users to authenticate without providing credentials. Creates a temporary
 * anonymous user session that can later be upgraded to a full account.
 *
 * @category IAM API
 * @subcategory Sign In
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * import { V1 } from "@beep/iam-domain/api";
 *
 * // No payload required for anonymous sign-in
 * const response: V1.SignIn.Anonymous.Success = {
 *   user: { ... },
 *   session: { ... },
 * };
 * ```
 *
 * @see {@link https://www.better-auth.com/docs/plugins/anonymous | Better Auth Anonymous Plugin}
 */
import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { Session, User } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/sign-in/anonymous");

// TODO: Verify if anonymous sign-in requires any optional payload fields
// Currently implementing as no-payload endpoint per spec

/**
 * Success response for anonymous sign-in.
 *
 * Returns the newly created anonymous user and their session.
 *
 * @since 1.0.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /** The anonymous user that was created */
    user: User.Model,
    /** The session for the anonymous user */
    session: Session.Model,
  },
  $I.annotations("SignInAnonymousSuccess", {
    description: "Anonymous sign-in success response containing user and session.",
  })
) {}

/**
 * Anonymous sign-in endpoint contract.
 *
 * POST /sign-in/anonymous
 *
 * Creates a new anonymous user and session without requiring credentials.
 * The anonymous user can later link social accounts or set credentials to
 * upgrade to a full account.
 *
 * @since 1.0.0
 */
export const Contract = HttpApiEndpoint.post("anonymous", "/anonymous")
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to sign in anonymously.",
      })
    )
  );
