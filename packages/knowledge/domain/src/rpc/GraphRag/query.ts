import { $KnowledgeDomainId } from "@beep/identity/packages";
import { GraphRAGError } from "@beep/knowledge-domain/errors";
import { GraphRagQueryResult } from "@beep/knowledge-domain/projections";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/GraphRag/Query");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    query: S.String,
    organizationId: SharedEntityIds.OrganizationId,
    ontologyId: S.optional(KnowledgeEntityIds.OntologyId),
    maxEntities: S.optional(BS.PosInt),
    maxDepth: S.optional(BS.PosInt),
    maxTokens: S.optional(BS.PosInt),
  },
  $I.annotations("Payload", {
    description: "graphrag_query payload",
  })
) {}

export class Success extends GraphRagQueryResult.extend<Success>($I`Success`)(
  {},
  $I.annotations("Success", {
    description: "graphrag_query succeeded",
  })
) {}

export const Error = GraphRAGError.annotations(
  $I.annotations("Error", {
    description: "graphrag_query failed",
  })
);

export const Contract = Rpc.make("query", {
  payload: Payload,
  success: Success,
  error: Error,
});
