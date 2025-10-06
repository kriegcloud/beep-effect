import { BS } from "@beep/schema";
import { IamEntityIds } from "@beep/shared-domain";
export class AcceptInvitationContract extends BS.Class<AcceptInvitationContract>("AcceptInvitationContract")({
  invitationId: IamEntityIds.InvitationId,
}) {}

export namespace AcceptInvitationContract {
  export type Type = typeof AcceptInvitationContract.Type;
  export type Encoded = typeof AcceptInvitationContract.Encoded;
}
