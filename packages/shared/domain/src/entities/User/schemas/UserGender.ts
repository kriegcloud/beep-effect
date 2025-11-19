import { invariant } from "@beep/invariant";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

export class UserGender extends BS.StringLiteralKit("male", "female").annotations({
  schemaId: Symbol.for("@beep/iam-domain/User/UserGender"),
  identifier: "UserGender",
  title: "User Gender",
  description: "The user's role in the system",
}) {
  static readonly DropDownOptions = UserGender.Options.map((option) => ({
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

export const UserGenderEnum = UserGender.Enum;

export const UserGenderOptions = UserGender.Options;
export const makeUserGenderPgEnum = BS.toPgEnum(UserGender);
export declare namespace UserGender {
  export type Type = S.Schema.Type<typeof UserGender>;
  export type Encoded = S.Schema.Encoded<typeof UserGender>;
}
