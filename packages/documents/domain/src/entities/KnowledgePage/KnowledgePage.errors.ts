import { DocumentsEntityIds } from "@beep/shared-domain";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

export class KnowledgePageSlugConflictError extends S.TaggedError<KnowledgePageSlugConflictError>(
  "@beep/documents-domain/entities/KnowledgePage/KnowledgePageSlugConflictError"
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
  "@beep/documents-domain/entities/KnowledgePage/KnowledgePageCircularReferenceError"
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
  "@beep/documents-domain/entities/KnowledgePage/KnowledgePageNotFoundError"
)(
  "KnowledgePageNotFoundError",
  {
    id: S.optional(DocumentsEntityIds.KnowledgePageId),
    slug: S.optional(S.String),
  },
  HttpApiSchema.annotations({
    status: 404,
  })
) {}
