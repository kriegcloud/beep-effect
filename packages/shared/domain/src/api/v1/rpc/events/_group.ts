import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as Stream from "./stream.ts";

export class Group extends RpcGroup.make(
  Stream.Contract
).prefix("Events.Stream") {}

export { Stream };