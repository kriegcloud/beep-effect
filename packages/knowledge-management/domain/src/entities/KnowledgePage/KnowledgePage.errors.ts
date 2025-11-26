import { KnowledgeManagementEntityIds } from "@beep/shared-domain";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

export class KnowledgePageSlugConflictError extends S.TaggedError<KnowledgePageSlugConflictError>(
  "@beep/knowledge-management-domain/entities/KnowledgePage/KnowledgePageSlugConflictError"
)(
  "KnowledgePageSlugConflictError",
  {
    slug: S.String,
  },
  HttpApiSchema.annotations({
    status: 400,
  })
) {}

export class KnowledgePageCircularReferenceError extends S.TaggedError<KnowledgePageCircularReferenceError>(
  "@beep/knowledge-management-domain/entities/KnowledgePage/KnowledgePageCircularReferenceError"
)(
  "KnowledgePageCircularReferenceError",
  {
    pageId: S.String,
    newParentId: S.String,
  },
  HttpApiSchema.annotations({
    status: 400,
  })
) {}

export class KnowledgePageNotFoundError extends S.TaggedError<KnowledgePageNotFoundError>(
  "@beep/knowledge-management-domain/entities/KnowledgePage/KnowledgePageNotFoundError"
)(
  "KnowledgePageNotFoundError",
  {
    id: KnowledgeManagementEntityIds.KnowledgePageId,
  },
  HttpApiSchema.annotations({
    status: 404,
  })
) {}
