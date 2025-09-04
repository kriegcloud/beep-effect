import { BS } from "@beep/schema";
import { Common, IamEntityIds } from "@beep/shared-domain";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export const AccountModelSchemaId = Symbol.for("@beep/iam-domain/AccountModel");

/**
 * Account model representing external OAuth provider accounts linked to users.
 * Maps to the `account` table in the database.
 */

export class Model extends M.Class<Model>(`AccountModel`)(
  {
    /** Primary key identifier for the account */
    id: M.Generated(IamEntityIds.AccountId),

    /** External account ID from the OAuth provider */
    accountId: S.NonEmptyString.annotations({
      description: "The account identifier from the OAuth provider",
    }),

    /** OAuth provider identifier (e.g., 'google', 'github') */
    providerId: S.NonEmptyString.annotations({
      description: "The OAuth provider identifier",
    }),

    /** Reference to the user this account belongs to */
    userId: IamEntityIds.UserId.annotations({
      description: "The userId of the user this account belongs to",
    }),

    /** OAuth access token (sensitive) */
    accessToken: M.FieldOption(
      M.Sensitive(
        S.NonEmptyString.annotations({
          description: "OAuth access token for API calls",
        })
      )
    ),

    /** OAuth refresh token (sensitive) */
    refreshToken: M.FieldOption(
      M.Sensitive(
        S.NonEmptyString.annotations({
          description: "OAuth refresh token for token renewal",
        })
      )
    ),

    /** OpenID Connect ID token (sensitive) */
    idToken: M.FieldOption(
      M.Sensitive(
        S.NonEmptyString.annotations({
          description: "OpenID Connect ID token",
        })
      )
    ),

    /** When the access token expires */
    accessTokenExpiresAt: M.FieldOption(
      Common.DateTimeFromDate({
        description: "When the access token expires",
      })
    ),

    /** When the refresh token expires */
    refreshTokenExpiresAt: M.FieldOption(
      Common.DateTimeFromDate({
        description: "When the refresh token expires",
      })
    ),

    /** OAuth scope permissions granted */
    scope: M.FieldOption(
      S.NonEmptyString.annotations({
        description: "OAuth scope permissions",
      })
    ),

    /** Hashed password for credential-based accounts (sensitive) */
    password: M.FieldOption(
      M.Sensitive(
        BS.Password.annotations({
          description: "Hashed password for credential providers",
        })
      )
    ),

    // Audit and tracking columns
    ...Common.globalColumns,
  },
  {
    title: "Account Model",
    description: "Account model representing external OAuth provider accounts linked to users.",
    schemaId: AccountModelSchemaId,
  }
) {}

export namespace Model {
  export type Type = S.Schema.Type<typeof Model>;
  export type Encoded = S.Schema.Encoded<typeof Model>;
}
