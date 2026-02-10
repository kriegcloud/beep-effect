/**
 * Comment cluster entity.
 *
 * This wires the Comment RPC group into an Effect Cluster `Entity` so it can be hosted
 * in a distributed runtime (and optionally persisted).
 *
 * @module documents-domain/entities/Comment/Comment.entity
 * @since 1.0.0
 * @category cluster
 */
import { $DocumentsDomainId } from "@beep/identity/packages";
import * as ClusterSchema from "@effect/cluster/ClusterSchema";
import * as ClusterEntity from "@effect/cluster/Entity";
import { Rpcs } from "./Comment.rpc";

const $I = $DocumentsDomainId.create("entities/Comment/Comment.entity");

/**
 * Cluster entity definition for Comment.
 *
 * @since 1.0.0
 * @category cluster
 */
export const Entity = ClusterEntity.fromRpcGroup($I`Entity`, Rpcs).annotateRpcs(ClusterSchema.Persisted, true);
