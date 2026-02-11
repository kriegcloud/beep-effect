/**
 * Page cluster entity.
 *
 * This wires the Page RPC group into an Effect Cluster `Entity` so it can be hosted
 * in a distributed runtime (and optionally persisted).
 *
 * @module documents-domain/entities/Page/Page.entity
 * @since 1.0.0
 * @category cluster
 */
import * as ClusterSchema from "@effect/cluster/ClusterSchema";
import * as ClusterEntity from "@effect/cluster/Entity";
import { Rpcs } from "./Page.rpc";

/**
 * Cluster entity definition for Page.
 *
 * @since 1.0.0
 * @category cluster
 */
export const Entity = ClusterEntity.fromRpcGroup("Entity", Rpcs).annotateRpcs(ClusterSchema.Persisted, true);
