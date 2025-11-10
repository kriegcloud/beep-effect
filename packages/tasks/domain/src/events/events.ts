import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";
import { Todo } from "@beep/tasks-domain/entities";


export const EventStreamEvent = S.Union(
  Todo.ModelTagged,
  S.TaggedStruct("Ka", {})
);
export type EventStreamEvent = typeof EventStreamEvent.Type;

export class EventStreamRpc extends RpcGroup.make(
  Rpc.make("connect", {
    stream: true,
    success: S.Array(EventStreamEvent)
  })
).prefix("eventStream_") {}

