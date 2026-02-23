import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

/**
 * OAuth Access Token model representing OAuth 2.0 access tokens.
 * Maps to the `oauth_access_token` table in the database.
 */
export class Model extends M.Class<Model>(`OAuthAccessTokenModel`)(
  makeFields(IamEntityIds.OAuthAccessTokenId, {
    /** OAuth access token (sensitive) */
    accessToken: BS.FieldSensitiveOptionOmittable(
      S.NonEmptyString.annotations({
        description: "The OAuth 2.0 access token",
      })
    ),

    /** OAuth refresh token (sensitive) */
    refreshToken: BS.FieldSensitiveOptionOmittable(
      S.NonEmptyString.annotations({
        description: "The OAuth 2.0 refresh token",
      })
    ),

    /** When the access token expires */
    accessTokenExpiresAt: BS.FieldOptionOmittable(
      BS.DateTimeUtcFromAllAcceptable.annotations({
        description: "When the access token expires",
      })
    ),

    /** When the refresh token expires */
    refreshTokenExpiresAt: BS.FieldOptionOmittable(
      BS.DateTimeUtcFromAllAcceptable.annotations({
        description: "When the refresh token expires",
      })
    ),

    /** OAuth client identifier */
    clientId: BS.FieldOptionOmittable(
      S.NonEmptyString.annotations({
        description: "The OAuth client identifier",
      })
    ),

    /** User the token belongs to */
    userId: BS.FieldOptionOmittable(
      SharedEntityIds.UserId.annotations({
        description: "ID of the user this token belongs to",
      })
    ),

    /** OAuth scopes granted */
    scopes: BS.FieldOptionOmittable(
      S.NonEmptyString.annotations({
        description: "Space-separated list of OAuth scopes",
        examples: ["read write", "profile email", "admin"],
      })
    ),
    organizationId: SharedEntityIds.OrganizationId,
  }),
  {
    title: "OAuth Access Token Model",
    description: "OAuth Access Token model representing OAuth 2.0 access tokens.",
    schemaId: Symbol.for("@beep/iam-domain/entities/OAuthAccessTokenModel"),
  }
) {
  static readonly utils = modelKit(Model);
}
