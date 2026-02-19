import { $KnowledgeDomainId } from "@beep/identity/packages";
import { GraphRAGError } from "@beep/knowledge-domain/errors";
import { GraphRagQueryResult } from "@beep/knowledge-domain/projections";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/GraphRag/contracts/QueryFromSeeds.contract");

export class SeedEntity extends S.Class<SeedEntity>($I`SeedEntity`)({
  entityId: KnowledgeEntityIds.KnowledgeEntityId,
  weight: S.optional(S.Positive),
}).annotations(
  $I.annotations("SeedEntity", {
    description: "Seed entity for graph traversal with optional weight",
  })
) {}

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    seeds: S.NonEmptyArray(SeedEntity),
    organizationId: SharedEntityIds.OrganizationId,
    predicateFilter: S.optional(S.Array(S.String)),
    maxDepth: S.optional(BS.PosInt),
    maxTokens: S.optional(BS.PosInt),
  },
  $I.annotations("Payload", {
    description: "graphrag_queryFromSeeds payload",
  })
) {}

export class Success extends GraphRagQueryResult.extend<Success>($I`Success`)(
  {},
  $I.annotations("Success", {
    description: "graphrag_queryFromSeeds succeeded",
  })
) {}

export const Failure = GraphRAGError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "queryFromSeeds",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "GraphRAG query from seeds Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("QueryFromSeeds", "/queryFromSeeds")
    .setPayload(Payload)
    .addError(GraphRAGError)
    .addSuccess(Success);
}
