import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as MentionRecord from "../MentionRecord.model";

const $I = $KnowledgeDomainId.create("entities/MentionRecord/contracts/FindByResolvedEntityId.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    entityId: KnowledgeEntityIds.KnowledgeEntityId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("Payload", {
    description: "Payload for the FindByResolvedEntityId MentionRecord contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(MentionRecord.Model.json),
  },
  $I.annotations("Success", {
    description: "Success response for the FindByResolvedEntityId MentionRecord contract.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "FindByResolvedEntityId",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Find MentionRecords by resolved entity ID Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("FindByResolvedEntityId", "/by-resolved-entity-id")
    .setPayload(Payload)
    .addSuccess(Success);
}
