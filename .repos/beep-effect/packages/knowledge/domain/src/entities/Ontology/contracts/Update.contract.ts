import { $KnowledgeDomainId } from "@beep/identity/packages";
import { OntologyMutationError, OntologyNotFoundError } from "@beep/knowledge-domain/errors";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import { Model } from "../Ontology.model";

const $I = $KnowledgeDomainId.create("entities/Ontology/contracts/Update.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  Model.update,
  $I.annotations("Payload", {
    description: "ontology_update payload",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  Model.json,
  $I.annotations("Success", {
    description: "ontology_update succeeded",
  })
) {}

export const Failure = S.Union(OntologyNotFoundError, OntologyMutationError);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "update",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Update ontology Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.patch("Update", "/update")
    .setPayload(Payload)
    .addError(OntologyNotFoundError)
    .addError(OntologyMutationError)
    .addSuccess(Success);
}
