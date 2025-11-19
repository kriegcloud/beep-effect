import { BS } from "@beep/schema";
import type * as S from "effect/Schema";


export class MemberRole extends BS.StringLiteralKit("admin", "member", "owner").annotations({
  schemaId: Symbol.for("@beep/iam-domain/MemberRole"),
  description: "The role of the member in the organization",
  title: "Member Role",
  identifier: "MemberRole",
}) {

}

export const MemberRoleEnum = MemberRole.Enum;
export const MemberRoleOptions = MemberRole.Options;
export const makeMemberRolePgEnum = BS.toPgEnum(MemberRole);


export declare namespace MemberRole {
  export type Type = S.Schema.Type<typeof MemberRole>;
  export type Encoded = S.Schema.Encoded<typeof MemberRole>;
}
