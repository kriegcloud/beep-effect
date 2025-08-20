import {Common, IamEntityIds} from "@beep/shared-domain";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

/**
 * OAuth Access Token model representing OAuth 2.0 access tokens.
 * Maps to the `oauth_access_token` table in the database.
 */
export class Model extends M.Class<Model>(`OAuthAccessToken.Model`)(
  {
    /** Primary key identifier for the OAuth access token */
    id: M.Generated(IamEntityIds.OAuthAccessTokenId),

    /** OAuth access token (sensitive) */
    accessToken: M.FieldOption(
      M.Sensitive(
        S.NonEmptyString.annotations({
          description: "The OAuth 2.0 access token",
        }),
      ),
    ),

    /** OAuth refresh token (sensitive) */
    refreshToken: M.FieldOption(
      M.Sensitive(
        S.NonEmptyString.annotations({
          description: "The OAuth 2.0 refresh token",
        }),
      ),
    ),

    /** When the access token expires */
    accessTokenExpiresAt: M.FieldOption(
      Common.DateTimeFromDate({
        description: "When the access token expires",
      }),
    ),

    /** When the refresh token expires */
    refreshTokenExpiresAt: M.FieldOption(
      Common.DateTimeFromDate({
        description: "When the refresh token expires",
      }),
    ),

    /** OAuth client identifier */
    clientId: M.FieldOption(
      S.NonEmptyString.annotations({
        description: "The OAuth client identifier",
      }),
    ),

    /** User the token belongs to */
    userId: M.FieldOption(
      IamEntityIds.UserId.annotations({
        description: "ID of the user this token belongs to",
      }),
    ),

    /** OAuth scopes granted */
    scopes: M.FieldOption(
      S.NonEmptyString.annotations({
        description: "Space-separated list of OAuth scopes",
        examples: ["read write", "profile email", "admin"],
      }),
    ),

    // Default columns include organizationId
    ...Common.defaultColumns,
  },
) {
}