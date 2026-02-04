/**
 * V1 RPC aggregate layer
 *
 * Combines all Knowledge RPC handlers into a single layer.
 *
 * @module knowledge-server/rpc/v1/_rpcs
 * @since 0.1.0
 */
import * as Layer from "effect/Layer";
import * as Entity from "./entity";
import * as GraphRAG from "./graphrag";
import * as Relation from "./relation";

export const layer = Layer.mergeAll(Entity.layer, Relation.layer, GraphRAG.layer);
