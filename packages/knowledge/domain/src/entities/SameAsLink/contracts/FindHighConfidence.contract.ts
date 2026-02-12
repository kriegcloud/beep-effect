import { $KnowledgeDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as SameAsLink from "../SameAsLink.model";

const $I = $KnowledgeDomainId.create("entities/SameAsLink/contracts/FindHighConfidence.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    minConfidence: S.Number,
    organizationId: SharedEntityIds.OrganizationId,
    limit: S.optionalWith(S.Number.pipe(S.int(), S.between(1, 1000)), { default: () => 100 }),
  },
  $I.annotations("Payload", {
    description: "Payload for the FindHighConfidence SameAsLink contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(SameAsLink.Model.json),
  },
  $I.annotations("Success", {
    description: "Success response for the FindHighConfidence SameAsLink contract.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "FindHighConfidence",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Find high-confidence SameAsLinks Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("FindHighConfidence", "/high-confidence")
    .setPayload(Payload)
    .addSuccess(Success);
}
