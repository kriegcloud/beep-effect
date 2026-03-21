import {
  ClientId,
  type ClientInfo,
  type ClientStatus,
  type WebSocketEvent,
} from "@repo/domain/WebSocket";
import { Effect, Layer, PubSub, Ref } from "effect";
import type { Subscription } from "effect/PubSub";
import * as ServiceMap from "effect/ServiceMap";

export type PresenceEventType = typeof WebSocketEvent.Type;

export const PresenceService = ServiceMap.Service<{
  pubsub: PubSub.PubSub<PresenceEventType>;
  generateClientId: () => typeof ClientId.Type;
  addClient: (
    clientId: typeof ClientId.Type,
    info: ClientInfo,
  ) => Effect.Effect<void>;
  removeClient: (clientId: typeof ClientId.Type) => Effect.Effect<void>;
  setStatus: (
    clientId: typeof ClientId.Type,
    status: ClientStatus,
  ) => Effect.Effect<void>;
  getClients: () => Effect.Effect<ReadonlyArray<ClientInfo>>;
  subscribe: () => Effect.Effect<Subscription<PresenceEventType>, never, never>;
}>("PresenceService");

export const PresenceServiceLive = Layer.effect(
  PresenceService,
  Effect.gen(function* () {
    yield* Effect.log("Initializing PresenceService");

    const clientsRef = yield* Ref.make(
      new Map<typeof ClientId.Type, ClientInfo>(),
    );
    const pubsub = yield* PubSub.sliding<PresenceEventType>(1000);

    const generateClientId = () => ClientId.makeUnsafe(crypto.randomUUID());

    const addClient = Effect.fn("PresenceService.addClient")(function* (
      clientId: typeof ClientId.Type,
      info: ClientInfo,
    ) {
      yield* Ref.update(clientsRef, (clients) => {
        const newClients = new Map(clients);
        newClients.set(clientId, info);
        return newClients;
      });

      yield* PubSub.publish(pubsub, {
        _tag: "user_joined",
        client: info,
      });

      yield* Effect.log(`Client added: ${clientId}`);
    });

    const removeClient = Effect.fn("PresenceService.removeClient")(function* (
      clientId: typeof ClientId.Type,
    ) {
      const clients = yield* Ref.get(clientsRef);
      const client = clients.get(clientId);

      if (client) {
        yield* Ref.update(clientsRef, (clients) => {
          const newClients = new Map(clients);
          newClients.delete(clientId);
          return newClients;
        });

        yield* PubSub.publish(pubsub, {
          _tag: "user_left",
          clientId,
          disconnectedAt: Date.now(),
        });

        yield* Effect.log(`Client removed: ${clientId}`);
      }
    });

    const setStatus = Effect.fn("PresenceService.setStatus")(function* (
      clientId: typeof ClientId.Type,
      status: ClientStatus,
    ) {
      const clients = yield* Ref.get(clientsRef);
      const client = clients.get(clientId);

      if (client) {
        const updatedClient: ClientInfo = {
          ...client,
          status,
        };

        yield* Ref.update(clientsRef, (clients) => {
          const newClients = new Map(clients);
          newClients.set(clientId, updatedClient);
          return newClients;
        });

        // Broadcast status_changed to all clients
        yield* PubSub.publish(pubsub, {
          _tag: "status_changed",
          clientId,
          status,
          changedAt: Date.now(),
        });

        yield* Effect.log(`Client ${clientId} status changed to ${status}`);
      }
    });

    const getClients = Effect.fn("PresenceService.getClients")(function* () {
      const clients = yield* Ref.get(clientsRef);
      return Array.from(clients.values());
    });

    const subscribe = Effect.fn("PresenceService.subscribe")(
      () =>
        PubSub.subscribe(pubsub) as unknown as Effect.Effect<
          Subscription<PresenceEventType>
        >,
    );

    return PresenceService.of({
      pubsub,
      generateClientId,
      addClient,
      removeClient,
      setStatus,
      getClients,
      subscribe,
    });
  }),
);
