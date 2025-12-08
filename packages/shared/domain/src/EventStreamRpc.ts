import { $SharedDomainId } from "@beep/identity/packages";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";
import { FileEvent } from "./entities/File/File.rpc.ts";
import { AuthContextRpcMiddleware } from "./Policy.ts";

const $I = $SharedDomainId.create("event-stream");

export class Ka extends S.TaggedClass<Ka>($I`Ka`)(
  "Ka",
  {},
  $I.annotations("Ka", {
    description: "Keep-alive event",
  })
) {}

export class EventStreamEvents extends S.Union(Ka, FileEvent).annotations(
  $I.annotations("EventStreamEvents", {
    description: "Event stream events",
  })
) {}

export declare namespace EventStreamEvents {
  export type Type = S.Schema.Type<typeof EventStreamEvents>;
  export type Encoded = S.Schema.Encoded<typeof EventStreamEvents>;
}

export class EventStreamRpc extends RpcGroup.make(
  Rpc.make("connect", {
    stream: true,
    success: S.Array(EventStreamEvents),
  })
)
  .prefix("eventStream_")
  .middleware(AuthContextRpcMiddleware) {}
