import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as RelationEvidence from "../RelationEvidence.model";

const $I = $KnowledgeDomainId.create("entities/RelationEvidence/contracts/FindByRelationId.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    relationId: KnowledgeEntityIds.RelationId,
    organizationId: SharedEntityIds.OrganizationId,
    limit: S.optionalWith(S.Number, { default: () => 200 }),
  },
  $I.annotations("Payload", {
    description: "Payload for the FindByRelationId RelationEvidence contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(RelationEvidence.Model.json),
  },
  $I.annotations("Success", {
    description: "List of relation evidence for a given relation.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "FindByRelationId",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "FindByRelationId RelationEvidence Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("FindByRelationId", "/by-relation")
    .setPayload(Payload)
    .addSuccess(Success);
}
