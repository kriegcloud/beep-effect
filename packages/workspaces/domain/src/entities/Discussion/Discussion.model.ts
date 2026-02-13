import { $WorkspacesDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { WorkspacesEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $WorkspacesDomainId.create("entities/Discussion/Discussion.model");

export class Model extends M.Class<Model>($I`DiscussionModel`)(
  makeFields(WorkspacesEntityIds.DiscussionId, {
    organizationId: SharedEntityIds.OrganizationId,
    documentId: WorkspacesEntityIds.DocumentId,
    userId: SharedEntityIds.UserId,
    documentContent: S.String,
    documentContentRich: BS.FieldOptionOmittable(S.Unknown),
    isResolved: BS.toOptionalWithDefault(S.Boolean)(false),
  }),
  $I.annotations("DiscussionModel", {
    description: "Discussion model representing discussion threads attached to documents.",
  })
) {
  static readonly utils = modelKit(Model);
}
