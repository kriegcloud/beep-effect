import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Model as EntityModel } from "../entities/Entity/Entity.model";
import { Model as RelationModel } from "../entities/Relation/Relation.model";

const $I = $KnowledgeDomainId.create("projections/graphrag-query-result");

export class GraphRagQueryResult extends S.Class<GraphRagQueryResult>($I`GraphragQueryResult`)(
  {
    entities: S.Array(EntityModel.json),
    relations: S.Array(RelationModel.json),
    context: S.String,
    tokenCount: S.optional(S.NonNegativeInt),
  },
  $I.annotations("GraphragQueryResult", {
    description: "GraphRAG query result with entities, relations, and assembled context",
  })
) {}
