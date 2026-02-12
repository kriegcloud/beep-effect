import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as OntologyErrors from "../Ontology.errors";

const $I = $KnowledgeDomainId.create("entities/Ontology/contracts/Delete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: KnowledgeEntityIds.OntologyId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Delete Ontology contract.",
  })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", {
    description: "Success response for the Delete Ontology contract.",
  })
) {}

export const Failure = S.Union(OntologyErrors.OntologyNotFoundError, OntologyErrors.OntologyPermissionDeniedError);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Delete",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Delete Ontology Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("Delete", "/:id")
    .setPayload(Payload)
    .addError(OntologyErrors.OntologyNotFoundError)
    .addError(OntologyErrors.OntologyPermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}
