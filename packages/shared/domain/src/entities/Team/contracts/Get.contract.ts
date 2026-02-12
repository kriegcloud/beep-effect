import { $SharedDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as TeamErrors from "../Team.errors";
import * as Team from "../Team.model";

const $I = $SharedDomainId.create("entities/Team/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: SharedEntityIds.TeamId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Get Team Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: Team.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Get Team Contract.",
  })
) {}

export const Failure = TeamErrors.TeamNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get Team Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(TeamErrors.TeamNotFoundError)
    .addSuccess(Success);
}
