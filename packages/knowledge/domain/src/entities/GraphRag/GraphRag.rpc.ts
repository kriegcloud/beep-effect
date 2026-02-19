import * as RpcGroup from "@effect/rpc/RpcGroup";
import { Query, QueryFromSeeds } from "./contracts";

export class Rpcs extends RpcGroup.make(Query.Contract.Rpc, QueryFromSeeds.Contract.Rpc).prefix("graphrag_") {}

export { Query, QueryFromSeeds };
