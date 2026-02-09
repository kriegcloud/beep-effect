import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, IamEntityIds, KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/EmailThreadMessage");

export class Model extends M.Class<Model>($I`EmailThreadMessageModel`)(
  makeFields(KnowledgeEntityIds.EmailThreadMessageId, {
    organizationId: SharedEntityIds.OrganizationId,
    threadId: KnowledgeEntityIds.EmailThreadId,
    providerAccountId: IamEntityIds.AccountId,
    sourceId: S.String,
    documentId: DocumentsEntityIds.DocumentId,
    sourceInternalDate: BS.FieldOptionOmittable(BS.DateTimeUtcFromAllAcceptable),
    sourceHistoryId: BS.FieldOptionOmittable(S.String),
    sourceHash: BS.FieldOptionOmittable(S.String),
    ingestSeq: S.NonNegativeInt,
    sortKey: S.String,
  }),
  $I.annotations("EmailThreadMessageModel", {
    description: "Knowledge-owned thread message row mapping source ids to Documents (PR2B).",
  })
) {
  static readonly utils = modelKit(Model);
}
