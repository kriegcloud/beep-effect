import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Embedding/Embedding.errors");

export class EmbeddingNotFoundError extends S.TaggedError<EmbeddingNotFoundError>()(
  $I`EmbeddingNotFoundError`,
  {
    id: KnowledgeEntityIds.EmbeddingId,
  },
  $I.annotationsHttp("EmbeddingNotFoundError", {
    status: 404,
    description: "Error when an embedding with the specified ID cannot be found.",
  })
) {}

export class EmbeddingPermissionDeniedError extends S.TaggedError<EmbeddingPermissionDeniedError>()(
  $I`EmbeddingPermissionDeniedError`,
  {
    id: KnowledgeEntityIds.EmbeddingId,
  },
  $I.annotationsHttp("EmbeddingPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the embedding.",
  })
) {}

export const Errors = S.Union(EmbeddingNotFoundError, EmbeddingPermissionDeniedError);
export type Errors = typeof Errors.Type;
