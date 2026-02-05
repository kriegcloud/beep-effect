import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as Cancel from "./Cancel";
import * as Extract from "./Extract.ts";
import * as GetStatus from "./GetStatus.ts";
import * as List from "./List.ts";

export class Rpcs extends RpcGroup.make(Cancel.Contract, Extract.Contract, GetStatus.Contract, List.Contract).prefix(
  "extraction_"
) {}

export { RpcGroup, Cancel, Extract, GetStatus, List };
