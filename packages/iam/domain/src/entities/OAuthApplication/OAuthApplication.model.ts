import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/OAuthApplication/OAuthApplication.model");

/**
 * OAuth Application model representing registered OAuth applications.
 * Maps to the `oauth_application` table in the database.
 */
export class Model extends M.Class<Model>($I`OAuthApplicationModel`)(
  makeFields(IamEntityIds.OAuthApplicationId, {
    /** Application name */
    name: BS.FieldOptionOmittable(
      S.NonEmptyString.annotations({
        description: "The OAuth application name",
      })
    ),

    /** Application icon URL */
    icon: BS.FieldOptionOmittable(
      S.String.pipe(S.pattern(/^https?:\/\/.+/)).annotations({
        description: "URL to the application's icon",
      })
    ),

    /** Application metadata */
    metadata: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "JSON metadata for the OAuth application",
      })
    ),

    /** OAuth client ID */
    clientId: BS.FieldOptionOmittable(
      S.NonEmptyString.annotations({
        description: "The OAuth client identifier",
      })
    ),

    /** OAuth client secret (sensitive) */
    clientSecret: BS.FieldSensitiveOptionOmittable(
      S.NonEmptyString.annotations({
        description: "The OAuth client secret",
      })
    ),

    /** Redirect URLs */
    redirectURLs: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "JSON array of allowed redirect URLs",
      })
    ),

    /** Application type */
    type: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Type of OAuth application",
      })
    ),

    /** Whether the application is disabled */
    disabled: BS.BoolWithDefault(false).annotations({
      description: "Whether the OAuth application is disabled",
    }),

    /** User who owns this application */
    userId: BS.FieldOptionOmittable(
      SharedEntityIds.UserId.annotations({
        description: "ID of the user who owns this OAuth application",
      })
    ),
    organizationId: SharedEntityIds.OrganizationId,
  }),
  $I.annotations("OAuthApplicationModel", {
    title: "OAuth Application Model",
    description: "OAuth Application model representing registered OAuth applications.",
  })
) {
  static readonly utils = modelKit(Model);
}
