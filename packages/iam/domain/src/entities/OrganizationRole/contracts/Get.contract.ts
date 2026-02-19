import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as OrganizationRoleErrors from "../OrganizationRole.errors";
import * as OrganizationRole from "../OrganizationRole.model";

const $I = $IamDomainId.create("entities/OrganizationRole/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  { id: IamEntityIds.OrganizationRoleId },
  $I.annotations("Payload", { description: "Payload for the Get OrganizationRole Contract." })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  { data: OrganizationRole.Model.json },
  $I.annotations("Success", { description: "Success response for the Get OrganizationRole Contract." })
) {}

export const Failure = OrganizationRoleErrors.OrganizationRoleNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  { payload: Payload.fields, success: Success, failure: Failure },
  $I.annotationsHttp("Contract", { description: "Get OrganizationRole Request Contract." })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(OrganizationRoleErrors.OrganizationRoleNotFoundError)
    .addSuccess(Success);
}
