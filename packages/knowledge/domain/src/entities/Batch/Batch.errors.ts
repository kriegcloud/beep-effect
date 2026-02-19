import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Batch/Batch.errors");

export class BatchNotFoundError extends S.TaggedError<BatchNotFoundError>()(
  $I`BatchNotFoundError`,
  {
    id: KnowledgeEntityIds.BatchExecutionId,
  },
  $I.annotationsHttp("BatchNotFoundError", {
    status: 404,
    description: "Error when a batch execution with the specified ID cannot be found.",
  })
) {}

export class BatchPermissionDeniedError extends S.TaggedError<BatchPermissionDeniedError>()(
  $I`BatchPermissionDeniedError`,
  {
    id: KnowledgeEntityIds.BatchExecutionId,
  },
  $I.annotationsHttp("BatchPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the batch execution.",
  })
) {}

export const Errors = S.Union(BatchNotFoundError, BatchPermissionDeniedError);
export type Errors = typeof Errors.Type;
