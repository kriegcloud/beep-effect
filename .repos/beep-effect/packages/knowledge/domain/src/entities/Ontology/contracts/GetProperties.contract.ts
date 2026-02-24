import { $KnowledgeDomainId } from "@beep/identity/packages";
import { OntologyNotFoundError } from "@beep/knowledge-domain/errors";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcSchema from "@effect/rpc/RpcSchema";
import * as S from "effect/Schema";
import { Model as PropertyDefinitionModel, PropertyRangeType } from "../../PropertyDefinition/PropertyDefinition.model";

const $I = $KnowledgeDomainId.create("entities/Ontology/contracts/GetProperties.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    ontologyId: KnowledgeEntityIds.OntologyId,
    organizationId: SharedEntityIds.OrganizationId,
    domainIri: S.optional(S.String),
    rangeType: S.optional(PropertyRangeType),
    limit: S.optional(BS.PosInt),
  },
  $I.annotations("Payload", {
    description: "ontology_getProperties payload",
  })
) {}

export class Element extends S.Class<Element>($I`Element`)(
  PropertyDefinitionModel.json,
  $I.annotations("Element", {
    description: "ontology_getProperties element",
  })
) {}

const StreamFailure = OntologyNotFoundError.annotations(
  $I.annotations("StreamFailure", {
    description: "ontology_getProperties stream failure",
  })
);

export const Success = RpcSchema.Stream({ success: Element, failure: StreamFailure });
export type Success = S.Schema.Type<typeof Success>;

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "getProperties",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotations("Contract", {
    description: "Get ontology properties Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
}
