import * as ClusterSchema from "@effect/cluster/ClusterSchema";
import * as ClusterEntity from "@effect/cluster/Entity";
import { Rpcs } from "./UploadSession.rpc";

export const Entity = ClusterEntity.fromRpcGroup("UploadSessionEntity", Rpcs).annotateRpcs(
  ClusterSchema.Persisted,
  true
);
