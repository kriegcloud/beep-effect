import { BS } from "@beep/schema";
import { IamEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
export const UserModelSchemaId = Symbol.for("@beep/iam-domain/UserModel");

/**
 * User model representing application users with authentication and profile data.
 * Maps to the `user` table in the database.
 */
export class Model extends M.Class<Model>(`UserModel`)(
  makeFields(IamEntityIds.UserId, {
    /** User's display name */
    name: S.NonEmptyString.annotations({
      description: "The user's display name",
    }),

    /** User's email address (unique) */
    email: BS.Email.annotations({
      description: "The user's email address",
    }),

    /** Whether the user's email has been verified */
    emailVerified: S.optionalWith(S.Boolean, {
      exact: true,
      default: () => false,
    }).annotations({
      description: "Whether the user's email address has been verified",
    }),

    /** User's profile image URL */
    image: BS.FieldOptionOmittable(
      S.String.pipe(S.pattern(/^https?:\/\/.+/)).annotations({
        description: "URL to the user's profile image",
      })
    ),

    /** Whether two-factor authentication is enabled */
    twoFactorEnabled: BS.FieldOptionOmittable(
      S.Boolean.annotations({
        description: "Whether two-factor authentication is enabled for this user",
      })
    ),

    /** Whether this is an anonymous user */
    isAnonymous: BS.FieldOptionOmittable(
      S.Boolean.annotations({
        description: "Whether this user is anonymous (guest user)",
      })
    ),

    /** User's role in the system */
    role: BS.FieldOptionOmittable(
      S.NonEmptyString.annotations({
        description: "The user's role in the system",
        examples: ["admin", "member", "guest"],
      })
    ),

    /** Whether the user is banned */
    banned: BS.FieldOptionOmittable(
      S.Boolean.annotations({
        description: "Whether the user is currently banned",
      })
    ),

    /** Reason for ban if user is banned */
    banReason: BS.FieldOptionOmittable(
      S.NonEmptyString.annotations({
        description: "Reason why the user was banned",
      })
    ),

    /** When the ban expires */
    banExpires: BS.FieldOptionOmittable(
      BS.DateTimeFromDate({
        description: "When the user's ban expires",
      })
    ),

    /** Stripe customer ID for billing */
    stripeCustomerId: BS.FieldOptionOmittable(
      S.NonEmptyString.annotations({
        description: "Stripe customer ID for billing integration",
      })
    ),
  }),
  {
    title: "User Model",
    description: "User model representing application users with authentication and profile data.",
    schemaId: UserModelSchemaId,
  }
) {}
