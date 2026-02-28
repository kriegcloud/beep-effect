import { Storage, Sync } from "@beep/ai-sdk";
import { makeUserMessage } from "@beep/ai-sdk/internal/messages";
import { expect, test } from "@effect/vitest";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ServiceMap from "effect/ServiceMap";
import { KeyValueStore } from "effect/unstable/persistence";
import { runEffectLive } from "./effect-test.js";

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
    const interval = options?.interval ?? Duration.millis(50);
    for (let attempt = 0; attempt < retries; attempt += 1) {
      const value = yield* effect;
      if (predicate(value)) return value;
      yield* Effect.sleep(interval);
    }
    return yield* Effect.die(new Error(`Timed out waiting for ${label}.`));
  });

const sharedIdentityKey = "sync-test-cloudflare-identity";

const makeReplicaLayer = (
  url: string,
  kv: KeyValueStore.KeyValueStore,
  options: { readonly prefix: string; readonly protocols?: string | Array<string> }
) => {
  const baseLayer = Storage.ChatHistoryStore.layerJournaledWithEventLog({
    prefix: options.prefix,
    identityKey: sharedIdentityKey,
  });
  const syncLayer = Sync.SyncService.layerWebSocket(url, {
    disablePing: true,
    ...(options.protocols !== undefined ? { protocols: options.protocols } : {}),
  }).pipe(Layer.provide(baseLayer));
  return Layer.merge(baseLayer, syncLayer).pipe(Layer.provide(Layer.succeed(KeyValueStore.KeyValueStore, kv)));
};

const baseUrl = Bun.env.CLOUDFLARE_SYNC_URL;
const tenant = Bun.env.CLOUDFLARE_SYNC_TENANT ?? `test-${Date.now()}`;
const authToken = Bun.env.CLOUDFLARE_SYNC_TOKEN;
const protocols = authToken ? `sync-auth.${authToken}` : undefined;

const maybeTest = baseUrl ? test : test.skip;

maybeTest(
  "Cloudflare remote sync propagates messages (requires CLOUDFLARE_SYNC_URL)",
  async () => {
    const program = Effect.scoped(
      Effect.gen(function* () {
        if (baseUrl === undefined) {
          return [];
        }
        const remoteUrl = yield* Sync.buildRemoteUrl(baseUrl, {
          tenant,
        });
        const kvContext = yield* Layer.build(KeyValueStore.layerMemory);
        const kv = ServiceMap.get(kvContext, KeyValueStore.KeyValueStore);

        const replicaAContext = yield* Layer.build(
          makeReplicaLayer(remoteUrl, kv, {
            prefix: "replica-a",
            ...(protocols !== undefined ? { protocols } : {}),
          })
        );
        const replicaBContext = yield* Layer.build(
          makeReplicaLayer(remoteUrl, kv, {
            prefix: "replica-b",
            ...(protocols !== undefined ? { protocols } : {}),
          })
        );

        const storeA = ServiceMap.get(replicaAContext, Storage.ChatHistoryStore);
        const storeB = ServiceMap.get(replicaBContext, Storage.ChatHistoryStore);
        const syncA = ServiceMap.get(replicaAContext, Sync.SyncService);
        const syncB = ServiceMap.get(replicaBContext, Sync.SyncService);

        yield* waitFor(
          "replica A to connect",
          syncA.status(),
          (statuses) => statuses.some((status) => status.key === remoteUrl && status.connected),
          { retries: 60 }
        );
        yield* waitFor(
          "replica B to connect",
          syncB.status(),
          (statuses) => statuses.some((status) => status.key === remoteUrl && status.connected),
          { retries: 60 }
        );

        yield* storeA.appendMessage("session-1", makeUserMessage("hello cloudflare"));

        const listB = yield* waitFor(
          "replica B to receive message",
          storeB.list("session-1"),
          (list) => list.length === 1,
          { retries: 160, interval: Duration.millis(100) }
        );

        yield* syncA.disconnectWebSocket(remoteUrl);
        yield* syncB.disconnectWebSocket(remoteUrl);
        yield* Effect.sleep(Duration.millis(50));

        return listB;
      })
    );

    const listB = await runEffectLive(program);
    expect(listB).toHaveLength(1);
  },
  { timeout: 30000 }
);
