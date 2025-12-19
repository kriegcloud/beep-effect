/**
 * @module unlink-account
 *
 * Domain contract for unlinking a provider account from the authenticated user.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/core/unlink-account");

/**
 * Payload for unlinking a provider account.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The provider ID to unlink (e.g., "google", "github").
     */
    providerId: S.String.annotations({
      description: "The provider ID to unlink (e.g., 'google', 'github').",
    }),

    /**
     * Specific account ID to unlink. Optional if user only has one account for this provider.
     */
    accountId: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "Specific account ID to unlink. Optional if user only has one account for this provider.",
    }),
  },
  $I.annotations("UnlinkAccountPayload", {
    description: "Payload for unlinking a provider account from the authenticated user.",
  })
) {}

/**
 * Success response after unlinking an account.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * Operation status.
     */
    status: S.optionalWith(S.Boolean, { as: "Option", nullable: true }).annotations({
      description: "Operation status.",
    }),
  },
  $I.annotations("UnlinkAccountSuccess", {
    description: "Success response after unlinking an account.",
  })
) {}

/**
 * Unlink account endpoint contract.
 *
 * POST /unlink-account
 *
 * Unlinks a provider account from the authenticated user.
 *
 * @since 0.1.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("unlink-account", "/unlink-account")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to unlink account.",
      })
    )
  )
  .addSuccess(Success);
