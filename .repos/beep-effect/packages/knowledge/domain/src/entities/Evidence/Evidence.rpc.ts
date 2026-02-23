import * as RpcGroup from "@effect/rpc/RpcGroup";
import { List } from "./contracts";

export class Rpcs extends RpcGroup.make(List.Contract.Rpc).prefix("evidence_") {}

export { List };
