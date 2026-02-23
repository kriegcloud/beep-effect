import { $KnowledgeDomainId } from "@beep/identity/packages";
import { ExtractionError } from "@beep/knowledge-domain/errors";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import { Model } from "../Extraction.model";

const $I = $KnowledgeDomainId.create("entities/Extraction/contracts/GetStatus.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: KnowledgeEntityIds.ExtractionId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("Payload", {
    description: "extraction_getStatus payload",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  Model.json,
  $I.annotations("Success", {
    description: "extraction_getStatus succeeded",
  })
) {}

export const Failure = ExtractionError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "getStatus",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get extraction status Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("GetStatus", "/status")
    .setPayload(Payload)
    .addError(ExtractionError)
    .addSuccess(Success);
}
