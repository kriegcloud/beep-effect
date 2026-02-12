import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as RelationEvidence from "../RelationEvidence.model";

const $I = $KnowledgeDomainId.create("entities/RelationEvidence/contracts/FindByIds.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    ids: S.Array(KnowledgeEntityIds.RelationEvidenceId),
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("Payload", {
    description: "Payload for the FindByIds RelationEvidence contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(RelationEvidence.Model.json),
  },
  $I.annotations("Success", {
    description: "List of relation evidence matching the provided IDs.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "FindByIds",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "FindByIds RelationEvidence Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("FindByIds", "/by-ids")
    .setPayload(Payload)
    .addSuccess(Success);
}
