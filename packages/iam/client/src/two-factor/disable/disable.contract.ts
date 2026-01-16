import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("two-factor/disable");

/**
 * Payload for disabling two-factor authentication.
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    password: S.Redacted(S.String),
  },
  $I.annotations("Payload", {
    description: "The payload for disabling two-factor authentication.",
  })
) {}

/**
 * Success response - two-factor authentication disabled.
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/two-factor/index.ts:293
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    status: S.Boolean,
  },
  $I.annotations("Success", {
    description: "The success response for disabling two-factor authentication.",
  })
) {}
