import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as ClassDefinitionErrors from "../ClassDefinition.errors";

const $I = $KnowledgeDomainId.create("entities/ClassDefinition/contracts/Delete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: KnowledgeEntityIds.ClassDefinitionId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Delete ClassDefinition contract.",
  })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", {
    description: "Success response for the Delete ClassDefinition contract.",
  })
) {}

export const Failure = S.Union(
  ClassDefinitionErrors.ClassDefinitionNotFoundError,
  ClassDefinitionErrors.ClassDefinitionPermissionDeniedError
);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Delete",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Delete ClassDefinition Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("Delete", "/:id")
    .setPayload(Payload)
    .addError(ClassDefinitionErrors.ClassDefinitionNotFoundError)
    .addError(ClassDefinitionErrors.ClassDefinitionPermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}
