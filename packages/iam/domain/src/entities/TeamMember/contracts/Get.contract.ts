import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as TeamMemberErrors from "../TeamMember.errors";
import * as TeamMember from "../TeamMember.model";

const $I = $IamDomainId.create("entities/TeamMember/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  { id: IamEntityIds.TeamMemberId },
  $I.annotations("Payload", { description: "Payload for the Get TeamMember Contract." })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  { data: TeamMember.Model.json },
  $I.annotations("Success", { description: "Success response for the Get TeamMember Contract." })
) {}

export const Failure = TeamMemberErrors.TeamMemberNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  { payload: Payload.fields, success: Success, failure: Failure },
  $I.annotationsHttp("Contract", { description: "Get TeamMember Request Contract." })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(TeamMemberErrors.TeamMemberNotFoundError)
    .addSuccess(Success);
}
