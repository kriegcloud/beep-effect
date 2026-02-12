import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcSchema from "@effect/rpc/RpcSchema";
import * as S from "effect/Schema";
import { Model, OntologyStatus } from "../Ontology.model";

const $I = $KnowledgeDomainId.create("entities/Ontology/contracts/List.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    status: S.optional(OntologyStatus),
    cursor: S.optional(KnowledgeEntityIds.OntologyId),
    limit: S.optional(BS.PosInt),
  },
  $I.annotations("Payload", {
    description: "ontology_list payload",
  })
) {}

export class Element extends S.Class<Element>($I`Element`)(
  Model.json,
  $I.annotations("Element", {
    description: "ontology_list element",
  })
) {}

export const Success = RpcSchema.Stream({ success: Element, failure: S.Never });
export type Success = S.Schema.Type<typeof Success>;

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "list",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotations("Contract", {
    description: "List ontologies Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
}
