import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export const OAuthConsentModelSchemaId = Symbol.for("@beep/iam-domain/OAuthConsentModel");

/**
 * OAuth Consent model representing user consent for OAuth applications.
 * Maps to the `oauth_consent` table in the database.
 */
export class Model extends M.Class<Model>(`OAuthConsentModel`)(
  makeFields(IamEntityIds.OAuthConsentId, {
    /** User who gave consent */
    userId: IamEntityIds.UserId.annotations({
      description: "ID of the user who gave consent",
    }),

    /** OAuth application receiving consent */
    clientId: S.NonEmptyString.annotations({
      description: "OAuth client ID that received consent",
    }),

    /** Scopes granted by the user */
    scopes: S.NonEmptyString.annotations({
      description: "Space-separated list of granted OAuth scopes",
    }),

    /** Whether consent was given */
    consentGiven: S.Boolean.annotations({
      description: "Whether the user gave consent for the requested scopes",
    }),

    organizationId: SharedEntityIds.OrganizationId,
  }),
  {
    title: "OAuth Consent Model",
    description: "OAuth Consent model representing user consent for OAuth applications.",
    schemaId: OAuthConsentModelSchemaId,
  }
) {}

export namespace Model {
  export type Type = S.Schema.Type<typeof Model>;
  export type Encoded = S.Schema.Encoded<typeof Model>;
}
