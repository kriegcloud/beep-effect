import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as Generate from "./generate";

export class Rpcs extends RpcGroup.make(Generate.Contract).prefix("meetingprep_") {}

export { RpcGroup, Generate };

