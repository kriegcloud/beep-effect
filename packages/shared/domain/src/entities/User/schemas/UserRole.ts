import { invariant } from "@beep/invariant";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

export class UserRole extends BS.StringLiteralKit("admin", "user").annotations({
  schemaId: Symbol.for("@beep/iam-domain/User/UserRole"),
  identifier: "UserRole",
  title: "User Role",
  description: "The user's role in the system",
}) {
  static readonly make = (role: string) => {
    invariant(S.is(UserRole)(role), "not a valid user role!", {
      line: 21,
      file: "./packages/shared/domain/src/entities/User/schemas/UserRole.ts",
      args: [role],
    });

    return role;
  };
}
export const UserRoleEnum = UserRole.Enum;

export const makeUserRolePgEnum = BS.toPgEnum(UserRole);

export const UserRoleOptions = UserRole.Options;
export declare namespace UserRole {
  export type Type = S.Schema.Type<typeof UserRole>;
  export type Encoded = S.Schema.Encoded<typeof UserRole>;
}
