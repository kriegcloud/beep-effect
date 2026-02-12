import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { OperationFailedError } from "@beep/shared-domain/errors";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import { SerializedEditorStateEnvelope } from "../../../value-objects";

const $I = $DocumentsDomainId.create("entities/Discussion/contracts/CreateWithComment.contract");

const MAX_DOCUMENT_CONTENT_LENGTH = 1000;

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    documentId: DocumentsEntityIds.DocumentId,
    documentContent: S.String.pipe(S.minLength(1), S.maxLength(MAX_DOCUMENT_CONTENT_LENGTH)),
    contentRich: S.optional(SerializedEditorStateEnvelope),
    discussionId: S.optional(DocumentsEntityIds.DiscussionId),
  },
  $I.annotations("Payload", {
    description: "Payload for the CreateWithComment Discussion Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    id: DocumentsEntityIds.DiscussionId,
  },
  $I.annotations("Success", {
    description: "Success response for the CreateWithComment Discussion Contract.",
  })
) {}

export const Failure = OperationFailedError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "CreateWithComment",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "CreateWithComment Discussion Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("CreateWithComment", "/with-comment")
    .setPayload(Payload)
    .addError(OperationFailedError)
    .addSuccess(Success, { status: 201 });
}
