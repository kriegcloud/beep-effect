import { $KnowledgeDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as EntityCluster from "../EntityCluster.model";

const $I = $KnowledgeDomainId.create("entities/EntityCluster/contracts/FindHighCohesion.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    minCohesion: S.Number.pipe(S.between(0, 1)),
    organizationId: SharedEntityIds.OrganizationId,
    limit: S.optionalWith(S.Number.pipe(S.int(), S.between(1, 1000)), { default: () => 100 }),
  },
  $I.annotations("Payload", {
    description: "Payload for the FindHighCohesion EntityCluster contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(EntityCluster.Model.json),
  },
  $I.annotations("Success", {
    description: "Success response for the FindHighCohesion EntityCluster contract.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "FindHighCohesion",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Find high-cohesion EntityClusters Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("FindHighCohesion", "/high-cohesion")
    .setPayload(Payload)
    .addSuccess(Success);
}
