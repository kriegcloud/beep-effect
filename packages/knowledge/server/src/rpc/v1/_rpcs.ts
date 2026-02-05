import * as Layer from "effect/Layer";
import * as Entity from "./entity";
import * as GraphRAG from "./graphrag";
import * as Relation from "./relation";

export const layer = Layer.mergeAll(Entity.layer, Relation.layer, GraphRAG.layer);
