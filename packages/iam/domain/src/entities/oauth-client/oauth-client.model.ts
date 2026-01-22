import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/OAuthClient/OAuthClient.model");

/**
 * OAuthClient model representing OAuth client application registrations.
 * Maps to the `oauth_client` table in the database.
 */
export class Model extends M.Class<Model>($I`OAuthClientModel`)(
  makeFields(IamEntityIds.OAuthClientId, {
    /** Public client identifier per OAuth spec */
    clientId: S.NonEmptyString.annotations({
      description: "Public client identifier",
    }),

    /** Hashed client secret (sensitive) */
    clientSecret: BS.FieldSensitiveOptionOmittable(
      S.NonEmptyString.annotations({
        description: "Hashed client secret",
      })
    ),

    /** Whether client is disabled */
    disabled: BS.BoolWithDefault(false).annotations({
      description: "Whether client is disabled",
    }),

    /** Skip consent screen */
    skipConsent: BS.FieldOptionOmittable(
      S.Boolean.annotations({
        description: "Skip consent screen",
      })
    ),

    /** Enable end session endpoint */
    enableEndSession: BS.FieldOptionOmittable(
      S.Boolean.annotations({
        description: "Enable end session endpoint",
      })
    ),

    /** Allowed scopes */
    scopes: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Allowed scopes",
      })
    ),

    /** Owner user ID */
    userId: BS.FieldOptionOmittable(
      SharedEntityIds.UserId.annotations({
        description: "Owner user ID",
      })
    ),

    /** Display name */
    name: BS.FieldOptionOmittable(
      S.NonEmptyString.annotations({
        description: "Display name",
      })
    ),

    /** Client URI */
    uri: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Client URI",
      })
    ),

    /** Icon URL */
    icon: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Icon URL",
      })
    ),

    /** Contact emails */
    contacts: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Contact emails",
      })
    ),

    /** Terms of service URL */
    tos: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Terms of service URL",
      })
    ),

    /** Privacy policy URL */
    policy: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Privacy policy URL",
      })
    ),

    /** Software identifier */
    softwareId: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Software identifier",
      })
    ),

    /** Software version */
    softwareVersion: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Software version",
      })
    ),

    /** Software statement JWT */
    softwareStatement: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Software statement JWT",
      })
    ),

    /** Redirect URIs */
    redirectUris: S.Array(S.String).annotations({
      description: "Redirect URIs",
    }),

    /** Post-logout redirect URIs */
    postLogoutRedirectUris: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Post-logout redirect URIs",
      })
    ),

    /** Token endpoint auth method */
    tokenEndpointAuthMethod: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Token endpoint auth method",
      })
    ),

    /** Allowed grant types */
    grantTypes: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Allowed grant types",
      })
    ),

    /** Allowed response types */
    responseTypes: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Allowed response types",
      })
    ),

    /** Public client flag */
    public: BS.FieldOptionOmittable(
      S.Boolean.annotations({
        description: "Public client flag",
      })
    ),

    /** Client type */
    type: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Client type",
      })
    ),

    /** External reference ID */
    referenceId: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "External reference ID",
      })
    ),

    /** Custom metadata */
    metadata: BS.FieldOptionOmittable(
      S.Unknown.annotations({
        description: "Custom metadata",
      })
    ),
  }),
  $I.annotations("OAuthClientModel", {
    title: "OAuth Client Model",
    description: "OAuth client application registration",
  })
) {
  static readonly utils = modelKit(Model);
}
