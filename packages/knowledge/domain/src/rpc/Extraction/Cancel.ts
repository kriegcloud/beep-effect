import { $KnowledgeDomainId } from "@beep/identity/packages";
import { Extraction } from "@beep/knowledge-domain/entities";
import { ExtractionError } from "@beep/knowledge-domain/errors";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Extraction/Cancel");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: KnowledgeEntityIds.ExtractionId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("Payload", {
    description: "extraction_cancel payload",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  Extraction.Model.json,
  $I.annotations("Success", {
    description: "extraction_cancel succeeded",
  })
) {}

export const Error = ExtractionError.annotations(
  $I.annotations("Error", {
    description: "extraction_cancel failed",
  })
);

export const Contract = Rpc.make("cancel", {
  payload: Payload,
  success: Success,
  error: Error,
});
