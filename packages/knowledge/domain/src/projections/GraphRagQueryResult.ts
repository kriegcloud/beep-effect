import { $KnowledgeDomainId } from "@beep/identity/packages";
import { Entity, Relation } from "@beep/knowledge-domain/entities";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("projections/graphrag-query-result");

export class GraphRagQueryResult extends S.Class<GraphRagQueryResult>($I`GraphragQueryResult`)(
  {
    entities: S.Array(Entity.Model.json),
    relations: S.Array(Relation.Model.json),
    context: S.String,
    tokenCount: S.optional(S.NonNegativeInt),
  },
  $I.annotations("GraphragQueryResult", {
    description: "GraphRAG query result with entities, relations, and assembled context",
  })
) {}
