/**
 * @fileoverview
 * SSO verify domain contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for verifying SSO provider domain.
 *
 * @module @beep/iam-client/sso/verify-domain/contract
 * @category SSO/VerifyDomain
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("sso/verify-domain");

/**
 * Payload for verifying SSO provider domain ownership.
 *
 * @example
 * ```typescript
 * import { VerifyDomain } from "@beep/iam-client/sso"
 *
 * const payload = VerifyDomain.Payload.make({
 *   providerId: "acme-corp"
 * })
 * ```
 *
 * @category SSO/VerifyDomain/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    providerId: IamEntityIds.SsoProviderId,
  },
  formValuesAnnotation({
    providerId: "",
  })
) {}

/**
 * Success response for domain verification.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { VerifyDomain } from "@beep/iam-client/sso"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* VerifyDomain.Handler({
 *     providerId: "acme-corp"
 *   })
 *   if (result.verified) {
 *     console.log("Domain ownership verified")
 *   }
 * })
 * ```
 *
 * @category SSO/VerifyDomain/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    verified: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Success response indicating domain verification status.",
  })
) {}

/**
 * Contract wrapper for SSO verify domain operations.
 *
 * @example
 * ```typescript
 * import { VerifyDomain } from "@beep/iam-client/sso"
 *
 * const handler = VerifyDomain.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category SSO/VerifyDomain/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("SsoVerifyDomain", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
