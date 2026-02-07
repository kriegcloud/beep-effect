import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/workflow");

export class WorkflowNotFoundError extends S.TaggedError<WorkflowNotFoundError>($I`WorkflowNotFoundError`)(
  "WorkflowNotFoundError",
  {
    executionId: KnowledgeEntityIds.WorkflowExecutionId,
  },
  $I.annotations("WorkflowNotFoundError", {
    description: "Workflow execution not found",
  })
) {
  override get message(): string {
    return `Workflow execution not found: ${this.executionId}`;
  }
}

export class ActivityFailedError extends S.TaggedError<ActivityFailedError>($I`ActivityFailedError`)(
  "ActivityFailedError",
  {
    executionId: KnowledgeEntityIds.WorkflowExecutionId,
    activityName: S.String,
    attempt: S.NonNegativeInt,
    cause: S.optionalWith(S.String, { default: () => "" }),
  },
  $I.annotations("ActivityFailedError", {
    description: "Workflow activity failed after all retries",
  })
) {
  override get message(): string {
    return `Activity '${this.activityName}' failed on attempt ${this.attempt}: ${this.cause}`;
  }
}

export class WorkflowStateError extends S.TaggedError<WorkflowStateError>($I`WorkflowStateError`)(
  "WorkflowStateError",
  {
    executionId: KnowledgeEntityIds.WorkflowExecutionId,
    currentStatus: S.String,
    expectedStatus: S.String,
  },
  $I.annotations("WorkflowStateError", {
    description: "Invalid workflow state",
  })
) {
  override get message(): string {
    return `Workflow ${this.executionId} is in '${this.currentStatus}' state, expected '${this.expectedStatus}'`;
  }
}
