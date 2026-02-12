import { $KnowledgeDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as MentionRecord from "../MentionRecord.model";

const $I = $KnowledgeDomainId.create("entities/MentionRecord/contracts/FindUnresolved.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    limit: S.optionalWith(S.Number.pipe(S.int(), S.between(1, 1000)), { default: () => 100 }),
  },
  $I.annotations("Payload", {
    description: "Payload for the FindUnresolved MentionRecord contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(MentionRecord.Model.json),
  },
  $I.annotations("Success", {
    description: "Success response for the FindUnresolved MentionRecord contract.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "FindUnresolved",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Find unresolved MentionRecords Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("FindUnresolved", "/unresolved")
    .setPayload(Payload)
    .addSuccess(Success);
}
