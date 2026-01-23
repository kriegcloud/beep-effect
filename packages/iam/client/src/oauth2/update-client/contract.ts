/**
 * @fileoverview
 * Update OAuth2 client contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for updating an OAuth2 client.
 * This is an admin endpoint.
 *
 * @module @beep/iam-client/oauth2/update-client/contract
 * @category OAuth2/UpdateClient
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("oauth2/update-client");

/**
 * Update fields for OAuth2 client.
 *
 * @category OAuth2/UpdateClient/Schemas
 * @since 0.1.0
 */
export class UpdateFields extends S.Class<UpdateFields>($I`UpdateFields`)(
  {
    redirect_uris: S.optional(S.mutable(S.Array(S.String))),
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
    grant_types: S.optional(S.mutable(S.Array(S.Literal("authorization_code", "client_credentials", "refresh_token")))),
    response_types: S.optional(S.mutable(S.Array(S.Literal("code")))),
    type: S.optional(S.Literal("web", "native", "user-agent-based")),
  },
  $I.annotations("UpdateFields", {
    description: "Fields that can be updated for an OAuth2 client.",
  })
) {}

/**
 * Payload for updating an OAuth2 client.
 *
 * @example
 * ```typescript
 * import { UpdateClient } from "@beep/iam-client/oauth2"
 *
 * const payload = UpdateClient.Payload.make({
 *   client_id: "my-oauth-client",
 *   update: { client_name: "New Name" }
 * })
 * ```
 *
 * @category OAuth2/UpdateClient/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    client_id: IamEntityIds.OAuthClientId,
    update: UpdateFields,
  },
  formValuesAnnotation({
    client_id: "",
    update: {},
  })
) {}

/**
 * Success response with updated OAuth2 client.
 *
 * @category OAuth2/UpdateClient/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    id: IamEntityIds.OAuthClientId,
    clientId: IamEntityIds.OAuthClientId,
    name: S.String,
    icon: S.NullOr(S.String),
    metadata: S.NullOr(S.Record({ key: S.String, value: S.Unknown })),
    redirectURLs: S.Array(S.String),
    disabled: S.Boolean,
    type: S.Literal("public", "confidential"),
    createdAt: BS.DateFromAllAcceptable,
  },
  $I.annotations("Success", {
    description: "Updated OAuth2 client details.",
  })
) {}

/**
 * Contract wrapper for update OAuth2 client operations.
 *
 * @category OAuth2/UpdateClient/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("UpdateOAuth2Client", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
