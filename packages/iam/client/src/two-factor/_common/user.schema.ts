import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("two-factor/_common");

/**
 * User schema returned from two-factor verification endpoints.
 *
 * User fields are nullable because they may not be set for all users.
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/two-factor/verify-two-factor.ts:103-114
 */
export class TwoFactorUser extends S.Class<TwoFactorUser>($I`TwoFactorUser`)(
  {
    id: S.String,
    email: S.NullOr(S.String),
    emailVerified: S.NullOr(S.Boolean),
    name: S.NullOr(S.String),
    image: S.NullOr(S.String),
    createdAt: S.DateFromString,
    updatedAt: S.DateFromString,
  },
  $I.annotations("TwoFactorUser", {
    description: "User object returned from two-factor verification endpoints.",
  })
) {}
