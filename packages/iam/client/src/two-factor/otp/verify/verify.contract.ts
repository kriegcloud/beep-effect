import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { TwoFactorUser } from "../../_common/user.schema.ts";

const $I = $IamClientId.create("two-factor/otp/verify");

/**
 * Payload for verifying an OTP code.
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    code: S.String,
    trustDevice: S.optional(S.Boolean),
  },
  $I.annotations("Payload", {
    description: "The payload for verifying an OTP code.",
  })
) {}

/**
 * Success response - OTP verification succeeded.
 *
 * Returns session token and user data after successful verification.
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/two-factor/otp/index.ts:354-365
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    token: S.String,
    user: TwoFactorUser,
  },
  $I.annotations("Success", {
    description: "The success response after OTP verification.",
  })
) {}
