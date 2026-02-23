import { $WorkspacesDomainId } from "@beep/identity/packages";
import { WorkspacesEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as DocumentSourceErrors from "../DocumentSource.errors";

const $I = $WorkspacesDomainId.create("entities/DocumentSource/contracts/Delete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: WorkspacesEntityIds.DocumentSourceId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Delete DocumentSource contract.",
  })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", {
    description: "Success response for the Delete DocumentSource contract.",
  })
) {}

export const Failure = S.Union(
  DocumentSourceErrors.DocumentSourceNotFoundError,
  DocumentSourceErrors.DocumentSourcePermissionDeniedError
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
    description: "Delete DocumentSource Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("Delete", "/:id")
    .setPayload(Payload)
    .addError(DocumentSourceErrors.DocumentSourceNotFoundError)
    .addError(DocumentSourceErrors.DocumentSourcePermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}
