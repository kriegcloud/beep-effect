import { Storage, Sync } from "@beep/ai-sdk";
import { ArtifactRecord } from "@beep/ai-sdk/Schema/Storage";
import { makeUnsafeUtc } from "@beep/utils/DateTime";
import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ServiceMap from "effect/ServiceMap";
import { runEffectLive } from "./effect-test.js";

const sharedIdentityKey = "sync-test-artifact-identity";
const bunGlobal = Reflect.get(globalThis, "Bun");
const hasBunServe = typeof bunGlobal === "object" && bunGlobal !== null && "serve" in bunGlobal;

test("ArtifactStore.layerJournaledWithSyncWebSocket builds replicas", { skip: !hasBunServe }, async () => {
  const program = Effect.scoped(
    Effect.gen(function* () {
      const server = yield* Sync.EventLogRemoteServer;
      const replicaAContext = yield* Layer.build(
        Storage.ArtifactStore.layerJournaledWithSyncWebSocket(server.url, {
          prefix: "replica-a",
          identityKey: sharedIdentityKey,
        })
      );
      const replicaBContext = yield* Layer.build(
        Storage.ArtifactStore.layerJournaledWithSyncWebSocket(server.url, {
          prefix: "replica-b",
          identityKey: sharedIdentityKey,
        })
      );

      const storeA = ServiceMap.get(replicaAContext, Storage.ArtifactStore);
      const storeB = ServiceMap.get(replicaBContext, Storage.ArtifactStore);

      const record = ArtifactRecord.make({
        id: "artifact-1",
        sessionId: "session-1",
        kind: "file",
        encoding: "utf8",
        content: "console.log('hello');",
        createdAt: makeUnsafeUtc(Date.now()),
      });
      yield* storeA.put(record);

      const localRecords = yield* storeA.list("session-1");
      const remoteRecords = yield* storeB.list("session-1");

      return { localRecords, remoteRecords };
    }).pipe(Effect.provide(Sync.layerBunWebSocketTest()))
  );

  const result = await runEffectLive(program);
  expect(result.localRecords).toHaveLength(1);
  expect(result.remoteRecords).toHaveLength(0);
});
