import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

export const InvitationStatusKit = BS.stringLiteralKit("pending", "rejected", "cancelled", "accepted");

export const makeInvitationStatusPgEnum = InvitationStatusKit.toPgEnum;

export const InvitationStatusEnum = InvitationStatusKit.Enum;

export const InvitationStatusOptions = InvitationStatusKit.Options;

export class InvitationStatus extends InvitationStatusKit.Schema.annotations({
  schemaId: Symbol.for("@beep/iam-domain/Invitation/schemas/InvitationStatus"),
  identifier: "InvitationStatus",
  title: "Invitation Status",
  description: "The status of the invitation",
}) {}

export declare namespace InvitationStatus {
  export type Type = S.Schema.Type<typeof InvitationStatus>;
  export type Encoded = S.Schema.Encoded<typeof InvitationStatus>;
}
