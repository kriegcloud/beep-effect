import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as Mention from "../Mention.model";

const $I = $KnowledgeDomainId.create("entities/Mention/contracts/FindByEntityId.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    entityId: KnowledgeEntityIds.KnowledgeEntityId,
    organizationId: SharedEntityIds.OrganizationId,
    limit: S.optionalWith(S.Number, { default: () => 200 }),
  },
  $I.annotations("Payload", {
    description: "Payload for the FindByEntityId Mention contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(Mention.Model.json),
  },
  $I.annotations("Success", {
    description: "List of mentions for a given entity.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "FindByEntityId",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "FindByEntityId Mention Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("FindByEntityId", "/by-entity").setPayload(Payload).addSuccess(Success);
}
