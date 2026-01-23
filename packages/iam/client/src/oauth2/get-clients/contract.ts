/**
 * @fileoverview
 * List OAuth2 clients contract schemas for the IAM client.
 *
 * Defines the success response schema for listing all OAuth2 clients.
 * This is an admin endpoint.
 *
 * @module @beep/iam-client/oauth2/get-clients/contract
 * @category OAuth2/GetClients
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("oauth2/get-clients");

/**
 * OAuth2 client schema for list response.
 *
 * @category OAuth2/GetClients/Schemas
 * @since 0.1.0
 */
export const OAuth2Client = S.Struct({
  id: IamEntityIds.OAuthClientId,
  clientId: IamEntityIds.OAuthClientId,
  name: S.String,
  icon: S.NullOr(S.String),
  metadata: S.NullOr(S.Record({ key: S.String, value: S.Unknown })),
  redirectURLs: S.Array(S.String),
  disabled: S.Boolean,
  type: S.Literal("public", "confidential"),
  createdAt: BS.DateFromAllAcceptable,
}).annotations(
  $I.annotations("OAuth2Client", {
    description: "An OAuth2 client application.",
  })
);

export type OAuth2Client = S.Schema.Type<typeof OAuth2Client>;

/**
 * Success response - array of OAuth2 clients.
 *
 * @category OAuth2/GetClients/Schemas
 * @since 0.1.0
 */
export const Success = S.Array(OAuth2Client).annotations(
  $I.annotations("Success", {
    description: "Array of registered OAuth2 clients.",
  })
);

/**
 * Contract wrapper for list OAuth2 clients operations.
 *
 * No payload required - lists all OAuth2 clients (admin only).
 *
 * @category OAuth2/GetClients/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("GetOAuth2Clients", {
  success: Success,
  error: Common.IamError,
});
