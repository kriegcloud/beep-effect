import * as HttpApi from "@effect/platform/HttpApi";
import * as RpcReference from "./rpc-reference";

export class Api extends HttpApi.make("shared").add(RpcReference.Group).prefix("/v1") {}

export { RpcReference };
