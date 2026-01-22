import { $DocumentsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $DocumentsDomainId.create("entities/comment/comment.model");

/**
 * Comment model representing individual comments within discussions.
 * Supports both plain text and rich text content formats,
 * with tracking for edited status.
 */
export class Model extends M.Class<Model>($I`CommentModel`)(
  makeFields(DocumentsEntityIds.CommentId, {
    organizationId: SharedEntityIds.OrganizationId,
    discussionId: DocumentsEntityIds.DiscussionId,
    userId: SharedEntityIds.UserId,
    content: S.String,
    contentRich: BS.FieldOptionOmittable(S.Unknown),
    isEdited: BS.toOptionalWithDefault(S.Boolean)(false),
  }),
  $I.annotations("CommentModel", {
    description: "Comment model representing individual comments within discussions.",
  })
) {
  static readonly utils = modelKit(Model);
}
