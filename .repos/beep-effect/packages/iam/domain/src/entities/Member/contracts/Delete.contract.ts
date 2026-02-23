import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as MemberErrors from "../Member.errors";

const $I = $IamDomainId.create("entities/Member/contracts/Delete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  { id: IamEntityIds.MemberId },
  $I.annotations("Payload", { description: "Payload for the Delete Member Contract." })
) {}

export const Success = S.Void;
export type Success = typeof Success.Type;

export const Failure = S.Union(MemberErrors.MemberNotFoundError, MemberErrors.MemberPermissionDeniedError);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Delete",
  { payload: Payload.fields, success: Success, failure: Failure },
  $I.annotationsHttp("Contract", { description: "Delete Member Request Contract." })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("Delete", "/:id")
    .setPayload(Payload)
    .addError(MemberErrors.MemberNotFoundError)
    .addError(MemberErrors.MemberPermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}
