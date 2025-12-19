/**
 * @module register
 *
 * OAuth2 dynamic client registration endpoint contract.
 * Registers a new OAuth2 client application.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/oauth2/register");

/**
 * Payload for dynamic client registration.
 * Follows RFC 7591 - OAuth 2.0 Dynamic Client Registration Protocol.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * Array of redirect URIs for the client.
     */
    redirect_uris: S.mutable(S.Array(S.String)).annotations({
      description: "Array of redirect URIs for the client.",
    }),

    /**
     * Authentication method for the token endpoint.
     */
    token_endpoint_auth_method: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "Authentication method for the token endpoint.",
    }),

    /**
     * Grant types the client will use.
     */
    grant_types: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "Grant types the client will use.",
    }),

    /**
     * Response types the client will use.
     */
    response_types: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "Response types the client will use.",
    }),

    /**
     * Human-readable name of the client.
     */
    client_name: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "Human-readable name of the client.",
    }),

    /**
     * URL of the client's home page.
     */
    client_uri: S.optionalWith(BS.URLString, { nullable: true }).annotations({
      description: "URL of the client's home page.",
    }),

    /**
     * URL of the client's logo.
     */
    logo_uri: S.optionalWith(BS.URLString, { nullable: true }).annotations({
      description: "URL of the client's logo.",
    }),

    /**
     * Space-separated list of scopes the client can request.
     */
    scope: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "Space-separated list of scopes the client can request.",
    }),

    /**
     * Contact email addresses for the client.
     */
    contacts: S.optionalWith(S.mutable(S.Array(S.String)), { nullable: true }).annotations({
      description: "Contact email addresses for the client.",
    }),

    /**
     * URL to the client's terms of service.
     */
    tos_uri: S.optionalWith(BS.URLString, { nullable: true }).annotations({
      description: "URL to the client's terms of service.",
    }),

    /**
     * URL to the client's privacy policy.
     */
    policy_uri: S.optionalWith(BS.URLString, { nullable: true }).annotations({
      description: "URL to the client's privacy policy.",
    }),

    /**
     * URL to the client's JSON Web Key Set.
     */
    jwks_uri: S.optionalWith(BS.URLString, { nullable: true }).annotations({
      description: "URL to the client's JSON Web Key Set.",
    }),

    /**
     * Client's JSON Web Key Set (inline).
     */
    jwks: S.optionalWith(S.Unknown, { nullable: true }).annotations({
      description: "Client's JSON Web Key Set (inline).",
    }),

    /**
     * Additional client metadata.
     */
    metadata: S.optionalWith(S.Unknown, { nullable: true }).annotations({
      description: "Additional client metadata.",
    }),

    /**
     * Unique identifier for the software this client represents.
     */
    software_id: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "Unique identifier for the software this client represents.",
    }),

    /**
     * Version of the software this client represents.
     */
    software_version: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "Version of the software this client represents.",
    }),

    /**
     * Signed JWT containing client metadata.
     */
    software_statement: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "Signed JWT containing client metadata.",
    }),
  },
  $I.annotations("OAuth2RegisterPayload", {
    description: "Payload for OAuth2 dynamic client registration.",
  })
) {}

/**
 * Success response containing the registered client information.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * Human-readable name of the client.
     */
    name: S.String.annotations({
      description: "Human-readable name of the client.",
    }),

    /**
     * URL to the client's icon/logo.
     */
    icon: S.optionalWith(BS.URLString, { nullable: true }).annotations({
      description: "URL to the client's icon/logo.",
    }),

    /**
     * Additional client metadata.
     */
    metadata: S.optionalWith(S.Unknown, { nullable: true }).annotations({
      description: "Additional client metadata.",
    }),

    /**
     * The issued client identifier.
     */
    clientId: S.String.annotations({
      description: "The issued client identifier.",
    }),

    /**
     * The issued client secret.
     */
    clientSecret: S.String.annotations({
      description: "The issued client secret.",
    }),

    /**
     * Array of registered redirect URLs.
     */
    redirectURLs: S.mutable(S.Array(BS.URLString)).annotations({
      description: "Array of registered redirect URLs.",
    }),

    /**
     * The client type (e.g., 'confidential', 'public').
     */
    type: S.String.annotations({
      description: "The client type (e.g., 'confidential', 'public').",
    }),

    /**
     * The authentication scheme used by the client.
     */
    authenticationScheme: S.String.annotations({
      description: "The authentication scheme used by the client.",
    }),

    /**
     * Whether the client is disabled.
     */
    disabled: S.Boolean.annotations({
      description: "Whether the client is disabled.",
    }),

    /**
     * The user ID who owns this client (if applicable).
     */
    userId: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "The user ID who owns this client (if applicable).",
    }),

    /**
     * When the client was created.
     */
    createdAt: BS.DateTimeUtcFromAllAcceptable.annotations({
      description: "When the client was created.",
    }),

    /**
     * When the client was last updated.
     */
    updatedAt: BS.DateTimeUtcFromAllAcceptable.annotations({
      description: "When the client was last updated.",
    }),
  },
  $I.annotations("OAuth2RegisterSuccess", {
    description: "Success response containing the registered OAuth2 client information.",
  })
) {}

/**
 * OAuth2 dynamic client registration endpoint contract.
 *
 * POST /oauth2/register
 *
 * Dynamically registers a new OAuth2 client application following
 * RFC 7591 - OAuth 2.0 Dynamic Client Registration Protocol.
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("register", "/register")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to register the client.",
      })
    )
  )
  .addSuccess(Success);
