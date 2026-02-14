import { $WorkspacesDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds, WorkspacesEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $WorkspacesDomainId.create("entities/DocumentSource/DocumentSource.model");

export class Model extends M.Class<Model>($I`DocumentSourceModel`)(
  makeFields(WorkspacesEntityIds.DocumentSourceId, {
    organizationId: SharedEntityIds.OrganizationId,
    documentId: WorkspacesEntityIds.DocumentId,
    userId: SharedEntityIds.UserId,
    providerAccountId: IamEntityIds.AccountId,
    sourceType: S.String,
    sourceId: S.String,
    sourceThreadId: BS.FieldOptionOmittable(S.String),
    sourceUri: BS.FieldOptionOmittable(S.String),
    sourceInternalDate: BS.FieldOptionOmittable(BS.DateTimeUtcFromAllAcceptable),
    sourceHistoryId: BS.FieldOptionOmittable(S.String),
    sourceHash: S.String,
  }),
  $I.annotations("DocumentSourceModel", {
    description: "Documents provenance mapping from external source ids to internal document ids.",
  })
) {
  static readonly utils = modelKit(Model);
}
