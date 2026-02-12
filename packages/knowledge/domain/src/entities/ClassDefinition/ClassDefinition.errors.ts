import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/ClassDefinition/ClassDefinition.errors");

export class ClassDefinitionNotFoundError extends S.TaggedError<ClassDefinitionNotFoundError>()(
  $I`ClassDefinitionNotFoundError`,
  {
    id: KnowledgeEntityIds.ClassDefinitionId,
  },
  $I.annotationsHttp("ClassDefinitionNotFoundError", {
    status: 404,
    description: "Error when a class definition with the specified ID cannot be found.",
  })
) {}

export class ClassDefinitionPermissionDeniedError extends S.TaggedError<ClassDefinitionPermissionDeniedError>()(
  $I`ClassDefinitionPermissionDeniedError`,
  {
    id: KnowledgeEntityIds.ClassDefinitionId,
  },
  $I.annotationsHttp("ClassDefinitionPermissionDeniedError", {
    status: 403,
    description:
      "Thrown when the user lacks permission to perform the requested action on the class definition.",
  })
) {}

export const Errors = S.Union(ClassDefinitionNotFoundError, ClassDefinitionPermissionDeniedError);
export type Errors = typeof Errors.Type;
