import { $WorkspacesDomainId } from "@beep/identity/packages";
import { WorkspacesEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as DocumentErrors from "../Document.errors";
import * as Document from "../Document.model";

const $I = $WorkspacesDomainId.create("entities/Document/contracts/Archive.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: WorkspacesEntityIds.DocumentId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Archive Document Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: Document.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Archive Document Contract.",
  })
) {}

export const Failure = DocumentErrors.DocumentNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Archive",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Archive Document Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.patch("Archive", "/:id/archive")
    .setPayload(Payload)
    .addError(DocumentErrors.DocumentNotFoundError)
    .addSuccess(Success);
}
