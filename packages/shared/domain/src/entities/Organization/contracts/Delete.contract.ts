import { $SharedDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as OrganizationErrors from "../Organization.errors";

const $I = $SharedDomainId.create("entities/Organization/contracts/Delete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: SharedEntityIds.OrganizationId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Delete Organization contract.",
  })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", {
    description: "Success response for the Delete Organization contract.",
  })
) {}

export const Failure = S.Union(
  OrganizationErrors.OrganizationNotFoundError,
  OrganizationErrors.OrganizationPermissionDeniedError,
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
    description: "Delete Organization Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("Delete", "/:id")
    .setPayload(Payload)
    .addError(OrganizationErrors.OrganizationNotFoundError)
    .addError(OrganizationErrors.OrganizationPermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}
