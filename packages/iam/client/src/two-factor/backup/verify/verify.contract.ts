import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { TwoFactorUser } from "../../_common/user.schema.ts";

const $I = $IamClientId.create("two-factor/backup/verify");

/**
 * Payload for verifying a backup code.
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    code: S.String,
    trustDevice: S.optional(S.Boolean),
    disableSession: S.optional(S.Boolean),
  },
  $I.annotations("Payload", {
    description: "The payload for verifying a backup code.",
  })
) {}

/**
 * Success response - backup code verification succeeded.
 *
 * Returns session token and user data after successful verification.
 * Token may be absent if disableSession was true.
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/two-factor/backup-codes/index.ts:369-380
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    token: S.optional(S.String),
    user: TwoFactorUser,
  },
  $I.annotations("Success", {
    description: "The success response after backup code verification.",
  })
) {}
