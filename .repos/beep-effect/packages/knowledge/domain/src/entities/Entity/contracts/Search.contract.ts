import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcSchema from "@effect/rpc/RpcSchema";
import * as S from "effect/Schema";
import { Model } from "../Entity.model";

const $I = $KnowledgeDomainId.create("entities/Entity/contracts/Search.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    query: S.String,
    organizationId: SharedEntityIds.OrganizationId,
    ontologyId: S.optional(KnowledgeEntityIds.OntologyId),
    types: S.optional(S.Array(S.String)),
    limit: S.optional(BS.PosInt),
    offset: S.optional(S.NonNegativeInt),
  },
  $I.annotations("Payload", {
    description: "entity_search payload",
  })
) {}

export class SuccessElement extends S.Class<SuccessElement>($I`SuccessElement`)(
  {
    ...Model.select.pick("id", "_rowId", "mention", "types").fields,
    rank: S.Number,
  },
  $I.annotations("SuccessElement", {
    description: "entity_search succeeded",
  })
) {}

export const Success = RpcSchema.Stream({ success: SuccessElement, failure: S.Never });
export type Success = S.Schema.Type<typeof Success>;

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "search",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotations("Contract", {
    description: "Search entities Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
}
