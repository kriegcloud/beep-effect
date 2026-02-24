import { $KnowledgeDomainId } from "@beep/identity/packages";
import { GraphRAGError } from "@beep/knowledge-domain/errors";
import { GraphRagQueryResult } from "@beep/knowledge-domain/projections";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/GraphRag/contracts/Query.contract");

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

export const Failure = GraphRAGError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "query",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "GraphRAG query Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("Query", "/query")
    .setPayload(Payload)
    .addError(GraphRAGError)
    .addSuccess(Success);
}
