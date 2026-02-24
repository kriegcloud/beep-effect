import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcSchema from "@effect/rpc/RpcSchema";
import * as S from "effect/Schema";
import { Model } from "../Relation.model";

const $I = $KnowledgeDomainId.create("entities/Relation/contracts/ListByPredicate.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    predicate: S.String,
    organizationId: SharedEntityIds.OrganizationId,
    ontologyId: S.optional(KnowledgeEntityIds.OntologyId),
    cursor: S.optional(KnowledgeEntityIds.RelationId),
    limit: S.optional(BS.PosInt),
  },
  $I.annotations("Payload", {
    description: "relation_listByPredicate payload",
  })
) {}

export class Element extends S.Class<Element>($I`Element`)(
  Model.json,
  $I.annotations("Element", {
    description: "relation_listByPredicate succeeded",
  })
) {}

export const Success = RpcSchema.Stream({ success: Element, failure: S.Never });
export type Success = S.Schema.Type<typeof Success>;

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "listByPredicate",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotations("Contract", {
    description: "List relations by predicate Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
}
