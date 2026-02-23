import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { makeFields } from "@beep/shared-domain/common";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as Arbitrary from "effect/Arbitrary";
import * as FC from "effect/FastCheck";
import * as S from "effect/Schema";
import { UserRole } from "./schemas";
import { USER_UPLOAD_LIMIT } from "./User.constants";

const $I = $SharedDomainId.create("entities/User/User.model");

export class Model extends M.Class<Model>($I`UserModel`)(
  makeFields(SharedEntityIds.UserId, {
    name: S.NonEmptyString.annotations({
      description: "The user's display name",
    }),
    email: BS.Email.annotations({
      description: "The email address of the user",
    }),
    emailVerified: BS.BoolWithDefault(false).annotations({
      description: "Whether the users email address has been verified.",
    }),
    image: BS.FieldOptionOmittable(
      S.String.pipe(S.pattern(/^https?:\/\/.+/)).annotations({
        description: "The profile image URL of the user",
      })
    ),
    uploadLimit: BS.toOptionalWithDefault(S.Int)(USER_UPLOAD_LIMIT).annotations({
      description: "The maximum number of uploads allowed for the user.",
    }),
    role: BS.toOptionalWithDefault(UserRole)(UserRole.Enum.user).annotations({
      description: "The user's role in the system",
    }),
    banned: BS.BoolWithDefault(false).annotations({
      description: "Whether the user is currently banned",
    }),
    banReason: BS.FieldOptionOmittable(
      S.NonEmptyString.annotations({
        description: "Reason why the user was banned",
      })
    ),
    banExpires: BS.FieldOptionOmittable(
      BS.DateTimeUtcFromAllAcceptable.annotations({
        description: "When the user's ban expires",
      })
    ),
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
  static readonly decodeUnknown = S.decodeUnknown(Model);
  static readonly Arb = Arbitrary.make(Model);
  static readonly MockOne = () => this.Mock(1)[0]!;
  static readonly Mock = (qty = 1) => FC.sample(this.Arb, qty);
}
