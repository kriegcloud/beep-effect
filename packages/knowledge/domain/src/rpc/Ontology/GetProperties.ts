import { $KnowledgeDomainId } from "@beep/identity/packages";
import { PropertyDefinition } from "@beep/knowledge-domain/entities";
import { OntologyNotFoundError } from "@beep/knowledge-domain/errors";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Ontology/GetProperties");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    ontologyId: KnowledgeEntityIds.OntologyId,
    organizationId: SharedEntityIds.OrganizationId,
    domainIri: S.optional(S.String),
    rangeType: S.optional(PropertyDefinition.PropertyRangeType),
    limit: S.optional(BS.PosInt),
  },
  $I.annotations("Payload", {
    description: "ontology_getProperties payload",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  PropertyDefinition.Model.json,
  $I.annotations("Success", {
    description: "ontology_getProperties succeeded",
  })
) {}

export const Error = OntologyNotFoundError.annotations(
  $I.annotations("Error", {
    description: "ontology_getProperties failed",
  })
);

export const Contract = Rpc.make("getProperties", {
  payload: Payload,
  success: Success,
  error: Error,
  stream: true,
});
