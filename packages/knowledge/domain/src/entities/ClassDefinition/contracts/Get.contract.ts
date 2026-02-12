import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as ClassDefinitionErrors from "../ClassDefinition.errors";
import * as ClassDefinition from "../ClassDefinition.model";

const $I = $KnowledgeDomainId.create("entities/ClassDefinition/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: KnowledgeEntityIds.ClassDefinitionId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Get ClassDefinition Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: ClassDefinition.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Get ClassDefinition Contract.",
  })
) {}

export const Failure = ClassDefinitionErrors.ClassDefinitionNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get ClassDefinition Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(ClassDefinitionErrors.ClassDefinitionNotFoundError)
    .addSuccess(Success);
}
