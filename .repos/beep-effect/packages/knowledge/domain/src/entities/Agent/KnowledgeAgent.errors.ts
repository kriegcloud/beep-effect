import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Agent/KnowledgeAgent.errors");

export class KnowledgeAgentNotFoundError extends S.TaggedError<KnowledgeAgentNotFoundError>()(
  $I`KnowledgeAgentNotFoundError`,
  {
    id: KnowledgeEntityIds.KnowledgeAgentId,
  },
  $I.annotationsHttp("KnowledgeAgentNotFoundError", {
    status: 404,
    description: "Error when a knowledge agent with the specified ID cannot be found.",
  })
) {}

export class KnowledgeAgentPermissionDeniedError extends S.TaggedError<KnowledgeAgentPermissionDeniedError>()(
  $I`KnowledgeAgentPermissionDeniedError`,
  {
    id: KnowledgeEntityIds.KnowledgeAgentId,
  },
  $I.annotationsHttp("KnowledgeAgentPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the knowledge agent.",
  })
) {}

export const Errors = S.Union(KnowledgeAgentNotFoundError, KnowledgeAgentPermissionDeniedError);
export type Errors = typeof Errors.Type;
