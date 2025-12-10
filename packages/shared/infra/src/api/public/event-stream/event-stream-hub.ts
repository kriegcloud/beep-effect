import { Policy } from "@beep/shared-domain";
import { SharedEntityIds } from "@beep/shared-domain";
import type { EventStreamEvents } from "@beep/shared-domain/api/event-stream-rpc";
import * as Arr from "effect/Array";
import * as Clock from "effect/Clock";
import * as Effect from "effect/Effect";
import type * as Mailbox from "effect/Mailbox";
import * as MutableHashMap from "effect/MutableHashMap";
import * as Option from "effect/Option";
import * as SynchronizedRef from "effect/SynchronizedRef";

type ActiveConnection = {
  readonly userId: SharedEntityIds.UserId.Type;
  readonly connectionId: string;
  readonly mailbox: Mailbox.Mailbox<EventStreamEvents>;
  lastActivityTimestamp: number;
};

export class EventStreamHub extends Effect.Service<EventStreamHub>()("EventStreamHub", {
  scoped: Effect.gen(function* () {
    const connections = yield* SynchronizedRef.make(
      MutableHashMap.empty<SharedEntityIds.UserId.Type, Array<ActiveConnection>>(),
    );

    const registerConnection = (
      userId: SharedEntityIds.UserId.Type,
      opts: { connectionId: string; mailbox: Mailbox.Mailbox<EventStreamEvents> },
    ): Effect.Effect<void> =>
      SynchronizedRef.updateEffect(connections, (map) =>
        Clock.currentTimeMillis.pipe(
          Effect.map((now) => {
            const activeConnection: ActiveConnection = {
              userId,
              connectionId: opts.connectionId,
              mailbox: opts.mailbox,
              lastActivityTimestamp: now,
            };

            const userConnections = MutableHashMap.get(map, userId).pipe(
              Option.getOrElse(() => Arr.empty<ActiveConnection>()),
            );

            return MutableHashMap.set(map, userId, Arr.append(userConnections, activeConnection));
          }),
          Effect.tap(() => Effect.logDebug("Registered connection")),
        ),
      );

    const unregisterConnection = (userId: SharedEntityIds.UserId.Type, connectionId: string): Effect.Effect<void> =>
      SynchronizedRef.updateEffect(connections, (map) => {
        const userConnectionsOpt = MutableHashMap.get(map, userId);
        if (Option.isNone(userConnectionsOpt)) {
          return Effect.succeed(map);
        }

        const userConnections = userConnectionsOpt.value;

        const connectionToRemoveOpt = Arr.findFirst(
          userConnections,
          (conn) => conn.connectionId === connectionId,
        );

        const updatedConnections = Arr.filter(
          userConnections,
          (conn) => conn.connectionId !== connectionId,
        );

        if (Arr.isEmptyArray(updatedConnections)) {
          MutableHashMap.remove(map, userId);
        } else {
          MutableHashMap.set(map, userId, updatedConnections);
        }

        return Option.match(connectionToRemoveOpt, {
          onNone: () => Effect.void,
          onSome: (conn) => Effect.asVoid(conn.mailbox.shutdown),
        }).pipe(
          Effect.as(map),
          Effect.tap(() => Effect.logDebug("Unregistered connection")),
        );
      });

    const notifyUser = (userId: SharedEntityIds.UserId.Type, event: EventStreamEvents): Effect.Effect<void> =>
      SynchronizedRef.updateEffect(connections, (map) =>
        Clock.currentTimeMillis.pipe(
          Effect.flatMap((now) => {
            const userConnections = MutableHashMap.get(map, userId).pipe(
              Option.getOrElse(() => Arr.empty<ActiveConnection>()),
            );

            if (Arr.isEmptyArray(userConnections)) {
              return Effect.succeed(map);
            }

            return Effect.forEach(
              userConnections,
              (conn) =>
                conn.mailbox.offer(event).pipe(
                  Effect.tap((success) => {
                    if (success) {
                      conn.lastActivityTimestamp = now;
                    } else {
                      return Effect.logWarning(
                        `Mailbox ${conn.connectionId} for user ${conn.userId} is already done, skipping send.`,
                      );
                    }
                    return
                  }),

                ),
              { discard: true },
            ).pipe(Effect.as(map));
          }),
        ),
      );

    const notifyCurrentUser = (
      event: EventStreamEvents,
    ): Effect.Effect<void, never, Policy.AuthContext> =>
      Policy.AuthContext.pipe(Effect.flatMap((authCtx) => notifyUser(authCtx.user.id, event)));

    return {
      registerConnection,
      unregisterConnection,
      notifyUser,
      notifyCurrentUser,
    };
  }),
}) {}
