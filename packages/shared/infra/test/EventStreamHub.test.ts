import { SharedEntityIds } from "@beep/shared-domain";
import { type EventStreamEvents, Ka } from "@beep/shared-domain/EventStreamRpc";
import { EventStreamHub } from "@beep/shared-infra/EventStreamHub";
import { describe, expect, scoped } from "@beep/testkit";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Mailbox from "effect/Mailbox";
import * as O from "effect/Option";
import * as TestClock from "effect/TestClock";

const testUserId = (id: number) => SharedEntityIds.UserId.make(`user__00000000-0000-0000-0000-00000000000${id}`);

const SampleEvent = new Ka();

describe("EventStreamHub", () => {
  scoped("should add a connection and allow sending a message to a specific user, then verify shutdown on remove", () =>
    Effect.gen(function* () {
      const hub = yield* EventStreamHub;
      const mailbox = yield* Mailbox.make<EventStreamEvents.Type>();
      const userId = testUserId(1);
      const connectionId = "conn-1";

      yield* hub.registerConnection(userId, { connectionId, mailbox });
      yield* hub.notifyUser(userId, SampleEvent);

      const received = yield* mailbox.take;
      expect(received).toEqual(SampleEvent);

      const offerActiveResult = yield* mailbox.offer(SampleEvent);
      expect(offerActiveResult).toBe(true);
      yield* mailbox.take;

      yield* hub.unregisterConnection(userId, connectionId);

      const offerInactiveResult = yield* mailbox.offer(SampleEvent);
      expect(offerInactiveResult).toBe(false);

      const finalSize = yield* mailbox.size;
      expect(O.isNone(finalSize)).toBe(true);
    }).pipe(Effect.provide(EventStreamHub.Default))
  );

  scoped("should remove a connection and verify its mailbox shutdown", () =>
    Effect.gen(function* () {
      const hub = yield* EventStreamHub;
      const mailbox = yield* Mailbox.make<EventStreamEvents.Type>();
      const userId = testUserId(2);
      const connectionId = "conn-2";

      yield* hub.registerConnection(userId, { connectionId, mailbox });

      const sizeBefore = yield* mailbox.size;
      expect(O.isSome(sizeBefore)).toBe(true);
      const offerResultBefore = yield* mailbox.offer(SampleEvent);
      expect(offerResultBefore).toBe(true);
      yield* mailbox.take;

      yield* hub.unregisterConnection(userId, connectionId);

      const sizeAfter = yield* mailbox.size;
      expect(O.isNone(sizeAfter)).toBe(true);
      const offerResultAfter = yield* mailbox.offer(SampleEvent);
      expect(offerResultAfter).toBe(false);

      const result = yield* Effect.option(mailbox.take);
      expect(O.isNone(result)).toBe(true);
    }).pipe(Effect.provide(EventStreamHub.Default))
  );

  scoped("should send a message to all connections for a specific user", () =>
    Effect.gen(function* () {
      const hub = yield* EventStreamHub;
      const userId = testUserId(3);
      const otherUserId = testUserId(4);
      const connectionId1 = "conn-3-1";
      const connectionId2 = "conn-3-2";
      const connectionIdOther = "conn-3-other";
      const mailbox1 = yield* Mailbox.make<EventStreamEvents.Type>();
      const mailbox2 = yield* Mailbox.make<EventStreamEvents.Type>();
      const mailboxOther = yield* Mailbox.make<EventStreamEvents.Type>();

      yield* hub.registerConnection(userId, {
        connectionId: connectionId1,
        mailbox: mailbox1,
      });
      yield* hub.registerConnection(userId, {
        connectionId: connectionId2,
        mailbox: mailbox2,
      });
      yield* hub.registerConnection(otherUserId, {
        connectionId: connectionIdOther,
        mailbox: mailboxOther,
      });

      yield* hub.notifyUser(userId, SampleEvent);

      const received1 = yield* mailbox1.take;
      const received2 = yield* mailbox2.take;
      expect(received1).toEqual(SampleEvent);
      expect(received2).toEqual(SampleEvent);

      const otherSize = yield* mailboxOther.size;
      expect(otherSize).toEqual(O.some(0));

      yield* hub.unregisterConnection(userId, connectionId1);
      yield* hub.unregisterConnection(userId, connectionId2);
      yield* hub.unregisterConnection(otherUserId, connectionIdOther);
    }).pipe(Effect.provide(EventStreamHub.Default))
  );

  scoped("should not fail when sending to a user with no connections", () =>
    Effect.gen(function* () {
      const hub = yield* EventStreamHub;
      const userId = testUserId(5);

      yield* hub.notifyUser(userId, SampleEvent);

      expect(true).toBe(true);
    }).pipe(Effect.provide(EventStreamHub.Default))
  );

  scoped("should not evict active connections (sending via notifyUser resets TTL)", () =>
    Effect.gen(function* () {
      const hub = yield* EventStreamHub;
      const mailbox = yield* Mailbox.make<EventStreamEvents.Type>();
      const userId = testUserId(6);
      const connectionId = "conn-6";

      yield* hub.registerConnection(userId, { connectionId, mailbox });

      yield* TestClock.adjust(Duration.minutes(119));

      yield* hub.notifyUser(userId, SampleEvent);
      const received = yield* mailbox.take;
      expect(received).toEqual(SampleEvent);

      yield* TestClock.adjust(Duration.decode("1 hour"));
      yield* TestClock.adjust(Duration.decode("1 hour"));
      yield* Effect.yieldNow();

      const sizeMid = yield* mailbox.size;
      expect(O.isSome(sizeMid)).toBe(true);
      const offerMid = yield* mailbox.offer(SampleEvent);
      expect(offerMid).toBe(true);
      yield* mailbox.take;

      yield* hub.unregisterConnection(userId, connectionId);

      const sizeAfter = yield* mailbox.size;
      expect(O.isNone(sizeAfter)).toBe(true);
      const offerAfter = yield* mailbox.offer(SampleEvent);
      expect(offerAfter).toBe(false);
    }).pipe(Effect.provide(EventStreamHub.Default))
  );

  scoped("should handle removing a non-existent connection gracefully", () =>
    Effect.gen(function* () {
      const hub = yield* EventStreamHub;
      const userId = testUserId(7);
      const connectionId = "conn-non-existent";

      yield* hub.unregisterConnection(userId, connectionId);
      expect(true).toBe(true);

      yield* hub.unregisterConnection(testUserId(9), connectionId);
      expect(true).toBe(true);
    }).pipe(Effect.provide(EventStreamHub.Default))
  );

  scoped("removeConnection should clean up user entry if last connection is removed", () =>
    Effect.gen(function* () {
      const hub = yield* EventStreamHub;
      const userId = testUserId(8);
      const connId1 = "conn-8-1";
      const connId2 = "conn-8-2";
      const mailbox1 = yield* Mailbox.make<EventStreamEvents.Type>();
      const mailbox2 = yield* Mailbox.make<EventStreamEvents.Type>();

      yield* hub.registerConnection(userId, {
        connectionId: connId1,
        mailbox: mailbox1,
      });
      yield* hub.registerConnection(userId, {
        connectionId: connId2,
        mailbox: mailbox2,
      });

      yield* hub.notifyUser(userId, SampleEvent);
      yield* mailbox1.take;
      yield* mailbox2.take;

      yield* hub.unregisterConnection(userId, connId1);
      yield* hub.notifyUser(userId, SampleEvent);
      yield* mailbox2.take;

      yield* hub.unregisterConnection(userId, connId2);

      yield* hub.notifyUser(userId, SampleEvent);

      const sizeAfter = yield* mailbox2.size;
      expect(O.isNone(sizeAfter)).toBe(true);
      const offerAfter = yield* mailbox2.offer(SampleEvent);
      expect(offerAfter).toBe(false);

      expect(true).toBe(true);
    }).pipe(Effect.provide(EventStreamHub.Default))
  );
});
