import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/RelationEvidence/RelationEvidence.errors");

export class RelationEvidenceNotFoundError extends S.TaggedError<RelationEvidenceNotFoundError>()(
  $I`RelationEvidenceNotFoundError`,
  {
    id: KnowledgeEntityIds.RelationEvidenceId,
  },
  $I.annotationsHttp("RelationEvidenceNotFoundError", {
    status: 404,
    description: "Error when a relation evidence with the specified ID cannot be found.",
  })
) {}

export class RelationEvidencePermissionDeniedError extends S.TaggedError<RelationEvidencePermissionDeniedError>()(
  $I`RelationEvidencePermissionDeniedError`,
  {
    id: KnowledgeEntityIds.RelationEvidenceId,
  },
  $I.annotationsHttp("RelationEvidencePermissionDeniedError", {
    status: 403,
    description:
      "Thrown when the user lacks permission to perform the requested action on the relation evidence.",
  })
) {}

export const Errors = S.Union(RelationEvidenceNotFoundError, RelationEvidencePermissionDeniedError);
export type Errors = typeof Errors.Type;
