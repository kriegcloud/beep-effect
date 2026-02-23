import { $WorkspacesDomainId } from "@beep/identity/packages";
import { WorkspacesEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as PageShareErrors from "../PageShare.errors";
import * as PageShare from "../PageShare.model";

const $I = $WorkspacesDomainId.create("entities/PageShare/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: WorkspacesEntityIds.PageShareId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Get PageShare Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: PageShare.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Get PageShare Contract.",
  })
) {}

export const Failure = PageShareErrors.PageShareNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get PageShare Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(PageShareErrors.PageShareNotFoundError)
    .addSuccess(Success);
}
