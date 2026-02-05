import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as Query from "./query";
import * as QueryFromSeeds from "./queryFromSeeds";

export class Rpcs extends RpcGroup.make(Query.Contract, QueryFromSeeds.Contract).prefix("graphrag_") {}

export { RpcGroup, Query, QueryFromSeeds };
