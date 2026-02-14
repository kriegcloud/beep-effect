import { $WorkspacesDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { SharedEntityIds, WorkspacesEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { AccessLevel, ShareType } from "../../value-objects";

const $I = $WorkspacesDomainId.create("entities/PageShare/PageShare.model");

export class Model extends M.Class<Model>($I`PageShareModel`)(
  makeFields(WorkspacesEntityIds.PageShareId, {
    pageId: WorkspacesEntityIds.PageId,
    organizationId: SharedEntityIds.OrganizationId,
    shareType: ShareType,
    granteeId: BS.FieldOptionOmittable(S.String),
    accessLevel: BS.toOptionalWithDefault(AccessLevel)("view"),
    shareToken: BS.FieldOptionOmittable(S.String),
    expiresAt: BS.FieldOptionOmittable(BS.DateTimeUtcFromAllAcceptable),
    grantedBy: SharedEntityIds.UserId,
  }),
  $I.annotations("PageShareModel", {
    description: "Page share permission entry with grantee type, access level, and optional expiration.",
  })
) {
  static readonly utils = modelKit(Model);
}
