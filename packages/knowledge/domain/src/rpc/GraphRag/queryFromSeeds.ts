import { $KnowledgeDomainId } from "@beep/identity/packages";
import { GraphRAGError } from "@beep/knowledge-domain/errors";
import { GraphRagQueryResult } from "@beep/knowledge-domain/projections";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/GraphRag/QueryFromSeeds");

class SeedEntity extends S.Class<SeedEntity>($I`SeedEntity`)({
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

export const Error = GraphRAGError.annotations(
  $I.annotations("Error", {
    description: "graphrag_queryFromSeeds failed",
  })
);

export const Contract = Rpc.make("queryFromSeeds", {
  payload: Payload,
  success: Success,
  error: Error,
});
