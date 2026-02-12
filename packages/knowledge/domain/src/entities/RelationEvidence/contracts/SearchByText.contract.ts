import { $KnowledgeDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as RelationEvidence from "../RelationEvidence.model";

const $I = $KnowledgeDomainId.create("entities/RelationEvidence/contracts/SearchByText.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    query: S.String,
    organizationId: SharedEntityIds.OrganizationId,
    limit: S.optionalWith(S.Number, { default: () => 50 }),
  },
  $I.annotations("Payload", {
    description: "Payload for the SearchByText RelationEvidence contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(RelationEvidence.Model.json),
  },
  $I.annotations("Success", {
    description: "List of relation evidence matching the text search query (ILIKE).",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "SearchByText",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "SearchByText RelationEvidence Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("SearchByText", "/search").setPayload(Payload).addSuccess(Success);
}
