import { BS } from "@beep/schema";
import { makeFields } from "@beep/shared-domain/common";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { UserRole } from "./schemas";
import { USER_UPLOAD_LIMIT } from "./User.constants";
import { $SharedDomainId } from "@beep/identity/packages";

const $I = $SharedDomainId.create("entities/User/User.model")
/**
 * User model representing application users with authentication and profile data.
 * Maps to the `user` table in the database.
 */
export class Model extends M.Class<Model>($I`UserModel`)(
  makeFields(SharedEntityIds.UserId, {
    /** User's display name */
    name: S.NonEmptyString.annotations({
      description: "The user's display name",
    }),

    /** User's email address (unique) */
    email: BS.Email.annotations({
      description: "The user's email address",
    }),

    /** Whether the user's email has been verified */
    emailVerified: BS.BoolWithDefault(false),

    /** User's profile image URL */
    image: BS.FieldOptionOmittable(
      S.String.pipe(S.pattern(/^https?:\/\/.+/)).annotations({
        description: "URL to the user's profile image",
      })
    ),

    uploadLimit: BS.toOptionalWithDefault(S.Int)(USER_UPLOAD_LIMIT).annotations({
      description: "The maximum number of uploads allowed for the user.",
    }),

    /** User's role in the system */
    role: BS.toOptionalWithDefault(UserRole)(UserRole.Enum.user).annotations({
      description: "The user's role in the system",
    }),

    /** Whether the user is banned */
    banned: BS.BoolWithDefault(false).annotations({
      description: "Whether the user is currently banned",
    }),

    /** Reason for ban if user is banned */
    banReason: BS.FieldOptionOmittable(
      S.NonEmptyString.annotations({
        description: "Reason why the user was banned",
      })
    ),

    /** When the ban expires */
    banExpires: BS.FieldOptionOmittable(
      BS.DateTimeUtcFromAllAcceptable.annotations({
        description: "When the user's ban expires",
      })
    ),

    /** Whether this is an anonymous user */
    isAnonymous: BS.BoolWithDefault(false).annotations({
      description: "Whether this user is anonymous (guest user)",
    }),

    phoneNumber: BS.FieldOptionOmittable(
      BS.Phone.annotations({
        description: "The user's phone number",
      })
    ),

    phoneNumberVerified: BS.BoolWithDefault(false).annotations({
      description: "Whether the user's phone number has been verified",
    }),

    /** Whether two-factor authentication is enabled */
    twoFactorEnabled: BS.BoolWithDefault(false).annotations({
      description: "Whether two-factor authentication is enabled for this user",
    }),

    username: BS.FieldOptionOmittable(
      S.NonEmptyTrimmedString.pipe(S.lowercased()).annotations({
        description: "The user's username",
      })
    ),

    displayUsername: BS.FieldOptionOmittable(
      S.NonEmptyTrimmedString.annotations({
        description: "The user's display name",
      })
    ),

    /** Stripe customer ID for billing */
    stripeCustomerId: BS.FieldOptionOmittable(
      S.NonEmptyString.annotations({
        description: "Stripe customer ID for billing integration",
      })
    ),

    lastLoginMethod: BS.FieldOptionOmittable(
      S.NonEmptyString.annotations({
        description: "The user's last login method",
      })
    ),
  }),
  $I.annotations("UserModel")
) {
  static readonly utils = modelKit(Model);
}
