import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";
import { AuthContextRpcMiddleware } from "../Policy.ts";
import { FilesEvent } from "./files-rpc.ts";

export class Ka extends S.TaggedClass<Ka>("Ka")("Ka", {}) {}

export const EventStreamEvents = S.Union(Ka, FilesEvent);
export type EventStreamEvents = typeof EventStreamEvents.Type;

export class EventStreamRpc extends RpcGroup.make(
  Rpc.make("connect", {
    stream: true,
    success: S.Array(EventStreamEvents),
  })
)
  .prefix("eventStream_")
  .middleware(AuthContextRpcMiddleware) {}
