import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as DiscussionErrors from "../Discussion.errors";
import * as Discussion from "../Discussion.model";

const $I = $DocumentsDomainId.create("entities/Discussion/contracts/Resolve.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: DocumentsEntityIds.DiscussionId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Resolve Discussion Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: Discussion.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Resolve Discussion Contract.",
  })
) {}

export const Failure = S.Union(
  DiscussionErrors.DiscussionNotFoundError,
  DiscussionErrors.DiscussionAlreadyResolvedError
);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Resolve",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Resolve Discussion Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.patch("Resolve", "/:id/resolve")
    .setPayload(Payload)
    .addError(DiscussionErrors.DiscussionNotFoundError)
    .addError(DiscussionErrors.DiscussionAlreadyResolvedError)
    .addSuccess(Success);
}
