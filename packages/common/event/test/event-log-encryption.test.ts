import { type EncryptedRemoteEntry, makeEncryptionSubtle } from "@beep/event/event-log-encryption";
import { describe, effect, expect } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Str from "effect/String";
import { Entry, makeEntryId } from "../src/event-journal.ts";
import { Identity } from "../src/event-log.ts";

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

describe("event-log-encryption", () => {
  effect("encrypts and decrypts entries", () =>
    Effect.gen(function* () {
      const encryption = yield* makeEncryptionSubtle(globalThis.crypto);
      const identity = Identity.makeRandom();

      const entries = [
        mkEntry("evt", "k1", new Uint8Array([1, 2, 3])),
        mkEntry("evt", "k2", new Uint8Array([4, 5, 6])),
      ] as const;

      const encrypted = yield* encryption.encrypt(identity, entries);
      const encryptedRemote: ReadonlyArray<EncryptedRemoteEntry> = F.pipe(
        encrypted.encryptedEntries,
        A.map((encryptedEntry, index) => ({
          sequence: index,
          iv: encrypted.iv,
          entryId: entries[index]!.id,
          encryptedEntry,
        }))
      );

      const decrypted = yield* encryption.decrypt(identity, encryptedRemote);
      const roundTrip = F.pipe(
        decrypted,
        A.map((remote) => remote.entry.primaryKey)
      );
      expect(roundTrip).toEqual(["k1", "k2"]);

      const remotePairs = F.pipe(
        decrypted,
        A.map((remote) => remote.remoteSequence)
      );
      expect(remotePairs).toEqual([0, 1]);
    })
  );

  effect("hashes data consistently", () =>
    Effect.gen(function* () {
      const encryption = yield* makeEncryptionSubtle(globalThis.crypto);
      const data = new Uint8Array([9, 9, 9]);

      const hashBytes = yield* encryption.sha256(data);
      const hashString = yield* encryption.sha256String(data);

      const manualHex = F.pipe(
        A.fromIterable(new Uint8Array(yield* Effect.promise(() => crypto.subtle.digest("SHA-256", data)))),
        A.map((byte) => F.pipe(byte.toString(16), Str.padStart(2, "0"))),
        A.join("")
      );

      expect(hashBytes instanceof Uint8Array).toBe(true);
      expect(hashString).toBe(manualHex);
    })
  );
});
