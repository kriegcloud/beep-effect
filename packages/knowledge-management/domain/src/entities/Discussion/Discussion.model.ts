import { BS } from "@beep/schema";
import { KnowledgeManagementEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

/**
 * Discussion model representing discussion threads attached to documents.
 * Contains the highlighted document content that spawned the discussion,
 * along with resolution status for tracking completed discussions.
 */
export class Model extends M.Class<Model>(`DiscussionModel`)(
  makeFields(KnowledgeManagementEntityIds.DiscussionId, {
    organizationId: SharedEntityIds.OrganizationId,
    documentId: KnowledgeManagementEntityIds.DocumentId,
    userId: SharedEntityIds.UserId,
    documentContent: S.String,
    documentContentRich: BS.FieldOptionOmittable(S.Unknown),
    isResolved: BS.toOptionalWithDefault(S.Boolean)(false),
  })
) {
  static readonly utils = modelKit(Model);
}
