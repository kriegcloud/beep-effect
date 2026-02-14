import { $WorkspacesDomainId } from "@beep/identity/packages";
import { SharedEntityIds, WorkspacesEntityIds } from "@beep/shared-domain";
import { OperationFailedError } from "@beep/shared-domain/errors";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $WorkspacesDomainId.create("entities/Discussion/contracts/Create.contract");

const MAX_DOCUMENT_CONTENT_LENGTH = 1000;

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    documentId: WorkspacesEntityIds.DocumentId,
    documentContent: S.String.pipe(S.minLength(1), S.maxLength(MAX_DOCUMENT_CONTENT_LENGTH)),
  },
  $I.annotations("Payload", {
    description: "Payload for the Create Discussion Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    id: WorkspacesEntityIds.DiscussionId,
  },
  $I.annotations("Success", {
    description: "Success response for the Create Discussion Contract.",
  })
) {}

export const Failure = OperationFailedError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Create",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Create Discussion Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("Create", "/")
    .setPayload(Payload)
    .addError(OperationFailedError)
    .addSuccess(Success, { status: 201 });
}
