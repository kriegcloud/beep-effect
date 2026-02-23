import * as ClusterSchema from "@effect/cluster/ClusterSchema";
import * as ClusterEntity from "@effect/cluster/Entity";
import { Rpcs } from "./Session.rpc";

export const Entity = ClusterEntity.fromRpcGroup("Entity", Rpcs).annotateRpcs(ClusterSchema.Persisted, true);
