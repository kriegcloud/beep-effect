import { $WorkspacesDomainId } from "@beep/identity/packages";
import { SharedEntityIds, WorkspacesEntityIds } from "@beep/shared-domain";
import { OperationFailedError } from "@beep/shared-domain/errors";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import { SerializedEditorStateEnvelope } from "../../../value-objects";
import * as Document from "../Document.model";

const $I = $WorkspacesDomainId.create("entities/Document/contracts/Create.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    templateId: S.optional(S.String),
    parentDocumentId: S.optional(WorkspacesEntityIds.DocumentId),
    title: S.optional(S.String.pipe(S.maxLength(500))),
    content: S.optional(S.String),
    contentRich: S.optional(SerializedEditorStateEnvelope),
  },
  $I.annotations("Payload", {
    description: "Payload for the Create Document Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: Document.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Create Document Contract.",
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
    description: "Create Document Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("Create", "/")
    .setPayload(Payload)
    .addError(OperationFailedError)
    .addSuccess(Success, { status: 201 });
}
