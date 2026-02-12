import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as Relation from "../Relation.model";

const $I = $KnowledgeDomainId.create("entities/Relation/contracts/FindByTargetIds.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    targetIds: S.Array(KnowledgeEntityIds.KnowledgeEntityId),
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("Payload", {
    description: "Payload for the FindByTargetIds Relation contract (fetch relations by object entity IDs).",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(Relation.Model.json),
  },
  $I.annotations("Success", {
    description: "Success response for the FindByTargetIds Relation contract.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "FindByTargetIds",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Find Relations by object entity IDs Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("FindByTargetIds", "/by-target-ids")
    .setPayload(Payload)
    .addSuccess(Success);
}
