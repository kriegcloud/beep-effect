import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/batch");

export class InvalidStateTransitionError extends S.TaggedError<InvalidStateTransitionError>(
  $I`InvalidStateTransitionError`
)(
  "InvalidStateTransitionError",
  {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    currentState: S.String,
    attemptedState: S.String,
  },
  $I.annotations("InvalidStateTransitionError", {
    description: "Attempted an invalid batch state transition",
  })
) {
  override get message(): string {
    return `Invalid state transition for batch ${this.batchId}: cannot move from '${this.currentState}' to '${this.attemptedState}'`;
  }
}

export class BatchNotFoundError extends S.TaggedError<BatchNotFoundError>($I`BatchNotFoundError`)(
  "BatchNotFoundError",
  {
    batchId: KnowledgeEntityIds.BatchExecutionId,
  },
  $I.annotations("BatchNotFoundError", {
    description: "Batch execution not found",
  })
) {
  static readonly new = (batchId: KnowledgeEntityIds.BatchExecutionId.Type) =>
    new BatchNotFoundError({batchId});

  static readonly newThunk = (batchId: KnowledgeEntityIds.BatchExecutionId.Type) => () => BatchNotFoundError.new(batchId)

  override get message(): string {
    return `Batch execution not found: ${this.batchId}`;
  }
}

export class BatchAlreadyRunningError extends S.TaggedError<BatchAlreadyRunningError>($I`BatchAlreadyRunningError`)(
  "BatchAlreadyRunningError",
  {
    batchId: KnowledgeEntityIds.BatchExecutionId,
  },
  $I.annotations("BatchAlreadyRunningError", {
    description: "Cannot start a batch that is already running",
  })
) {
  override get message(): string {
    return `Batch ${this.batchId} is already running`;
  }
}

export class BatchInfrastructureError extends S.TaggedError<BatchInfrastructureError>($I`BatchInfrastructureError`)(
  "BatchInfrastructureError",
  {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    operation: S.String,
    reason: S.String,
  },
  $I.annotations("BatchInfrastructureError", {
    description: "Infrastructure failure while handling batch execution",
  })
) {
  override get message(): string {
    return `Batch infrastructure failure during '${this.operation}' for ${this.batchId}: ${this.reason}`;
  }
}
