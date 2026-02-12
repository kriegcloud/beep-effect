import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import { DiscussionWithComments } from "../schemas/DiscussionWithComments.schema";

const $I = $DocumentsDomainId.create("entities/Discussion/contracts/ListByDocument.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    documentId: DocumentsEntityIds.DocumentId,
  },
  $I.annotations("Payload", {
    description: "Payload for the ListByDocument Discussion Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(DiscussionWithComments),
  },
  $I.annotations("Success", {
    description: "List of discussions with comments for a document.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "ListByDocument",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "ListByDocument Discussion Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("ListByDocument", "/")
    .setPayload(Payload)
    .addSuccess(Success);
}
