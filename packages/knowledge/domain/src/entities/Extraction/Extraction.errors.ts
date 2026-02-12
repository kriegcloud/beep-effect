import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Extraction/Extraction.errors");

export class ExtractionNotFoundError extends S.TaggedError<ExtractionNotFoundError>()(
  $I`ExtractionNotFoundError`,
  {
    id: KnowledgeEntityIds.ExtractionId,
  },
  $I.annotationsHttp("ExtractionNotFoundError", {
    status: 404,
    description: "Error when an extraction with the specified ID cannot be found.",
  })
) {}

export class ExtractionPermissionDeniedError extends S.TaggedError<ExtractionPermissionDeniedError>()(
  $I`ExtractionPermissionDeniedError`,
  {
    id: KnowledgeEntityIds.ExtractionId,
  },
  $I.annotationsHttp("ExtractionPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the extraction.",
  })
) {}

export const Errors = S.Union(ExtractionNotFoundError, ExtractionPermissionDeniedError);
export type Errors = typeof Errors.Type;
