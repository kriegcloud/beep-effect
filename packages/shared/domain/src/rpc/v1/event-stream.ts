import { $SharedDomainId } from "@beep/identity/packages";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";
import * as Events from "./_events.ts";

const $I = $SharedDomainId.create("rpc/v1/event-stream");

export class Ka extends S.TaggedClass<Ka>($I`Ka`)(
  "Ka",
  {},
  $I.annotations("SharedEventStreamKa", {
    description: "Shared event stream for keep alive connection",
  })
) {}

export class EventStreamEvents extends S.Union(Events.Event, Ka).annotations(
  $I.annotations("SharedEventStreamEvents", {
    description: "Shared event stream events",
  })
) {}

export declare namespace EventStreamEvents {
  export type Type = typeof EventStreamEvents.Type;
  export type Encoded = typeof EventStreamEvents.Encoded;
}

export class Success extends S.Array(EventStreamEvents).annotations(
  $I.annotations("SharedEventStreamSuccess", {
    description: "Shared event stream success",
  })
) {}

export declare namespace Success {
  export type Type = typeof Success.Type;
  export type Encoded = typeof Success.Encoded;
}

export const Rpcs = RpcGroup.make(
  Rpc.make("connect", {
    stream: true,
    success: Success,
  })
).prefix("eventStream_");
