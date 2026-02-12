import { $SharedDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as SessionErrors from "../Session.errors";

const $I = $SharedDomainId.create("entities/Session/contracts/Delete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: SharedEntityIds.SessionId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Delete Session contract.",
  })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", {
    description: "Success response for the Delete Session contract.",
  })
) {}

export const Failure = S.Union(
  SessionErrors.SessionNotFoundError,
  SessionErrors.SessionPermissionDeniedError,
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
    description: "Delete Session Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("Delete", "/:id")
    .setPayload(Payload)
    .addError(SessionErrors.SessionNotFoundError)
    .addError(SessionErrors.SessionPermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}
