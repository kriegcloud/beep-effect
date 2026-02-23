import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Ontology/Ontology.errors");

export class OntologyNotFoundError extends S.TaggedError<OntologyNotFoundError>()(
  $I`OntologyNotFoundError`,
  {
    id: KnowledgeEntityIds.OntologyId,
  },
  $I.annotationsHttp("OntologyNotFoundError", {
    status: 404,
    description: "Error when an ontology with the specified ID cannot be found.",
  })
) {}

export class OntologyPermissionDeniedError extends S.TaggedError<OntologyPermissionDeniedError>()(
  $I`OntologyPermissionDeniedError`,
  {
    id: KnowledgeEntityIds.OntologyId,
  },
  $I.annotationsHttp("OntologyPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the ontology.",
  })
) {}

export const Errors = S.Union(OntologyNotFoundError, OntologyPermissionDeniedError);
export type Errors = typeof Errors.Type;
