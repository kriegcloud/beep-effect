import { BS } from "@beep/schema";
import type * as S from "effect/Schema";


export class InvitationStatus extends BS.StringLiteralKit("pending", "rejected", "cancelled", "accepted").annotations({
  schemaId: Symbol.for("@beep/iam-domain/Invitation/schemas/InvitationStatus"),
  identifier: "InvitationStatus",
  title: "Invitation Status",
  description: "The status of the invitation",
}) {}
export const makeInvitationStatusPgEnum = BS.toPgEnum(InvitationStatus);

export const InvitationStatusEnum = InvitationStatus.Enum;

export const InvitationStatusOptions = InvitationStatus.Options;
export declare namespace InvitationStatus {
  export type Type = S.Schema.Type<typeof InvitationStatus>;
  export type Encoded = S.Schema.Encoded<typeof InvitationStatus>;
}
