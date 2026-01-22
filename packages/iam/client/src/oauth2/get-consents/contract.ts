/**
 * @fileoverview
 * List OAuth2 consents contract schemas for the IAM client.
 *
 * Defines the success response schema for listing all consent records for the current user.
 *
 * @module @beep/iam-client/oauth2/get-consents/contract
 * @category OAuth2/GetConsents
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("oauth2/get-consents");

/**
 * OAuth2 consent record schema for list response.
 *
 * @category OAuth2/GetConsents/Schemas
 * @since 0.1.0
 */
export const OAuth2Consent = S.Struct({
  id: S.String,
  userId: S.String,
  clientId: S.String,
  scopes: S.Array(S.String),
  createdAt: BS.DateFromAllAcceptable,
  consentGiven: S.Boolean,
}).annotations(
  $I.annotations("OAuth2Consent", {
    description: "An OAuth2 consent record.",
  })
);

export type OAuth2Consent = S.Schema.Type<typeof OAuth2Consent>;

/**
 * Success response - array of consent records.
 *
 * @category OAuth2/GetConsents/Schemas
 * @since 0.1.0
 */
export const Success = S.Array(OAuth2Consent).annotations(
  $I.annotations("Success", {
    description: "Array of consent records for the current user.",
  })
);

/**
 * Contract wrapper for list OAuth2 consents operations.
 *
 * No payload required - lists all consents for current user.
 *
 * @category OAuth2/GetConsents/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("GetOAuth2Consents", {
  success: Success,
  error: Common.IamError,
});
