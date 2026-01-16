import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("two-factor/backup/generate");

/**
 * Payload for generating new backup codes.
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    password: S.Redacted(S.String),
  },
  $I.annotations("Payload", {
    description: "The payload for generating backup codes.",
  })
) {}

/**
 * Success response - new backup codes generated.
 *
 * Replaces all existing backup codes with new ones.
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/two-factor/backup-codes/index.ts:484-487
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    status: S.Boolean,
    backupCodes: S.Array(S.String),
  },
  $I.annotations("Success", {
    description: "The success response containing newly generated backup codes.",
  })
) {}
