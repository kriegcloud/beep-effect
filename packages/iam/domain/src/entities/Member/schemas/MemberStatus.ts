import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
export const MemberStatusKit = BS.stringLiteralKit("active", "inactive", "offline", "suspended", "deleted", "invited");
export const MemberStatusEnum = MemberStatusKit.Enum;
export const MemberStatusOptions = MemberStatusKit.Options;
export const makeMemberStatusPgEnum = MemberStatusKit.toPgEnum;

export class MemberStatus extends MemberStatusKit.Schema.annotations({
  schemaId: Symbol.for("@beep/iam-domain/MemberStatus"),
  description: "The status of the member in the organization",
  title: "Member Status",
  identifier: "MemberStatus",
}) {
  static readonly Enum = MemberStatusEnum;
  static readonly Options = MemberStatusOptions;
}

export declare namespace MemberStatus {
  export type Type = S.Schema.Type<typeof MemberStatus>;
  export type Encoded = S.Schema.Encoded<typeof MemberStatus>;
}
