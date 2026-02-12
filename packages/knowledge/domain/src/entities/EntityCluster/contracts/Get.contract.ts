import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as EntityClusterErrors from "../EntityCluster.errors";
import * as EntityCluster from "../EntityCluster.model";

const $I = $KnowledgeDomainId.create("entities/EntityCluster/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: KnowledgeEntityIds.EntityClusterId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Get EntityCluster Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: EntityCluster.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Get EntityCluster Contract.",
  })
) {}

export const Failure = EntityClusterErrors.EntityClusterNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get EntityCluster Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(EntityClusterErrors.EntityClusterNotFoundError)
    .addSuccess(Success);
}
