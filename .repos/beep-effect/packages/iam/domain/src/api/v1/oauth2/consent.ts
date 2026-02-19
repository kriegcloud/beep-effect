/**
 * @module consent
 *
 * OAuth2 consent endpoint contract.
 * Handles user consent for OAuth2 authorization requests.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/oauth2/consent");

/**
 * Payload for the consent endpoint.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * Whether the user accepted or denied the authorization request.
     */
    accept: S.Boolean.annotations({
      description: "Whether the user accepted or denied the authorization request.",
    }),

    /**
     * The consent code from the authorization request.
     */
    consent_code: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "The consent code from the authorization request.",
    }),
  },
  $I.annotations("OAuth2ConsentPayload", {
    description: "Payload for the OAuth2 consent endpoint.",
  })
) {}

/**
 * Success response from the consent endpoint.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * The URI to redirect the user to after processing consent.
     */
    redirectURI: BS.URLString.annotations({
      description: "The URI to redirect the user to after processing consent.",
    }),
  },
  $I.annotations("OAuth2ConsentSuccess", {
    description: "Success response from the OAuth2 consent endpoint.",
  })
) {}

/**
 * OAuth2 consent endpoint contract.
 *
 * POST /oauth2/consent
 *
 * Processes the user's consent decision for an OAuth2 authorization request.
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("consent", "/consent")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to process consent.",
      })
    )
  )
  .addSuccess(Success);
