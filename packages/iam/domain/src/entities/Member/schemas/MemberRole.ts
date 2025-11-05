import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
export const MemberRoleKit = BS.stringLiteralKit("admin", "member", "owner");
export const MemberRoleEnum = MemberRoleKit.Enum;
export const MemberRoleOptions = MemberRoleKit.Options;
export const makeMemberRolePgEnum = MemberRoleKit.toPgEnum;

export class MemberRole extends MemberRoleKit.Schema.annotations({
  schemaId: Symbol.for("@beep/iam-domain/MemberRole"),
  description: "The role of the member in the organization",
  title: "Member Role",
  identifier: "MemberRole",
}) {
  static readonly Enum = MemberRoleEnum;
  static readonly Options = MemberRoleOptions;
}

export declare namespace MemberRole {
  export type Type = S.Schema.Type<typeof MemberRole>;
  export type Encoded = S.Schema.Encoded<typeof MemberRole>;
}
