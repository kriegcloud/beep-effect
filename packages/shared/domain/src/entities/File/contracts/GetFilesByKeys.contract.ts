import { $SharedDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as File from "../File.model";

const $I = $SharedDomainId.create("entities/File/contracts/GetFilesByKeys.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    keys: S.Array(File.Model.fields.key),
    userId: SharedEntityIds.UserId,
  },
  $I.annotations("Payload", {
    description: "Payload for the GetFilesByKeys contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(S.NullOr(File.Model.json)),
  },
  $I.annotations("Success", {
    description: "Success response for the GetFilesByKeys contract. Null entries indicate missing files.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "GetFilesByKeys",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get Files By Keys Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("GetFilesByKeys", "/by-keys").setPayload(Payload).addSuccess(Success);
}
