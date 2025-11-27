import { BS } from "@beep/schema";
import { KnowledgeManagementEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

/**
 * Comment model representing individual comments within discussions.
 * Supports both plain text and rich text content formats,
 * with tracking for edited status.
 */
export class Model extends M.Class<Model>(`CommentModel`)(
  makeFields(KnowledgeManagementEntityIds.CommentId, {
    organizationId: SharedEntityIds.OrganizationId,
    discussionId: KnowledgeManagementEntityIds.DiscussionId,
    userId: SharedEntityIds.UserId,
    content: S.String,
    contentRich: BS.FieldOptionOmittable(S.Unknown),
    isEdited: BS.toOptionalWithDefault(S.Boolean)(false),
  })
) {
  static readonly utils = modelKit(Model);
}
