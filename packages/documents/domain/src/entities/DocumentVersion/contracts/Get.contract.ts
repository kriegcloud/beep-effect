import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as DocumentVersionErrors from "../DocumentVersion.errors";
import { VersionWithAuthor } from "../schemas/VersionWithAuthor.schema";

const $I = $DocumentsDomainId.create("entities/DocumentVersion/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: DocumentsEntityIds.DocumentVersionId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Get DocumentVersion Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: VersionWithAuthor,
  },
  $I.annotations("Success", {
    description: "Success response for the Get DocumentVersion Contract.",
  })
) {}

export const Failure = DocumentVersionErrors.DocumentVersionNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get DocumentVersion Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(DocumentVersionErrors.DocumentVersionNotFoundError)
    .addSuccess(Success);
}
