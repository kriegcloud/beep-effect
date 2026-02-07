import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BatchNotFoundError } from "@beep/knowledge-domain/errors";
import { BatchEvent } from "@beep/knowledge-domain/value-objects";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Batch/StreamProgress");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    batchId: KnowledgeEntityIds.BatchExecutionId,
  },
  $I.annotations("Payload", {
    description: "batch_streamProgress payload",
  })
) {}

export const Success = BatchEvent.annotations(
  $I.annotations("Success", {
    description: "Batch progress event stream element",
  })
);

export const Error = BatchNotFoundError.annotations(
  $I.annotations("Error", {
    description: "batch_streamProgress failed",
  })
);

export const Contract = Rpc.make("streamProgress", {
  payload: Payload,
  success: Success,
  error: Error,
  stream: true,
});
