import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

export const UserGenderKit = BS.stringLiteralKit("male", "female");

export const UserGenderEnum = UserGenderKit.Enum;

export const makeUserGenderPgEnum = UserGenderKit.toPgEnum;

export const UserGenderOptions = UserGenderKit.Options;

export class UserGender extends UserGenderKit.Schema.annotations({
  schemaId: Symbol.for("@beep/iam-domain/User/UserGender"),
  identifier: "UserGender",
  title: "User Gender",
  description: "The user's role in the system",
}) {
  static readonly Options = UserGenderKit.Options;
  static readonly Enum = UserGenderKit.Enum;
}

export namespace UserGender {
  export type Type = S.Schema.Type<typeof UserGender>;
  export type Encoded = S.Schema.Encoded<typeof UserGender>;
}
