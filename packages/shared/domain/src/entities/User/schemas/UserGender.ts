import { invariant } from "@beep/invariant";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

export const UserGenderKit = BS.stringLiteralKit("male", "female");

export const UserGenderEnum = UserGenderKit.Enum;

export const makeUserGenderPgEnum = BS.toPgEnum(UserGenderKit);

export const UserGenderOptions = UserGenderKit.Options;

export class UserGender extends UserGenderKit.Schema.annotations({
  schemaId: Symbol.for("@beep/iam-domain/User/UserGender"),
  identifier: "UserGender",
  title: "User Gender",
  description: "The user's role in the system",
}) {
  static readonly Options = UserGenderKit.Options;
  static readonly Enum = UserGenderKit.Enum;
  static readonly DropDownOptions = UserGenderKit.Options.map((option) => ({
    label: option,
    value: option,
  }));
  static readonly make = (gender: string) => {
    invariant(S.is(UserGender)(gender), "not a valid user gender!", {
      line: 27,
      file: "./packages/shared/domain/src/entities/User/schemas/UserGender.ts",
      args: [gender],
    });

    return gender;
  };
}

export declare namespace UserGender {
  export type Type = S.Schema.Type<typeof UserGender>;
  export type Encoded = S.Schema.Encoded<typeof UserGender>;
}
