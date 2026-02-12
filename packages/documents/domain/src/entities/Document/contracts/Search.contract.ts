import { $DocumentsDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import { SearchResult } from "../schemas/SearchResult.schema";

const $I = $DocumentsDomainId.create("entities/Document/contracts/Search.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    query: S.String,
    organizationId: SharedEntityIds.OrganizationId,
    userId: S.optional(SharedEntityIds.UserId),
    includeArchived: S.optional(S.Boolean),
    limit: S.optional(S.Int.pipe(S.positive())),
    offset: S.optional(S.Int.pipe(S.nonNegative())),
  },
  $I.annotations("Payload", {
    description: "Payload for the Search Document Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(SearchResult),
  },
  $I.annotations("Success", {
    description: "Success response for the Search Document Contract.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Search",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Search Document Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Search", "/search")
    .setPayload(Payload)
    .addSuccess(Success);
}
