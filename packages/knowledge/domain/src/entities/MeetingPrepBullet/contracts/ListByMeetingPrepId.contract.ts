import { $KnowledgeDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as MeetingPrepBullet from "../MeetingPrepBullet.model";

const $I = $KnowledgeDomainId.create("entities/MeetingPrepBullet/contracts/ListByMeetingPrepId.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    meetingPrepId: S.String,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("Payload", {
    description: "Payload for the ListByMeetingPrepId MeetingPrepBullet contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(MeetingPrepBullet.Model.json),
  },
  $I.annotations("Success", {
    description: "List of meeting prep bullets for a meeting prep run.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "ListByMeetingPrepId",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "ListByMeetingPrepId MeetingPrepBullet Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("ListByMeetingPrepId", "/").setPayload(Payload).addSuccess(Success);
}
