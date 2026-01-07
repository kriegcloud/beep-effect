import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/OAuthConsent/OAuthConsent.model");

/**
 * OAuth Consent model representing user consent for OAuth applications.
 * Maps to the `oauth_consent` table in the database.
 */
export class Model extends M.Class<Model>($I`OAuthConsentModel`)(
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
  $I.annotations("OAuthConsentModel", {
    title: "OAuth Consent Model",
    description: "OAuth Consent model representing user consent for OAuth applications.",
  })
) {
  static readonly utils = modelKit(Model);
}
