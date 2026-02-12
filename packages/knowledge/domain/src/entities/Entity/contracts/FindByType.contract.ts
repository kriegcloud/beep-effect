import { $KnowledgeDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as Entity from "../Entity.model";

const $I = $KnowledgeDomainId.create("entities/Entity/contracts/FindByType.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    typeIri: S.String,
    organizationId: SharedEntityIds.OrganizationId,
    limit: S.optionalWith(S.Number.pipe(S.int(), S.between(1, 1000)), { default: () => 100 }),
  },
  $I.annotations("Payload", {
    description: "Payload for the FindByType KnowledgeEntity contract (JSONB containment query).",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(Entity.Model.json),
  },
  $I.annotations("Success", {
    description: "Success response for the FindByType KnowledgeEntity contract.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "FindByType",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Find KnowledgeEntities by type IRI (JSONB containment) Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("FindByType", "/by-type").setPayload(Payload).addSuccess(Success);
}
