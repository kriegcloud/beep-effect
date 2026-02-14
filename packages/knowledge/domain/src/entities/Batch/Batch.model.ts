import { $KnowledgeDomainId } from "@beep/identity/packages";
import { FailurePolicy } from "@beep/knowledge-domain/value-objects";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds, WorkspacesEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Batch");

export class BatchExecutionStatus extends BS.StringLiteralKit(
  "pending",
  "extracting",
  "resolving",
  "completed",
  "failed",
  "cancelled"
).annotations({
  identifier: "BatchExecutionStatus",
  description: "Status of the batch extraction run",
}) {}

export declare namespace BatchExecutionStatus {
  export type Type = typeof BatchExecutionStatus.Type;
}

export class Model extends M.Class<Model>($I`BatchExecutionModel`)(
  makeFields(KnowledgeEntityIds.BatchExecutionId, {
    organizationId: SharedEntityIds.OrganizationId,
    ontologyId: KnowledgeEntityIds.OntologyId,
    status: S.optionalWith(BatchExecutionStatus, { default: () => "pending" as const }),
    documentIds: S.Array(WorkspacesEntityIds.DocumentId),
    totalDocuments: S.NonNegativeInt,
    completedDocuments: S.optionalWith(S.NonNegativeInt, { default: () => 0 }),
    failedDocuments: S.optionalWith(S.NonNegativeInt, { default: () => 0 }),
    entityCount: BS.FieldOptionOmittable(S.NonNegativeInt),
    relationCount: BS.FieldOptionOmittable(S.NonNegativeInt),
    concurrency: S.optionalWith(S.NonNegativeInt, { default: () => 3 }),
    failurePolicy: S.optionalWith(FailurePolicy, { default: () => "continue-on-failure" as const }),
    maxRetries: S.optionalWith(S.NonNegativeInt, { default: () => 2 }),
    enableEntityResolution: S.optionalWith(S.Boolean, { default: () => true }),
    startedAt: BS.FieldOptionOmittable(BS.DateTimeUtcFromAllAcceptable),
    completedAt: BS.FieldOptionOmittable(BS.DateTimeUtcFromAllAcceptable),
    error: BS.FieldOptionOmittable(S.String),
    config: BS.FieldOptionOmittable(S.Record({ key: S.String, value: S.Unknown })),
  }),
  $I.annotations("BatchExecutionModel", {
    description: "Batch extraction execution record with status, progress tracking, and configuration.",
  })
) {
  static readonly utils = modelKit(Model);

  get isComplete(): boolean {
    return S.is(BatchExecutionStatus.derive("completed", "failed", "cancelled"))(this.status);
  }

  get isRunning(): boolean {
    return S.is(BatchExecutionStatus.derive("extracting", "resolving"))(this.status);
  }

  get isPending(): boolean {
    return BatchExecutionStatus.is.pending(this.status);
  }

  get progress(): number {
    return this.totalDocuments === 0 ? 0 : (this.completedDocuments + this.failedDocuments) / this.totalDocuments;
  }
}
