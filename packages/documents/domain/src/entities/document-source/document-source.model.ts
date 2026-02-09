import { $DocumentsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $DocumentsDomainId.create("entities/document-source/document-source.model");

/**
 * DocumentSource is a Documents-owned provenance mapping from an external source
 * (e.g. Gmail message id) to a durable `documentId`, with strict idempotency semantics.
 *
 * Key invariant (C-03 / D-07):
 * - Unique forever on `(organizationId, providerAccountId, sourceType, sourceId)` (tombstone + resurrect).
 */
export class Model extends M.Class<Model>($I`DocumentSourceModel`)(
  makeFields(DocumentsEntityIds.DocumentSourceId, {
    organizationId: SharedEntityIds.OrganizationId,
    documentId: DocumentsEntityIds.DocumentId,
    userId: SharedEntityIds.UserId,

    // Cross-slice boundary safety: store IAM `account.id` as a typed string (no FK).
    providerAccountId: IamEntityIds.AccountId,

    sourceType: S.String,
    sourceId: S.String,

    sourceThreadId: BS.FieldOptionOmittable(S.String),
    sourceUri: BS.FieldOptionOmittable(S.String),
    sourceInternalDate: BS.FieldOptionOmittable(BS.DateTimeUtcFromAllAcceptable),
    sourceHistoryId: BS.FieldOptionOmittable(S.String),

    // sha256(canonicalJson({ title, content })) where `content` is the exact persisted string used for highlighting.
    sourceHash: S.String,
  }),
  $I.annotations("DocumentSourceModel", {
    description: "Documents provenance mapping from external source ids to internal document ids.",
  })
) {
  static readonly utils = modelKit(Model);
}
