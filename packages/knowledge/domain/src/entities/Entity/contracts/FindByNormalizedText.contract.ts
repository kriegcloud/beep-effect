import { $KnowledgeDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as Entity from "../Entity.model";

const $I = $KnowledgeDomainId.create("entities/Entity/contracts/FindByNormalizedText.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    normalizedText: S.String,
    organizationId: SharedEntityIds.OrganizationId,
    limit: S.optionalWith(S.Number.pipe(S.int(), S.between(1, 1000)), { default: () => 50 }),
  },
  $I.annotations("Payload", {
    description: "Payload for the FindByNormalizedText KnowledgeEntity contract (pg_trgm fuzzy search).",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(Entity.Model.json),
  },
  $I.annotations("Success", {
    description: "Success response for the FindByNormalizedText KnowledgeEntity contract.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "FindByNormalizedText",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Find KnowledgeEntities by fuzzy text match (pg_trgm similarity) Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("FindByNormalizedText", "/by-text")
    .setPayload(Payload)
    .addSuccess(Success);
}
