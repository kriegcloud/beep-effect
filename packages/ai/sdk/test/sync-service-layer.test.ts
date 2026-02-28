import { Sync } from "@beep/ai-sdk";
import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ServiceMap from "effect/ServiceMap";
import * as EventJournal from "effect/unstable/eventlog/EventJournal";
import * as EventLog from "effect/unstable/eventlog/EventLog";
import * as EventLogEncryption from "effect/unstable/eventlog/EventLogEncryption";
import { runEffect } from "./effect-test.js";

test("SyncService.layer builds without WebSocketConstructor", async () => {
  const eventLogLayer = EventLog.layerEventLog.pipe(
    Layer.provide(EventJournal.layerMemory),
    Layer.provide(Layer.sync(EventLog.Identity, () => EventLog.makeIdentityUnsafe()))
  );

  const layer = Sync.SyncService.layer.pipe(
    Layer.provide(eventLogLayer),
    Layer.provide(EventLogEncryption.layerSubtle)
  );

  const statuses = await runEffect(
    Effect.scoped(
      Effect.gen(function* () {
        const context = yield* Layer.build(layer);
        const service = ServiceMap.get(context, Sync.SyncService);
        return yield* service.status();
      })
    )
  );

  expect(statuses).toEqual([]);
});
