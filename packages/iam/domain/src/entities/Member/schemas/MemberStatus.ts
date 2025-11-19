import { BS } from "@beep/schema";
import type * as S from "effect/Schema";


export class MemberStatus extends BS.StringLiteralKit("active", "inactive", "offline", "suspended", "deleted", "invited").annotations({
  schemaId: Symbol.for("@beep/iam-domain/MemberStatus"),
  description: "The status of the member in the organization",
  title: "Member Status",
  identifier: "MemberStatus",
}) {

}
export const MemberStatusEnum = MemberStatus.Enum;
export const MemberStatusOptions = MemberStatus.Options;
export const makeMemberStatusPgEnum = BS.toPgEnum(MemberStatus);

export declare namespace MemberStatus {
  export type Type = S.Schema.Type<typeof MemberStatus>;
  export type Encoded = S.Schema.Encoded<typeof MemberStatus>;
}
