import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { WorkspacesEntityIds, KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Extraction");

export class ExtractionStatus extends BS.StringLiteralKit(
  "pending",
  "running",
  "completed",
  "failed",
  "cancelled"
).annotations({
  identifier: "ExtractionStatus",
  description: "Status of the extraction run",
}) {}

export declare namespace ExtractionStatus {
  export type Type = typeof ExtractionStatus.Type;
}

export class Model extends M.Class<Model>($I`ExtractionModel`)(
  makeFields(KnowledgeEntityIds.ExtractionId, {
    organizationId: SharedEntityIds.OrganizationId,
    documentId: WorkspacesEntityIds.DocumentId,
    documentVersionId: BS.FieldOptionOmittable(WorkspacesEntityIds.DocumentVersionId),
    sourceUri: BS.FieldOptionOmittable(S.String),
    ontologyId: KnowledgeEntityIds.OntologyId,
    status: S.optionalWith(ExtractionStatus, { default: () => "pending" as const }),
    startedAt: BS.FieldOptionOmittable(BS.DateTimeUtcFromAllAcceptable),
    completedAt: BS.FieldOptionOmittable(BS.DateTimeUtcFromAllAcceptable),
    entityCount: BS.FieldOptionOmittable(S.NonNegativeInt),
    relationCount: BS.FieldOptionOmittable(S.NonNegativeInt),
    chunkCount: BS.FieldOptionOmittable(S.NonNegativeInt),
    totalTokens: BS.FieldOptionOmittable(S.NonNegativeInt),
    errorMessage: BS.FieldOptionOmittable(S.String),
    config: BS.FieldOptionOmittable(S.Record({ key: S.String, value: S.Unknown })),
  }),
  $I.annotations("ExtractionModel", {
    description: "Knowledge extraction run record with status and statistics.",
  })
) {
  static readonly utils = modelKit(Model);

  get isComplete(): boolean {
    return S.is(ExtractionStatus.derive("completed", "failed", "cancelled"))(this.status);
  }

  get isRunning(): boolean {
    return ExtractionStatus.is.running(this.status);
  }
}
