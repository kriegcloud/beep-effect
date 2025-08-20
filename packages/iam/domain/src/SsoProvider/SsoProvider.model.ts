import {Common, IamEntityIds} from "@beep/shared-domain";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

/**
 * SSO Provider model representing Single Sign-On provider configurations.
 * Maps to the `ssoProvider` table in the database.
 */
export class Model extends M.Class<Model>(`SsoProvider.Model`)({
  /** Primary key identifier for the SSO provider */
  id: M.Generated(IamEntityIds.SsoProviderId),

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
    }),
  ),

  // Default columns include organizationId
  ...Common.defaultColumns,
}) {

}
