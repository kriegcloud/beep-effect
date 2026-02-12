import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as MeetingPrepBulletErrors from "../MeetingPrepBullet.errors";

const $I = $KnowledgeDomainId.create("entities/MeetingPrepBullet/contracts/Delete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: KnowledgeEntityIds.MeetingPrepBulletId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Delete MeetingPrepBullet contract.",
  })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", {
    description: "Success response for the Delete MeetingPrepBullet contract.",
  })
) {}

export const Failure = S.Union(
  MeetingPrepBulletErrors.MeetingPrepBulletNotFoundError,
  MeetingPrepBulletErrors.MeetingPrepBulletPermissionDeniedError
);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Delete",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Delete MeetingPrepBullet Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("Delete", "/:id")
    .setPayload(Payload)
    .addError(MeetingPrepBulletErrors.MeetingPrepBulletNotFoundError)
    .addError(MeetingPrepBulletErrors.MeetingPrepBulletPermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}
