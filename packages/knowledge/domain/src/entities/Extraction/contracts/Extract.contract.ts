import { $KnowledgeDomainId } from "@beep/identity/packages";
import { ExtractionError } from "@beep/knowledge-domain/errors";
import { ExtractionConfig } from "@beep/knowledge-domain/value-objects";
import { KnowledgeEntityIds, SharedEntityIds, WorkspacesEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import { Model } from "../Extraction.model";

const $I = $KnowledgeDomainId.create("entities/Extraction/contracts/Extract.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    documentId: WorkspacesEntityIds.DocumentId,
    organizationId: SharedEntityIds.OrganizationId,
    ontologyId: KnowledgeEntityIds.OntologyId,
    sourceUri: S.optional(S.String),
    config: S.optional(ExtractionConfig),
  },
  $I.annotations("Payload", {
    description: "extraction_extract payload",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  Model.json,
  $I.annotations("Success", {
    description: "extraction_extract completed successfully",
  })
) {}

export const Failure = ExtractionError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "extract",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Extract knowledge Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("Extract", "/extract")
    .setPayload(Payload)
    .addError(ExtractionError)
    .addSuccess(Success);
}
