import { $WorkspacesDomainId } from "@beep/identity/packages";
import { SharedEntityIds, WorkspacesEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as Document from "../Document.model";

const $I = $WorkspacesDomainId.create("entities/Document/contracts/List.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    parentDocumentId: S.optional(WorkspacesEntityIds.DocumentId),
    search: S.optional(S.String),
    cursor: S.optional(WorkspacesEntityIds.DocumentId),
    limit: S.optional(S.NumberFromString.pipe(S.int(), S.positive())),
  },
  $I.annotations("Payload", {
    description: "Payload for the List Document Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(Document.Model.json),
  },
  $I.annotations("Success", {
    description: "List of documents with optional filtering.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "List",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "List Document Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("List", "/").setPayload(Payload).addSuccess(Success);
}
