import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as OrganizationRoleErrors from "../OrganizationRole.errors";

const $I = $IamDomainId.create("entities/OrganizationRole/contracts/Delete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  { id: IamEntityIds.OrganizationRoleId },
  $I.annotations("Payload", { description: "Payload for the Delete OrganizationRole Contract." })
) {}

export const Success = S.Void;
export type Success = typeof Success.Type;

export const Failure = S.Union(
  OrganizationRoleErrors.OrganizationRoleNotFoundError,
  OrganizationRoleErrors.OrganizationRolePermissionDeniedError
);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Delete",
  { payload: Payload.fields, success: Success, failure: Failure },
  $I.annotationsHttp("Contract", { description: "Delete OrganizationRole Request Contract." })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("Delete", "/:id")
    .setPayload(Payload)
    .addError(OrganizationRoleErrors.OrganizationRoleNotFoundError)
    .addError(OrganizationRoleErrors.OrganizationRolePermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}
