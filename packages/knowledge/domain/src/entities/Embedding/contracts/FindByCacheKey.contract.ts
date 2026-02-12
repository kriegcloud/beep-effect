import { $KnowledgeDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as Embedding from "../Embedding.model";

const $I = $KnowledgeDomainId.create("entities/Embedding/contracts/FindByCacheKey.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    cacheKey: S.String,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("Payload", {
    description: "Payload for the FindByCacheKey Embedding contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.optionalWith(Embedding.Model.json, { as: "Option" }),
  },
  $I.annotations("Success", {
    description: "Success response for the FindByCacheKey Embedding contract. Data is null when no match found.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "FindByCacheKey",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Find Embedding by cache key Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("FindByCacheKey", "/by-cache-key").setPayload(Payload).addSuccess(Success);
}
