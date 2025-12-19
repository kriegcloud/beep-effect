import * as InitiateUpload from "./initiate-upload.ts";
import * as RpcGroup from "@effect/rpc/RpcGroup";

export class Group extends RpcGroup.make(
  InitiateUpload.Contract
).prefix("Files.") {}

export { InitiateUpload }
