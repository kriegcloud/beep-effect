import { $SharedDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as FolderErrors from "../Folder.errors";
import * as Folder from "../Folder.model";

const $I = $SharedDomainId.create("entities/Folder/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: SharedEntityIds.FolderId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Get Folder Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: Folder.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Get Folder Contract.",
  })
) {}

export const Failure = FolderErrors.FolderNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "GetFolder",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get Folder Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("GetFolder", "/:id")
    .setPayload(Payload)
    .addError(FolderErrors.FolderNotFoundError)
    .addSuccess(Success);
}
