import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as List from "./list";

export class Rpcs extends RpcGroup.make(List.Contract).prefix("evidence_") {}

export { RpcGroup, List };

