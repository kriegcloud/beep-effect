import * as RpcGroup from "@effect/rpc/RpcGroup";
import { Generate } from "./contracts";

export class Rpcs extends RpcGroup.make(Generate.Contract.Rpc).prefix("meetingprep_") {}

export { Generate };
