import { $WorkspacesDomainId } from "@beep/identity/packages";
import { WorkspacesEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as DocumentVersionErrors from "../DocumentVersion.errors";

const $I = $WorkspacesDomainId.create("entities/DocumentVersion/contracts/GetContent.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    id: WorkspacesEntityIds.DocumentVersionId,
  },
  $I.annotations("Payload", {
    description: "Payload for the GetContent DocumentVersion Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    documentId: WorkspacesEntityIds.DocumentId,
    documentVersionId: WorkspacesEntityIds.DocumentVersionId,
    content: S.String,
  },
  $I.annotations("Success", {
    description: "Immutable canonical text snapshot pinned to documentVersionId.",
  })
) {}

export const Failure = DocumentVersionErrors.DocumentVersionNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "GetContent",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "GetContent DocumentVersion Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("GetContent", "/:id/content")
    .setPayload(Payload)
    .addError(DocumentVersionErrors.DocumentVersionNotFoundError)
    .addSuccess(Success);
}
