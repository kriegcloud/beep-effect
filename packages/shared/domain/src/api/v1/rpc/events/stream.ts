import {$SharedDomainId} from "@beep/identity/packages";
import * as S from "effect/Schema";
import * as FilesEvents from "../files/events";
import * as Rpc from "@effect/rpc/Rpc";

const $I = $SharedDomainId.create("api/v1/rpc/events-stream");

class Ka extends S.TaggedClass<Ka>($I`Ka`)("Ka", {}, $I.annotations("Ka", {
  description: "Event stream RPC Ka."
})) {
}

class EventStreamEvents extends S.Union(
  Ka,
  FilesEvents.Events,
).annotations($I.annotations("EventStreamEvents", {
  description: "Event stream events."
})) {}

declare namespace EventStreamEvents {
  export type Type = typeof EventStreamEvents.Type;
  export type Encoded = typeof EventStreamEvents.Encoded;
}

export class Success extends S.Array(EventStreamEvents).annotations($I.annotations("Success", {
  description: "Success response for the event stream RPC."
})) {}

export declare namespace Success {
  export type Type = typeof Success.Type;
  export type Encoded = typeof Success.Encoded;
}

export class Contract extends Rpc.make("connect", {
  stream: true,
  success: Success
}) {}