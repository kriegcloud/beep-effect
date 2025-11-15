import { invariant } from "@beep/invariant";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
export const UserRoleKit = BS.stringLiteralKit("admin", "user");

export const UserRoleEnum = UserRoleKit.Enum;

export const makeUserRolePgEnum = BS.toPgEnum(UserRoleKit);

export const UserRoleOptions = UserRoleKit.Options;

export class UserRole extends UserRoleKit.Schema.annotations({
  schemaId: Symbol.for("@beep/iam-domain/User/UserRole"),
  identifier: "UserRole",
  title: "User Role",
  description: "The user's role in the system",
}) {
  static readonly Options = UserRoleKit.Options;
  static readonly Enum = UserRoleKit.Enum;
  static readonly make = (role: string) => {
    invariant(S.is(UserRole)(role), "not a valid user role!", {
      line: 21,
      file: "./packages/shared/domain/src/entities/User/schemas/UserRole.ts",
      args: [role],
    });

    return role;
  };
}

export declare namespace UserRole {
  export type Type = S.Schema.Type<typeof UserRole>;
  export type Encoded = S.Schema.Encoded<typeof UserRole>;
}
