import { $KnowledgeDomainId } from "@beep/identity/packages";
import { Ontology } from "@beep/knowledge-domain/entities";
import { OntologyNotFoundError } from "@beep/knowledge-domain/errors";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Ontology/Get");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: KnowledgeEntityIds.OntologyId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("Payload", {
    description: "ontology_get payload",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  Ontology.Model.json,
  $I.annotations("Success", {
    description: "ontology_get succeeded",
  })
) {}

export const Error = OntologyNotFoundError.annotations(
  $I.annotations("Error", {
    description: "ontology_get failed",
  })
);

export const Contract = Rpc.make("get", {
  payload: Payload,
  success: Success,
  error: Error,
});
