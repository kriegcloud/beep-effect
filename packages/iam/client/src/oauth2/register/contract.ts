/**
 * @fileoverview
 * Register OAuth2 client contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for dynamic client registration (RFC 7591).
 *
 * @module @beep/iam-client/oauth2/register/contract
 * @category OAuth2/Register
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("oauth2/register");

/**
 * Payload for registering a new OAuth2 client.
 *
 * @example
 * ```typescript
 * import { Register } from "@beep/iam-client/oauth2"
 *
 * const payload = Register.Payload.make({
 *   redirect_uris: ["https://myapp.com/callback"],
 *   client_name: "My Application",
 *   type: "web"
 * })
 * ```
 *
 * @category OAuth2/Register/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    redirect_uris: S.mutable(S.Array(S.String)),
    scope: S.optional(S.String),
    client_name: S.optional(S.String),
    client_uri: S.optional(S.String),
    logo_uri: S.optional(S.String),
    contacts: S.optional(S.mutable(S.Array(S.String))),
    tos_uri: S.optional(S.String),
    policy_uri: S.optional(S.String),
    software_id: S.optional(S.String),
    software_version: S.optional(S.String),
    software_statement: S.optional(S.String),
    post_logout_redirect_uris: S.optional(S.mutable(S.Array(S.String))),
    token_endpoint_auth_method: S.optional(S.Literal("client_secret_basic", "client_secret_post", "none")),
    grant_types: S.optional(S.mutable(S.Array(S.Literal("authorization_code", "client_credentials", "refresh_token")))),
    response_types: S.optional(S.mutable(S.Array(S.Literal("code")))),
    type: S.optional(S.Literal("web", "native", "user-agent-based")),
  },
  formValuesAnnotation({
    redirect_uris: [],
    scope: undefined,
    client_name: undefined,
    client_uri: undefined,
    logo_uri: undefined,
    contacts: undefined,
    tos_uri: undefined,
    policy_uri: undefined,
    software_id: undefined,
    software_version: undefined,
    software_statement: undefined,
    post_logout_redirect_uris: undefined,
    token_endpoint_auth_method: undefined,
    grant_types: undefined,
    response_types: undefined,
    type: undefined,
  })
) {}

/**
 * Success response with registered OAuth2 client credentials.
 *
 * Note: The client secret (for confidential clients) is only shown once.
 *
 * @category OAuth2/Register/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    id: IamEntityIds.OAuthClientId,
    clientId: IamEntityIds.OAuthClientId,
    clientSecret: S.optional(S.Redacted(S.String)),
    name: S.String,
    icon: S.NullOr(S.String),
    metadata: S.NullOr(S.Record({ key: S.String, value: S.Unknown })),
    redirectURLs: S.Array(S.String),
    disabled: S.Boolean,
    type: S.Literal("public", "confidential"),
    createdAt: BS.DateFromAllAcceptable,
  },
  $I.annotations("Success", {
    description: "Registered OAuth2 client with credentials.",
  })
) {}

/**
 * Contract wrapper for register OAuth2 client operations.
 *
 * @category OAuth2/Register/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("RegisterOAuth2Client", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
