import { $KnowledgeDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Embedding/contracts/DeleteByEntityIdPrefix.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    entityIdPrefix: S.String,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("Payload", {
    description: "Payload for the DeleteByEntityIdPrefix Embedding contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    deletedCount: S.Number,
  },
  $I.annotations("Success", {
    description: "Success response for the DeleteByEntityIdPrefix Embedding contract.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "DeleteByEntityIdPrefix",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Delete Embeddings by entity ID prefix Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("DeleteByEntityIdPrefix", "/by-entity-id-prefix")
    .setPayload(Payload)
    .addSuccess(Success);
}
