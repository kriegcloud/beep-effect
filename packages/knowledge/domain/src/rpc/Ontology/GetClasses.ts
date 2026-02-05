import { $KnowledgeDomainId } from "@beep/identity/packages";
import { ClassDefinition } from "@beep/knowledge-domain/entities";
import { OntologyNotFoundError } from "@beep/knowledge-domain/errors";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Ontology/GetClasses");

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

export class Success extends S.Class<Success>($I`Success`)(
  ClassDefinition.Model.json,
  $I.annotations("Success", {
    description: "ontology_getClasses succeeded",
  })
) {}

export const Error = OntologyNotFoundError.annotations(
  $I.annotations("Error", {
    description: "ontology_getClasses failed",
  })
);

export const Contract = Rpc.make("getClasses", {
  payload: Payload,
  success: Success,
  error: Error,
  stream: true,
});
