import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as DocumentSourceErrors from "../DocumentSource.errors";
import * as DocumentSource from "../DocumentSource.model";

const $I = $DocumentsDomainId.create("entities/DocumentSource/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: DocumentsEntityIds.DocumentSourceId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Get DocumentSource Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: DocumentSource.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Get DocumentSource Contract.",
  })
) {}

export const Failure = DocumentSourceErrors.DocumentSourceNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get DocumentSource Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(DocumentSourceErrors.DocumentSourceNotFoundError)
    .addSuccess(Success);
}
