import { $WorkspacesDomainId } from "@beep/identity/packages";
import { WorkspacesEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as Document from "../Document.model";

const $I = $WorkspacesDomainId.create("entities/Document/contracts/ListByUser.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    userId: SharedEntityIds.UserId,
    organizationId: SharedEntityIds.OrganizationId,
    cursor: S.optional(WorkspacesEntityIds.DocumentId),
    limit: S.optional(S.NumberFromString.pipe(S.int(), S.positive())),
  },
  $I.annotations("Payload", {
    description: "Payload for the ListByUser Document Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(Document.Model.json),
  },
  $I.annotations("Success", {
    description: "List of documents owned by a specific user.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "ListByUser",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "ListByUser Document Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("ListByUser", "/by-user").setPayload(Payload).addSuccess(Success);
}
