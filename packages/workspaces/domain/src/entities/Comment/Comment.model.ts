/**
 * Comment model schema.
 *
 * This is the canonical schema for Comment data at the domain boundary.
 * Server persistence layers should prefer `Model.insert` / `Model.update` when decoding inputs
 * so defaults are applied consistently.
 *
 * @module documents-domain/entities/Comment/Comment.model
 * @since 1.0.0
 * @category models
 */
import { $WorkspacesDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { WorkspacesEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { SerializedEditorStateEnvelope } from "../../value-objects";

const $I = $WorkspacesDomainId.create("entities/Comment/Comment.model");

/**
 * Comment model representing individual comments within discussions.
 * Supports both plain text and rich text content formats,
 * with tracking for edited status.
 *
 * @since 1.0.0
 * @category models
 */
export class Model extends M.Class<Model>($I`CommentModel`)(
  makeFields(WorkspacesEntityIds.CommentId, {
    organizationId: SharedEntityIds.OrganizationId,
    discussionId: WorkspacesEntityIds.DiscussionId,
    userId: SharedEntityIds.UserId,
    content: S.String,
    contentRich: BS.FieldOptionOmittable(SerializedEditorStateEnvelope),
    isEdited: BS.BoolWithDefault(false),
  }),
  $I.annotations("CommentModel", {
    description: "Comment model representing individual comments within discussions.",
  })
) {
  static readonly utils = modelKit(Model);
}
