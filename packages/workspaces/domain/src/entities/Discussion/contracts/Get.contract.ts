import { $WorkspacesDomainId } from "@beep/identity/packages";
import { WorkspacesEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as DiscussionErrors from "../Discussion.errors";
import { DiscussionWithComments } from "../schemas/DiscussionWithComments.schema";

const $I = $WorkspacesDomainId.create("entities/Discussion/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: WorkspacesEntityIds.DiscussionId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Get Discussion Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: DiscussionWithComments,
  },
  $I.annotations("Success", {
    description: "Success response for the Get Discussion Contract.",
  })
) {}

export const Failure = DiscussionErrors.DiscussionNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get Discussion Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(DiscussionErrors.DiscussionNotFoundError)
    .addSuccess(Success);
}
