/**
 * @module userinfo
 *
 * OAuth2/OpenID Connect userinfo endpoint contract.
 * Returns claims about the authenticated user.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/oauth2/userinfo");

/**
 * Success response containing user claims.
 * Follows OpenID Connect Core 1.0 - UserInfo Endpoint.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * Subject - Identifier for the user.
     */
    sub: S.String.annotations({
      description: "Subject - Identifier for the user.",
    }),

    /**
     * User's email address.
     */
    email: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "User's email address.",
    }),

    /**
     * User's full name.
     */
    name: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "User's full name.",
    }),

    /**
     * URL to the user's profile picture.
     */
    picture: S.optionalWith(BS.URLString, { nullable: true }).annotations({
      description: "URL to the user's profile picture.",
    }),

    /**
     * User's given name (first name).
     */
    given_name: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "User's given name (first name).",
    }),

    /**
     * User's family name (last name).
     */
    family_name: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "User's family name (last name).",
    }),

    /**
     * Whether the user's email has been verified.
     */
    email_verified: S.optionalWith(S.Boolean, { nullable: true }).annotations({
      description: "Whether the user's email has been verified.",
    }),

    /**
     * User's preferred username.
     */
    preferred_username: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "User's preferred username.",
    }),

    /**
     * URL of the user's profile page.
     */
    profile: S.optionalWith(BS.URLString, { nullable: true }).annotations({
      description: "URL of the user's profile page.",
    }),

    /**
     * Time the user's information was last updated.
     */
    updated_at: S.optionalWith(S.Number, { nullable: true }).annotations({
      description: "Time the user's information was last updated (Unix timestamp).",
    }),
  },
  $I.annotations("OAuth2UserinfoSuccess", {
    description: "Success response containing OpenID Connect user claims.",
  })
) {}

/**
 * OAuth2/OpenID Connect userinfo endpoint contract.
 *
 * GET /oauth2/userinfo
 *
 * Returns claims about the authenticated user. The access token
 * must be provided in the Authorization header.
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.get("userinfo", "/userinfo")
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to retrieve user information.",
      })
    )
  )
  .addSuccess(Success);
