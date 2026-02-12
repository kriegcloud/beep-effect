import * as ClusterSchema from "@effect/cluster/ClusterSchema";
import * as ClusterEntity from "@effect/cluster/Entity";
import { Rpcs } from "./File.rpc";

export const Entity = ClusterEntity.fromRpcGroup("FileEntity", Rpcs).annotateRpcs(ClusterSchema.Persisted, true);
