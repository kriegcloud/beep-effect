import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/PropertyDefinition/PropertyDefinition.errors");

export class PropertyDefinitionNotFoundError extends S.TaggedError<PropertyDefinitionNotFoundError>()(
  $I`PropertyDefinitionNotFoundError`,
  {
    id: KnowledgeEntityIds.PropertyDefinitionId,
  },
  $I.annotationsHttp("PropertyDefinitionNotFoundError", {
    status: 404,
    description: "Error when a property definition with the specified ID cannot be found.",
  })
) {}

export class PropertyDefinitionPermissionDeniedError extends S.TaggedError<PropertyDefinitionPermissionDeniedError>()(
  $I`PropertyDefinitionPermissionDeniedError`,
  {
    id: KnowledgeEntityIds.PropertyDefinitionId,
  },
  $I.annotationsHttp("PropertyDefinitionPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the property definition.",
  })
) {}

export const Errors = S.Union(PropertyDefinitionNotFoundError, PropertyDefinitionPermissionDeniedError);
export type Errors = typeof Errors.Type;
