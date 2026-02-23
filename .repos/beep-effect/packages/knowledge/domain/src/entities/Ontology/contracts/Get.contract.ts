import { $KnowledgeDomainId } from "@beep/identity/packages";
import { OntologyNotFoundError } from "@beep/knowledge-domain/errors";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import { Model } from "../Ontology.model";

const $I = $KnowledgeDomainId.create("entities/Ontology/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: KnowledgeEntityIds.OntologyId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("Payload", {
    description: "ontology_get payload",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  Model.json,
  $I.annotations("Success", {
    description: "ontology_get succeeded",
  })
) {}

export const Failure = OntologyNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "get",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get ontology Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(OntologyNotFoundError)
    .addSuccess(Success);
}
