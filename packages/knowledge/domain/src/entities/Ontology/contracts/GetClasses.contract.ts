import { $KnowledgeDomainId } from "@beep/identity/packages";
import { OntologyNotFoundError } from "@beep/knowledge-domain/errors";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcSchema from "@effect/rpc/RpcSchema";
import * as S from "effect/Schema";
import { Model as ClassDefinitionModel } from "../../ClassDefinition/ClassDefinition.model";

const $I = $KnowledgeDomainId.create("entities/Ontology/contracts/GetClasses.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    ontologyId: KnowledgeEntityIds.OntologyId,
    organizationId: SharedEntityIds.OrganizationId,
    parentIri: S.optional(S.String),
    limit: S.optional(BS.PosInt),
  },
  $I.annotations("Payload", {
    description: "ontology_getClasses payload",
  })
) {}

export class Element extends S.Class<Element>($I`Element`)(
  ClassDefinitionModel.json,
  $I.annotations("Element", {
    description: "ontology_getClasses element",
  })
) {}

const StreamFailure = OntologyNotFoundError.annotations(
  $I.annotations("StreamFailure", {
    description: "ontology_getClasses stream failure",
  })
);

export const Success = RpcSchema.Stream({ success: Element, failure: StreamFailure });
export type Success = S.Schema.Type<typeof Success>;

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "getClasses",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotations("Contract", {
    description: "Get ontology classes Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
}
