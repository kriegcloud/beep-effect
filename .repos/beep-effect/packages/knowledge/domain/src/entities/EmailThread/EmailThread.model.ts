import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as A from "effect/Array";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/EmailThread");

export class SourceType extends BS.StringLiteralKit("gmail").annotations(
  $I.annotations("EmailThreadSourceType", {
    description: "Thread source discriminator (MVP: Gmail only).",
  })
) {}

export declare namespace SourceType {
  export type Type = typeof SourceType.Type;
}

export class Model extends M.Class<Model>($I`EmailThreadModel`)(
  makeFields(KnowledgeEntityIds.EmailThreadId, {
    organizationId: SharedEntityIds.OrganizationId,
    providerAccountId: IamEntityIds.AccountId,
    sourceType: S.optionalWith(SourceType, { default: () => "gmail" as const }),
    sourceThreadId: S.String,
    subject: BS.FieldOptionOmittable(S.String),
    participants: S.optionalWith(S.Array(S.String), { default: A.empty<string> }),
    dateRangeEarliest: BS.FieldOptionOmittable(BS.DateTimeUtcFromAllAcceptable),
    dateRangeLatest: BS.FieldOptionOmittable(BS.DateTimeUtcFromAllAcceptable),
    lastSyncedAt: BS.FieldOptionOmittable(BS.DateTimeUtcFromAllAcceptable),
  }),
  $I.annotations("EmailThreadModel", {
    description: "Knowledge-owned email thread read model (PR2B).",
  })
) {
  static readonly utils = modelKit(Model);
}
