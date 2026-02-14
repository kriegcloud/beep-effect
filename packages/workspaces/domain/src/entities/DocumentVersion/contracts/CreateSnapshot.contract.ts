import { $WorkspacesDomainId } from "@beep/identity/packages";
import { SharedEntityIds, WorkspacesEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import { SerializedEditorStateEnvelope } from "../../../value-objects";
import * as DocumentVersion from "../DocumentVersion.model";

const $I = $WorkspacesDomainId.create("entities/DocumentVersion/contracts/CreateSnapshot.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    documentId: WorkspacesEntityIds.DocumentId,
    title: S.optionalWith(S.String.pipe(S.maxLength(500)), { as: "Option" }),
    content: S.optional(S.String),
    contentRich: S.optional(SerializedEditorStateEnvelope),
  },
  $I.annotations("Payload", {
    description: "Payload for the CreateSnapshot DocumentVersion Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: DocumentVersion.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the CreateSnapshot DocumentVersion Contract.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "CreateSnapshot",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "CreateSnapshot DocumentVersion Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("CreateSnapshot", "/")
    .setPayload(Payload)
    .addSuccess(Success, { status: 201 });
}
