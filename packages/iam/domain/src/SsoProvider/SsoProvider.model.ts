import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export const SsoProviderModelSchemaId = Symbol.for("@beep/iam-domain/SsoProviderModel");

/**
 * SSO Provider model representing Single Sign-On provider configurations.
 * Maps to the `ssoProvider` table in the database.
 */
export class Model extends M.Class<Model>(`SsoProviderModel`)(
  makeFields(IamEntityIds.SsoProviderId, {
    /** SSO provider name */
    name: S.NonEmptyString.annotations({
      description: "Name of the SSO provider",
      examples: ["Google Workspace", "Azure AD", "Okta"],
    }),

    /** SSO provider type */
    type: S.Literal("saml", "oidc", "oauth").annotations({
      description: "Type of SSO protocol",
    }),

    /** Whether the provider is enabled */
    enabled: S.Boolean.annotations({
      description: "Whether this SSO provider is currently enabled",
    }),

    /** SSO provider configuration */
    config: S.String.annotations({
      description: "JSON configuration for the SSO provider",
    }),

    /** Metadata for SAML providers */
    metadata: M.FieldOption(
      S.String.annotations({
        description: "XML metadata for SAML providers",
      })
    ),

    organizationId: SharedEntityIds.OrganizationId,
  }),
  {
    title: "SSO Provider Model",
    description: "SSO Provider model representing Single Sign-On provider configurations.",
    schemaId: SsoProviderModelSchemaId,
  }
) {}

export namespace Model {
  export type Type = S.Schema.Type<typeof Model>;
  export type Encoded = S.Schema.Encoded<typeof Model>;
}
