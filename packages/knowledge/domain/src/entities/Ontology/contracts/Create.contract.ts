import { $KnowledgeDomainId } from "@beep/identity/packages";
import { OntologyMutationError } from "@beep/knowledge-domain/errors";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import { Model } from "../Ontology.model";

const $I = $KnowledgeDomainId.create("entities/Ontology/contracts/Create.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  Model.insert,
  $I.annotations("Payload", {
    description: "ontology_create payload",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  Model.json,
  $I.annotations("Success", {
    description: "ontology_create succeeded",
  })
) {}

export const Failure = OntologyMutationError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "create",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Create ontology Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("Create", "/create")
    .setPayload(Payload)
    .addError(OntologyMutationError)
    .addSuccess(Success, { status: 201 });
}
