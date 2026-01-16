import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/OAuthConsent/OAuthConsent.model");

/**
 * OAuthConsent model representing user consent grants to OAuth clients.
 * Maps to the `oauth_consent` table in the database.
 */
export class Model extends M.Class<Model>($I`OAuthConsentModel`)(
  makeFields(IamEntityIds.OAuthConsentId, {
    /** OAuth client identifier */
    clientId: S.NonEmptyString.annotations({
      description: "OAuth client identifier",
    }),

    /** Consenting user ID */
    userId: BS.FieldOptionOmittable(
      SharedEntityIds.UserId.annotations({
        description: "Consenting user ID",
      })
    ),

    /** External reference ID */
    referenceId: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "External reference ID",
      })
    ),

    /** Consented scopes */
    scopes: S.Array(S.String).annotations({
      description: "Consented scopes",
    }),
  }),
  $I.annotations("OAuthConsentModel", {
    title: "OAuth Consent Model",
    description: "User consent grant to an OAuth client",
  })
) {
  static readonly utils = modelKit(Model);
}
