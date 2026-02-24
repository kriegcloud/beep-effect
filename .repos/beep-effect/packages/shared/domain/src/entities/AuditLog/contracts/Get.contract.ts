import { $SharedDomainId } from "@beep/identity/packages";
import * as SharedEntityIds from "@beep/shared-domain/entity-ids/shared";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as AuditLogErrors from "../AuditLog.errors";
import * as AuditLog from "../AuditLog.model";

const $I = $SharedDomainId.create("entities/AuditLog/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: SharedEntityIds.AuditLogId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Get AuditLog Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: AuditLog.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Get AuditLog Contract.",
  })
) {}

export const Failure = AuditLogErrors.AuditLogNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get AuditLog Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(AuditLogErrors.AuditLogNotFoundError)
    .addSuccess(Success);
}
