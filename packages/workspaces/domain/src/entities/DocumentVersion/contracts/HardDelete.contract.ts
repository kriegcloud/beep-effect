import { $WorkspacesDomainId } from "@beep/identity/packages";
import { WorkspacesEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as DocumentVersionErrors from "../DocumentVersion.errors";

const $I = $WorkspacesDomainId.create("entities/DocumentVersion/contracts/HardDelete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: WorkspacesEntityIds.DocumentVersionId,
  },
  $I.annotations("Payload", {
    description: "Payload for the HardDelete DocumentVersion Contract.",
  })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", {
    description: "Success response for the HardDelete DocumentVersion Contract.",
  })
) {}

export const Failure = DocumentVersionErrors.DocumentVersionNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "HardDelete",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "HardDelete DocumentVersion Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("HardDelete", "/:id")
    .setPayload(Payload)
    .addError(DocumentVersionErrors.DocumentVersionNotFoundError)
    .addSuccess(Success, { status: 204 });
}
