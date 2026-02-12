import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as DocumentFile from "../DocumentFile.model";

const $I = $DocumentsDomainId.create("entities/DocumentFile/contracts/Create.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    userId: SharedEntityIds.UserId,
    documentId: S.optionalWith(DocumentsEntityIds.DocumentId, { as: "Option" }),
    size: S.Int,
    url: S.String,
    appUrl: S.String,
    type: S.String,
  },
  $I.annotations("Payload", {
    description: "Payload for the Create DocumentFile contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: DocumentFile.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Create DocumentFile contract.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Create",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Create DocumentFile Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("Create", "/").setPayload(Payload).addSuccess(Success, { status: 201 });
}
