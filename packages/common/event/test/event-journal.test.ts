import { describe, effect, expect } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Option from "effect/Option";
import * as S from "effect/Schema";
import {
  Entry,
  EntryId,
  EventJournalError,
  entryIdMillis,
  makeEntryId,
  makeMemory,
  makeRemoteId,
  RemoteEntry,
  RemoteIdSchema,
} from "../src/event-journal.ts";

const mkEntry = (event: string, primaryKey: string, payload: Uint8Array) =>
  new Entry(
    {
      id: makeEntryId(),
      event,
      primaryKey,
      payload,
    },
    { disableValidation: true }
  );

describe("event-journal", () => {
  effect("creates and inspects ids", () =>
    Effect.gen(function* () {
      const id = makeEntryId({ msecs: 1700 });
      expect(yield* S.encode(EntryId)(id)).toBeInstanceOf(Uint8Array);
      expect(S.is(EntryId)(id)).toBe(true);
      const millis = entryIdMillis(id);
      expect(millis).toBeGreaterThanOrEqual(1700);

      const remoteId = makeRemoteId();
      expect(yield* S.encode(RemoteIdSchema)(remoteId)).toBeInstanceOf(Uint8Array);
    })
  );

  effect("encodes and decodes entry arrays with MsgPack", () =>
    Effect.gen(function* () {
      const entries = [mkEntry("a", "1", new Uint8Array([1])), mkEntry("b", "2", new Uint8Array([2]))] as const;

      const encoded = yield* Entry.encodeArray(entries);
      const decoded = yield* Entry.decodeArray(encoded);
      expect(
        F.pipe(
          decoded,
          A.map((entry) => entry.event)
        )
      ).toEqual(["a", "b"]);
    })
  );

  effect("operates in memory", () =>
    Effect.gen(function* () {
      const journal = yield* makeMemory;

      const writes = yield* Effect.all([
        journal.write({
          event: "created",
          primaryKey: "p1",
          payload: new Uint8Array([1]),
          effect: (entry) => Effect.sync(() => entry.idString),
        }),
        journal.write({
          event: "created",
          primaryKey: "p2",
          payload: new Uint8Array([2]),
          effect: Effect.succeed,
        }),
      ]);

      expect(writes.length).toBe(2);

      const entries = yield* journal.entries;
      expect(entries.length).toBe(2);

      const remoteId = makeRemoteId();
      const remoteEntry = new RemoteEntry({ remoteSequence: 1, entry: mkEntry("created", "p3", new Uint8Array([3])) });

      yield* journal.writeFromRemote({
        remoteId,
        entries: [remoteEntry],
        effect: ({ entry }) => Effect.sync(() => expect(entry.primaryKey).toBe("p3")),
      });

      const remoteSequence = yield* journal.nextRemoteSequence(remoteId);
      expect(remoteSequence).toBe(1);

      const uncommitted = yield* journal.withRemoteUncommited(remoteId, (pending) =>
        Effect.sync(() =>
          F.pipe(
            pending,
            A.map((entry) => entry)
          )
        )
      );
      expect(F.pipe(uncommitted, A.head, Option.isSome)).toBe(true);

      yield* journal.destroy;
      const empty = yield* journal.entries;
      expect(empty.length).toBe(0);
    })
  );

  effect("uses compacting writes from remote", () =>
    Effect.gen(function* () {
      const journal = yield* makeMemory;
      const remoteId = makeRemoteId();
      const first = mkEntry("update", "k1", new Uint8Array([1]));
      const second = mkEntry("update", "k1", new Uint8Array([2]));
      const third = mkEntry("update", "k2", new Uint8Array([3]));

      yield* journal.writeFromRemote({
        remoteId,
        entries: [
          new RemoteEntry({ remoteSequence: 1, entry: first }),
          new RemoteEntry({ remoteSequence: 2, entry: second }),
          new RemoteEntry({ remoteSequence: 3, entry: third }),
        ],
        compact: (entries) =>
          Effect.sync(() => [
            [
              [second, third],
              F.pipe(
                entries,
                A.tail,
                Option.getOrElse((): ReadonlyArray<RemoteEntry> => [])
              ),
            ] as const,
          ]),
        effect: ({ conflicts, entry }) =>
          Effect.sync(() => {
            expect(conflicts.length >= 0).toBe(true);
            expect(entry).toBeDefined();
          }),
      });

      const entries = yield* journal.entries;
      expect(
        F.pipe(
          entries,
          A.map((entry) => entry.primaryKey)
        )
      ).toEqual(["k1", "k2"]);
    })
  );

  effect("captures errors as EventJournalError", () =>
    Effect.gen(function* () {
      const journal = yield* makeMemory;
      const failingEntry = new RemoteEntry({
        remoteSequence: 1,
        entry: mkEntry("err", "e1", new Uint8Array([9])),
      });
      const failure = journal.writeFromRemote({
        remoteId: makeRemoteId(),
        entries: [failingEntry],
        effect: () => Effect.fail(new EventJournalError({ method: "test", cause: new Error("nope") })),
      });

      const exit = yield* Effect.exit(failure);
      expect(exit._tag).toBe("Failure");
    })
  );
});
