import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("password/change");

/**
 * Payload for changing the current user's password.
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    currentPassword: S.String,
    newPassword: S.String,
    revokeOtherSessions: S.optional(S.Boolean),
  },
  $I.annotations("Payload", {
    description: "The payload for changing the current user's password.",
  })
) {}

/**
 * User shape returned by changePassword.
 */
export class User extends S.Class<User>($I`User`)(
  {
    id: S.String,
    email: S.String,
    name: S.String,
    image: S.NullOr(S.String),
    emailVerified: S.Boolean,
    createdAt: S.Date,
    updatedAt: S.Date,
  },
  $I.annotations("User", {
    description: "The user object returned after password change.",
  })
) {}

/**
 * Success response - password change completed.
 *
 * Better Auth returns { token: string | null, user: User } on success.
 * Token is only present if revokeOtherSessions was true.
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    token: S.NullOr(S.String),
    user: User,
  },
  $I.annotations("Success", {
    description: "The success response for changing a password.",
  })
) {}
