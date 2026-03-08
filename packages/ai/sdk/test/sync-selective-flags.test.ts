import { mkdtemp, rm } from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { Storage, Sync } from "@beep/ai-sdk";
import { makeUserMessage } from "@beep/ai-sdk/Schema/Message";
import { ArtifactRecord } from "@beep/ai-sdk/Schema/Storage";
import { makeUnsafeUtc } from "@beep/utils/DateTime";
import { expect, test } from "@effect/vitest";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ServiceMap from "effect/ServiceMap";
import { runEffectLive } from "./effect-test.js";

const allowServe = Bun.env.SYNC_TEST_ALLOW_SERVE === "1" || Bun.env.SYNC_TEST_ALLOW_SERVE === "true";
const maybeTest = allowServe ? test : test.skip;

const waitFor = <A, E>(
  label: string,
  effect: Effect.Effect<A, E>,
  predicate: (value: A) => boolean,
  options?: {
    readonly retries?: number;
    readonly interval?: Duration.Input;
  }
) =>
  Effect.gen(function* () {
    const retries = options?.retries ?? 40;
    const interval = options?.interval ?? Duration.millis(25);
    for (let attempt = 0; attempt < retries; attempt += 1) {
      const value = yield* effect;
      if (predicate(value)) return value;
      yield* Effect.sleep(interval);
    }
    return yield* Effect.die(new Error(`Timed out waiting for ${label}.`));
  });

const makeReplicaLayer = (url: string, directory: string) => {
  const layers = Storage.layersFileSystemBunJournaledWithSyncWebSocket(url, {
    directory,
    syncChatHistory: false,
    syncArtifacts: true,
    disablePing: true,
  });
  const merged = Layer.mergeAll(layers.chatHistory, layers.artifacts, layers.auditLog, layers.sessionIndex);
  return layers.sync ? Layer.merge(merged, layers.sync) : merged;
};

const makeTempDir = async () => mkdtemp(path.join(os.tmpdir(), "agent-sync-"));

maybeTest("Storage sync flags only sync artifacts when configured", { timeout: 15000 }, async () => {
  const dirA = await makeTempDir();
  const dirB = await makeTempDir();

  try {
    const program = Effect.scoped(
      Effect.gen(function* () {
        const server = yield* Sync.EventLogRemoteServer;
        const replicaAContext = yield* Layer.build(makeReplicaLayer(server.url, dirA));
        const replicaBContext = yield* Layer.build(makeReplicaLayer(server.url, dirB));

        const chatA = ServiceMap.get(replicaAContext, Storage.ChatHistoryStore);
        const chatB = ServiceMap.get(replicaBContext, Storage.ChatHistoryStore);
        const artifactA = ServiceMap.get(replicaAContext, Storage.ArtifactStore);
        const artifactB = ServiceMap.get(replicaBContext, Storage.ArtifactStore);

        yield* chatA.appendMessage("session-1", makeUserMessage("hello"));
        yield* Effect.sleep(Duration.millis(200));
        const chatListB = yield* chatB.list("session-1");

        const record = ArtifactRecord.make({
          id: "artifact-sync-1",
          sessionId: "session-1",
          kind: "file",
          encoding: "utf8",
          content: "sync me",
          createdAt: makeUnsafeUtc(Date.now()),
        });
        yield* artifactA.put(record);

        const artifactsB = yield* waitFor(
          "replica B to receive artifact",
          artifactB.list("session-1"),
          (list) => list.length === 1
        );

        return { chatListB, artifactsB };
      }).pipe(Effect.provide(Sync.layerBunWebSocketTest()))
    );

    const result = await runEffectLive(program);
    expect(result.chatListB).toHaveLength(0);
    expect(result.artifactsB).toHaveLength(1);
  } finally {
    await rm(dirA, { recursive: true, force: true });
    await rm(dirB, { recursive: true, force: true });
  }
});
