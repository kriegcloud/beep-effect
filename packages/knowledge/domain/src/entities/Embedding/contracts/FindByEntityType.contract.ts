import { $KnowledgeDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as Embedding from "../Embedding.model";

const $I = $KnowledgeDomainId.create("entities/Embedding/contracts/FindByEntityType.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    entityType: Embedding.EntityType,
    organizationId: SharedEntityIds.OrganizationId,
    limit: S.optionalWith(S.Number.pipe(S.int(), S.between(1, 1000)), { default: () => 100 }),
  },
  $I.annotations("Payload", {
    description: "Payload for the FindByEntityType Embedding contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(Embedding.Model.json),
  },
  $I.annotations("Success", {
    description: "Success response for the FindByEntityType Embedding contract.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "FindByEntityType",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Find Embeddings by entity type Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("FindByEntityType", "/by-entity-type")
    .setPayload(Payload)
    .addSuccess(Success);
}
