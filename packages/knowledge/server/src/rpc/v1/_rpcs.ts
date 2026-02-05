import * as Layer from "effect/Layer";
import * as Batch from "./batch";
import * as Entity from "./entity";
import * as GraphRAG from "./graphrag";
import * as Relation from "./relation";

export const layer = Layer.mergeAll(Batch.layer, Entity.layer, Relation.layer, GraphRAG.layer);
