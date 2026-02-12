import { $DocumentsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $DocumentsDomainId.create("entities/DocumentSource/DocumentSource.model");

export class Model extends M.Class<Model>($I`DocumentSourceModel`)(
  makeFields(DocumentsEntityIds.DocumentSourceId, {
    organizationId: SharedEntityIds.OrganizationId,
    documentId: DocumentsEntityIds.DocumentId,
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
