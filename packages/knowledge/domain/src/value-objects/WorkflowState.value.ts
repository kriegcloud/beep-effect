import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $KnowledgeDomainId.create("value-objects/workflow-state");

export class WorkflowExecutionStatus extends BS.StringLiteralKit(
  "pending",
  "running",
  "completed",
  "failed",
  "cancelled"
).annotations(
  $I.annotations("WorkflowExecutionStatus", {
    description: "Status of a workflow execution",
  })
) {}

export declare namespace WorkflowExecutionStatus {
  export type Type = typeof WorkflowExecutionStatus.Type;
}

export class WorkflowActivityStatus extends BS.StringLiteralKit(
  "pending",
  "running",
  "completed",
  "failed",
  "skipped"
).annotations(
  $I.annotations("WorkflowActivityStatus", {
    description: "Status of a workflow activity",
  })
) {}

export declare namespace WorkflowActivityStatus {
  export type Type = typeof WorkflowActivityStatus.Type;
}

export class WorkflowType extends BS.StringLiteralKit("extraction", "batch_extraction").annotations(
  $I.annotations("WorkflowType", {
    description: "Type of workflow",
  })
) {}

export declare namespace WorkflowType {
  export type Type = typeof WorkflowType.Type;
}
