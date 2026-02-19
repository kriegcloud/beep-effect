import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
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
    userId: BS.FieldOptionOmittable(
      SharedEntityIds.UserId.annotations({
        description: "ID of the user who gave consent",
      })
    ),

    /** OAuth application receiving consent */
    clientId: S.NonEmptyString.annotations({
      description: "OAuth client ID that received consent",
    }),

    /** Scopes granted by the user */
    scopes: S.NonEmptyString.annotations({
      description: "Space-separated list of granted OAuth scopes",
    }),

    /** Whether consent was given */
    consentGiven: BS.BoolWithDefault(false).annotations({
      description: "Whether the user gave consent for the requested scopes",
    }),

    organizationId: SharedEntityIds.OrganizationId,
  }),
  {
    title: "OAuth Consent Model",
    description: "OAuth Consent model representing user consent for OAuth applications.",
    schemaId: OAuthConsentModelSchemaId,
  }
) {
  static readonly utils = modelKit(Model);
}
