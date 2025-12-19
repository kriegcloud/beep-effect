/**
 * @module get-access-token
 *
 * Domain contract for retrieving an OAuth access token.
 *
 * @category API/V1/Core
 * @since 0.1.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/core/get-access-token");

/**
 * Payload for retrieving an OAuth access token.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The provider ID for the OAuth provider.
     */
    providerId: S.NonEmptyString.annotations({
      description: "The provider ID for the OAuth provider.",
    }),

    /**
     * The account ID associated with the access token.
     */
    accountId: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The account ID associated with the access token.",
    }),

    /**
     * The user ID associated with the account.
     */
    userId: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The user ID associated with the account.",
    }),
  },
  $I.annotations("GetAccessTokenPayload", {
    description: "Payload for retrieving an OAuth access token.",
  })
) {}

/**
 * Success response after retrieving an OAuth access token.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * The token type (e.g., "Bearer").
     */
    tokenType: S.optionalWith(S.String, { as: "Option", nullable: true }).annotations({
      description: "The token type (e.g., Bearer).",
    }),

    /**
     * The OpenID Connect ID token.
     */
    idToken: S.optionalWith(S.String, { as: "Option", nullable: true }).annotations({
      description: "The OpenID Connect ID token.",
    }),

    /**
     * The access token for API requests.
     */
    accessToken: S.optionalWith(S.String, { as: "Option", nullable: true }).annotations({
      description: "The access token for API requests.",
    }),

    /**
     * The refresh token for obtaining new access tokens.
     */
    refreshToken: S.optionalWith(S.String, { as: "Option", nullable: true }).annotations({
      description: "The refresh token for obtaining new access tokens.",
    }),

    /**
     * When the access token expires.
     */
    accessTokenExpiresAt: S.optionalWith(BS.DateTimeUtcFromAllAcceptable, {
      as: "Option",
      nullable: true,
    }).annotations({
      description: "When the access token expires.",
    }),

    /**
     * When the refresh token expires.
     */
    refreshTokenExpiresAt: S.optionalWith(BS.DateTimeUtcFromAllAcceptable, {
      as: "Option",
      nullable: true,
    }).annotations({
      description: "When the refresh token expires.",
    }),
  },
  $I.annotations("GetAccessTokenSuccess", {
    description: "Success response after retrieving an OAuth access token.",
  })
) {}

/**
 * Get access token endpoint contract.
 *
 * POST /get-access-token
 *
 * Retrieves the OAuth access token for a linked account.
 *
 * @since 0.1.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("get-access-token", "/get-access-token")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to retrieve the access token.",
      })
    )
  )
  .addSuccess(Success);
