import { BS } from "@beep/schema";
import { Common, IamEntityIds } from "@beep/shared-domain";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export const UserModelSchemaId = Symbol.for("@beep/iam-domain/UserModel");

/**
 * User model representing application users with authentication and profile data.
 * Maps to the `user` table in the database.
 */
export class Model extends M.Class<Model>(`UserModel`)(
  {
    /** Primary key identifier for the user */
    id: M.Generated(IamEntityIds.UserId),

    /** User's display name */
    name: S.NonEmptyString.annotations({
      description: "The user's display name",
    }),

    /** User's email address (unique) */
    email: M.Sensitive(
      BS.Email.annotations({
        description: "The user's email address",
      })
    ),

    /** Whether the user's email has been verified */
    emailVerified: S.Boolean.annotations({
      description: "Whether the user's email address has been verified",
    }),

    /** User's profile image URL */
    image: M.FieldOption(
      S.String.pipe(S.pattern(/^https?:\/\/.+/)).annotations({
        description: "URL to the user's profile image",
      })
    ),

    /** Whether two-factor authentication is enabled */
    twoFactorEnabled: M.FieldOption(
      S.Boolean.annotations({
        description: "Whether two-factor authentication is enabled for this user",
      })
    ),

    /** Whether this is an anonymous user */
    isAnonymous: M.FieldOption(
      S.Boolean.annotations({
        description: "Whether this user is anonymous (guest user)",
      })
    ),

    /** User's role in the system */
    role: M.FieldOption(
      S.NonEmptyString.annotations({
        description: "The user's role in the system",
        examples: ["admin", "member", "guest"],
      })
    ),

    /** Whether the user is banned */
    banned: M.FieldOption(
      S.Boolean.annotations({
        description: "Whether the user is currently banned",
      })
    ),

    /** Reason for ban if user is banned */
    banReason: M.FieldOption(
      S.NonEmptyString.annotations({
        description: "Reason why the user was banned",
      })
    ),

    /** When the ban expires */
    banExpires: M.FieldOption(
      Common.DateTimeFromDate({
        description: "When the user's ban expires",
      })
    ),

    /** Stripe customer ID for billing */
    stripeCustomerId: M.FieldOption(
      S.NonEmptyString.annotations({
        description: "Stripe customer ID for billing integration",
      })
    ),

    // Audit and tracking columns
    ...Common.globalColumns,
  },
  {
    title: "User Model",
    description: "User model representing application users with authentication and profile data.",
    schemaId: UserModelSchemaId,
  }
) {}
export namespace Model {
  export type Type = S.Schema.Type<typeof Model>;
  export type Encoded = S.Schema.Encoded<typeof Model>;
}
