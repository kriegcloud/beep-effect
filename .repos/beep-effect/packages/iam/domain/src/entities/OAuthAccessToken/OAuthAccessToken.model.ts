import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/OAuthAccessToken/OAuthAccessToken.model");

/**
 * OAuthAccessToken model representing OAuth access tokens issued to clients.
 * Maps to the `oauth_access_token` table in the database.
 */
export class Model extends M.Class<Model>($I`OAuthAccessTokenModel`)(
  makeFields(IamEntityIds.OAuthAccessTokenId, {
    /** Access token value (sensitive) */
    token: BS.FieldSensitiveOptionOmittable(
      S.String.annotations({
        description: "Access token value",
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
    userId: BS.FieldOptionOmittable(
      SharedEntityIds.UserId.annotations({
        description: "Token owner user ID",
      })
    ),

    /** External reference ID */
    referenceId: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "External reference ID",
      })
    ),

    /** Linked refresh token ID */
    refreshId: BS.FieldOptionOmittable(
      IamEntityIds.OAuthRefreshTokenId.annotations({
        description: "Linked refresh token ID",
      })
    ),

    /** Token expiration time */
    expiresAt: BS.FieldOptionOmittable(
      BS.DateTimeUtcFromAllAcceptable.annotations({
        description: "Token expiration time",
      })
    ),

    /** Granted scopes */
    scopes: S.Array(S.String).annotations({
      description: "Granted scopes",
    }),
  }),
  $I.annotations("OAuthAccessTokenModel", {
    title: "OAuth Access Token Model",
    description: "OAuth access token issued to a client",
  })
) {
  static readonly utils = modelKit(Model);
}
