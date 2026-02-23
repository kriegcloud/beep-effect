import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/EntityCluster/EntityCluster.errors");

export class EntityClusterNotFoundError extends S.TaggedError<EntityClusterNotFoundError>()(
  $I`EntityClusterNotFoundError`,
  {
    id: KnowledgeEntityIds.EntityClusterId,
  },
  $I.annotationsHttp("EntityClusterNotFoundError", {
    status: 404,
    description: "Error when an entity cluster with the specified ID cannot be found.",
  })
) {}

export class EntityClusterPermissionDeniedError extends S.TaggedError<EntityClusterPermissionDeniedError>()(
  $I`EntityClusterPermissionDeniedError`,
  {
    id: KnowledgeEntityIds.EntityClusterId,
  },
  $I.annotationsHttp("EntityClusterPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the entity cluster.",
  })
) {}

export const Errors = S.Union(EntityClusterNotFoundError, EntityClusterPermissionDeniedError);
export type Errors = typeof Errors.Type;
