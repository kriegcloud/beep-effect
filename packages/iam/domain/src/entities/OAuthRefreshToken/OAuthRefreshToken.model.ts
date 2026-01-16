import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/OAuthRefreshToken/OAuthRefreshToken.model");

/**
 * OAuthRefreshToken model representing OAuth refresh tokens for token renewal.
 * Maps to the `oauth_refresh_token` table in the database.
 */
export class Model extends M.Class<Model>($I`OAuthRefreshTokenModel`)(
  makeFields(IamEntityIds.OAuthRefreshTokenId, {
    /** Refresh token value (sensitive credential) */
    token: BS.FieldSensitiveOptionOmittable(
      S.NonEmptyString.annotations({
        description: "Refresh token value (sensitive credential)",
      })
    ),

    /** OAuth client identifier */
    clientId: S.NonEmptyString.annotations({
      description: "OAuth client identifier",
    }),

    /** Associated session ID */
    sessionId: BS.FieldOptionOmittable(
      SharedEntityIds.SessionId.annotations({
        description: "Associated session ID",
      })
    ),

    /** Token owner user ID */
    userId: SharedEntityIds.UserId.annotations({
      description: "Token owner user ID",
    }),

    /** External reference ID */
    referenceId: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "External reference ID",
      })
    ),

    /** Token expiration time */
    expiresAt: BS.FieldOptionOmittable(
      BS.DateTimeUtcFromAllAcceptable.annotations({
        description: "Token expiration time",
      })
    ),

    /** Revocation timestamp */
    revoked: BS.FieldOptionOmittable(
      BS.DateTimeUtcFromAllAcceptable.annotations({
        description: "Revocation timestamp",
      })
    ),

    /** Granted scopes */
    scopes: S.Array(S.String).annotations({
      description: "Granted scopes",
    }),
  }),
  $I.annotations("OAuthRefreshTokenModel", {
    title: "OAuth Refresh Token Model",
    description: "OAuth refresh token for token renewal",
  })
) {
  static readonly utils = modelKit(Model);
}
