import * as ClusterSchema from "@effect/cluster/ClusterSchema";
import * as ClusterEntity from "@effect/cluster/Entity";
import { Rpcs } from "./Folder.rpc";

export const Entity = ClusterEntity.fromRpcGroup("FolderEntity", Rpcs).annotateRpcs(ClusterSchema.Persisted, true);
