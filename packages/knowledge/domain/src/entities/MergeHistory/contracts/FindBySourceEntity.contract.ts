import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as MergeHistory from "../MergeHistory.model";

const $I = $KnowledgeDomainId.create("entities/MergeHistory/contracts/FindBySourceEntity.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    sourceEntityId: KnowledgeEntityIds.KnowledgeEntityId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("Payload", {
    description: "Payload for the FindBySourceEntity MergeHistory contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(MergeHistory.Model.json),
  },
  $I.annotations("Success", {
    description: "Success response for the FindBySourceEntity MergeHistory contract.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "FindBySourceEntity",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Find MergeHistory records by source entity ID Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("FindBySourceEntity", "/by-source-entity")
    .setPayload(Payload)
    .addSuccess(Success);
}
