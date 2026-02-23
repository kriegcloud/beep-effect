import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { SharedEntityIds } from "@beep/shared-domain";
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
    id: SharedEntityIds.UserId,
    email: S.optionalWith(BS.Email, { nullable: true }),
    emailVerified: S.optionalWith(S.Boolean, { nullable: true }),
    name: S.optionalWith(BS.NameAttribute, { nullable: true }),
    image: S.optionalWith(BS.URLString, { nullable: true }),
    createdAt: BS.DateTimeUtcFromAllAcceptable,
    updatedAt: BS.DateTimeUtcFromAllAcceptable,
  },
  $I.annotations("TwoFactorUser", {
    description: "User object returned from two-factor verification endpoints.",
  })
) {}
