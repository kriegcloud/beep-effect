import { $SharedClientId } from "@beep/identity/packages";
import type { EventStreamEvents } from "@beep/shared-domain/rpc/v1/event-stream";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as PubSub from "effect/PubSub";
import * as Stream from "effect/Stream";
import * as FilesRpcClient from "./FilesRpcClient.service";

const $I = $SharedClientId.create("atom/rpc/v1/event-stream");

export class Service extends Effect.Service<Service>()($I`Service`, {
  effect: Effect.gen(function* () {
    const pubSub = yield* PubSub.unbounded<EventStreamEvents.Type>();
    return {
      changes: Stream.fromPubSub(pubSub),
      publish: (event: EventStreamEvents.Type) => PubSub.publish(pubSub, event),
    };
  }),
}) {}

export const layer = Layer.mergeAll(Service.Default, FilesRpcClient.layer);
