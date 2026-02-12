import * as RpcGroup from "@effect/rpc/RpcGroup";
import { Cancel, Extract, GetStatus, List } from "./contracts";

export class Rpcs extends RpcGroup.make(
  Cancel.Contract.Rpc,
  Extract.Contract.Rpc,
  GetStatus.Contract.Rpc,
  List.Contract.Rpc
).prefix("extraction_") {}

export { Cancel, Extract, GetStatus, List };
