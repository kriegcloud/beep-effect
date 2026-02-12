import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as EntityCluster from "../EntityCluster.model";

const $I = $KnowledgeDomainId.create("entities/EntityCluster/contracts/FindByCanonicalEntity.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    canonicalEntityId: KnowledgeEntityIds.KnowledgeEntityId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("Payload", {
    description: "Payload for the FindByCanonicalEntity EntityCluster contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.optionalWith(EntityCluster.Model.json, { as: "Option" }),
  },
  $I.annotations("Success", {
    description:
      "Success response for the FindByCanonicalEntity EntityCluster contract. Data is null when no match found.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "FindByCanonicalEntity",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Find EntityCluster by canonical entity ID Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("FindByCanonicalEntity", "/by-canonical-entity")
    .setPayload(Payload)
    .addSuccess(Success);
}
