import {Common, IamEntityIds} from "@beep/shared-domain";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

/**
 * OAuth Consent model representing user consent for OAuth applications.
 * Maps to the `oauth_consent` table in the database.
 */
export class Model extends M.Class<Model>(`OAuthConsent.Model`)({
  /** Primary key identifier for the OAuth consent */
  id: M.Generated(IamEntityIds.OAuthConsentId),

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

  // Default columns include organizationId
  ...Common.defaultColumns,
}) {
}
