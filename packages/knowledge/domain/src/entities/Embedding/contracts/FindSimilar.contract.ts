import { $KnowledgeDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import { SimilarityResult } from "../Embedding.values";

const $I = $KnowledgeDomainId.create("entities/Embedding/contracts/FindSimilar.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    queryVector: S.Array(S.Number),
    organizationId: SharedEntityIds.OrganizationId,
    limit: S.optionalWith(S.Number.pipe(S.int(), S.between(1, 1000)), { default: () => 10 }),
    threshold: S.optionalWith(S.Number.pipe(S.between(0, 1)), { default: () => 0.7 }),
  },
  $I.annotations("Payload", {
    description: "Payload for the FindSimilar Embedding contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(SimilarityResult),
  },
  $I.annotations("Success", {
    description: "Success response for the FindSimilar Embedding contract.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "FindSimilar",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Find similar Embeddings by vector similarity Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("FindSimilar", "/similar")
    .setPayload(Payload)
    .addSuccess(Success);
}
