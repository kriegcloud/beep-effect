import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { TwoFactorUser } from "../../_common/user.schema.ts";

const $I = $IamClientId.create("two-factor/totp/verify");

/**
 * Payload for verifying a TOTP code.
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    code: S.String,
    trustDevice: S.optional(S.Boolean),
  },
  $I.annotations("Payload", {
    description: "The payload for verifying a TOTP code.",
  })
) {}

/**
 * Success response - TOTP verification succeeded.
 *
 * Returns session token and user data after successful 2FA verification.
 * Used both for completing 2FA setup and during 2FA-protected sign-in.
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/two-factor/verify-two-factor.ts:103-114
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    token: S.String,
    user: TwoFactorUser,
  },
  $I.annotations("Success", {
    description: "The success response containing session token and user data.",
  })
) {}
