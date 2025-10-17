import { Contract, ContractSet } from "@beep/iam-sdk/contractkit";
import { BS } from "@beep/schema";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";
import { IamError } from "../../errors";

export class AcceptInvitationPayload extends BS.Class<AcceptInvitationPayload>("AcceptInvitationPayload")(
  {
    invitationId: IamEntityIds.InvitationId,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/AcceptInvitationPayload"),
    identifier: "AcceptInvitationPayload",
    description: "Payload for accepting an organization invitation.",
  }
) {}

export declare namespace AcceptInvitationPayload {
  export type Type = S.Schema.Type<typeof AcceptInvitationPayload>;
  export type Encoded = S.Schema.Encoded<typeof AcceptInvitationPayload>;
}

export const AcceptInvitationContract = Contract.make("AcceptInvitationContract", {
  description: "Accepts an organization invitation.",
  parameters: AcceptInvitationPayload.fields,
  failure: S.instanceOf(IamError),
  success: S.Void,
});

export const OrganizationContractSet = ContractSet.make(AcceptInvitationContract);
