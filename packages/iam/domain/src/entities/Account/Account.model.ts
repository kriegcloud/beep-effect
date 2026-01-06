import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export const AccountModelSchemaId = Symbol.for("@beep/iam-domain/AccountModel");

/**
 * Account model representing external OAuth provider accounts linked to users.
 * Maps to the `account` table in the database.
 */

export class Model extends M.Class<Model>(`AccountModel`)(
  makeFields(IamEntityIds.AccountId, {
    /** External account ID from the OAuth provider */
    accountId: S.NonEmptyString.annotations({
      description: "The account identifier from the OAuth provider",
    }),

    /** OAuth provider identifier (e.g., 'google', 'github') */
    providerId: S.NonEmptyString.annotations({
      description: "The OAuth provider identifier",
    }),

    /** Reference to the user this account belongs to */
    userId: SharedEntityIds.UserId.annotations({
      description: "The userId of the user this account belongs to",
    }),

    /** OAuth access token (sensitive) */
    accessToken: BS.FieldSensitiveOptionOmittable(
      S.NonEmptyString.annotations({
        description: "OAuth access token for API calls",
      })
    ),

    /** OAuth refresh token (sensitive) */
    refreshToken: BS.FieldSensitiveOptionOmittable(
      S.NonEmptyString.annotations({
        description: "OAuth refresh token for token renewal",
      })
    ),

    /** OpenID Connect ID token (sensitive) */
    idToken: BS.FieldSensitiveOptionOmittable(
      S.NonEmptyString.annotations({
        description: "OpenID Connect ID token",
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

    /** OAuth scope permissions granted */
    scope: BS.FieldOptionOmittable(
      S.NonEmptyString.annotations({
        description: "OAuth scope permissions",
      })
    ),

    /** Hashed password for credential-based accounts (sensitive) */
    password: BS.FieldOptionOmittable(
      BS.Password.annotations({
        description: "Hashed password for credential providers",
      })
    ),
  }),
  {
    identifier: "AccountModel",
    title: "Account Model",
    description: "Account model representing external OAuth provider accounts linked to users.",
    schemaId: AccountModelSchemaId,
  }
) {
  static readonly utils = modelKit(Model);
}
