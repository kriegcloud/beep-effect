import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/extraction-progress");

export class ExtractionProgressStatus extends BS.StringLiteralKit("started", "completed", "failed").annotations(
  $I.annotations("ExtractionProgressStatus", {
    description: "Lifecycle status for an extraction progress event.",
  })
) {}

export class ExtractionProgressEvent extends S.Class<ExtractionProgressEvent>($I`ExtractionProgressEvent`)(
  {
    executionId: KnowledgeEntityIds.WorkflowExecutionId,
    activityName: S.String,
    status: ExtractionProgressStatus,
    progress: S.optionalWith(S.Number.pipe(S.between(0, 1)), {
      default: () => 0,
    }),
    message: S.optionalWith(S.String, { default: () => "" }),
    timestamp: BS.DateTimeUtcFromAllAcceptable,
  },
  $I.annotations("ExtractionProgressEvent", {
    description: "Progress event emitted during extraction workflow stages",
  })
) {}

export declare namespace ExtractionProgressEvent {
  export type Type = typeof ExtractionProgressEvent.Type;
}
