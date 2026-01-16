import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("two-factor/otp/send");

/**
 * Payload for sending an OTP code.
 *
 * Optional payload - trustDevice can be set to enable device trust on verify.
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    trustDevice: S.optional(S.Boolean),
  },
  $I.annotations("Payload", {
    description: "The payload for sending an OTP code.",
  })
) {}

/**
 * Success response - OTP sent.
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/two-factor/otp/index.ts:215
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    status: S.Boolean,
  },
  $I.annotations("Success", {
    description: "The success response for sending an OTP.",
  })
) {}
