import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

export const UserRoleKit = BS.stringLiteralKit("admin", "user");

export const UserRoleEnum = UserRoleKit.Enum;

export const makeUserRolePgEnum = UserRoleKit.toPgEnum;

export const UserRoleOptions = UserRoleKit.Options;

export class UserRole extends UserRoleKit.Schema.annotations({
  schemaId: Symbol.for("@beep/iam-domain/User/UserRole"),
  identifier: "UserRole",
  title: "User Role",
  description: "The user's role in the system",
}) {
  static readonly Options = UserRoleKit.Options;
  static readonly Enum = UserRoleKit.Enum;
}

export declare namespace UserRole {
  export type Type = S.Schema.Type<typeof UserRole>;
  export type Encoded = S.Schema.Encoded<typeof UserRole>;
}
