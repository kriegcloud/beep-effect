import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

export const UserTypeKit = BS.stringLiteralKit("user", "super_admin", "admin");

export const UserTypeEnum = UserTypeKit.Enum;

export const makeUserTypePgEnum = UserTypeKit.toPgEnum;

export const UserTypeOptions = UserTypeKit.Options;

export class UserType extends UserTypeKit.Schema.annotations({
  schemaId: Symbol.for("@beep/iam-domain/User/UserType"),
  identifier: "UserType",
  title: "User Type",
  description: "The type of user",
}) {}

export namespace UserType {
  export type Type = S.Schema.Type<typeof UserType>;
  export type Encoded = S.Schema.Encoded<typeof UserType>;
}
