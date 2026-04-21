/**
 * Hot-reloading configuration via NATS config-push subscription.
 *
 * @module
 * @since 0.1.0
 */

import { $GraphServicesId } from "@beep/identity";
import type { NatsConnectionError } from "@beep/graph-messaging/Errors";
import type { NatsMessage } from "@beep/graph-messaging/NatsClient";
import { NatsClient } from "@beep/graph-messaging/NatsClient";
import { TaggedErrorClass } from "@beep/schema";
import { Context, Effect, Layer, Ref, Stream } from "effect";
import * as S from "effect/Schema";

const $I = $GraphServicesId.create("ConfigPush");

/**
 * The full configuration payload broadcast by the ConfigService.
 *
 * @since 0.1.0
 * @category models
 */
export class FlowConfig extends S.Class<FlowConfig>($I`FlowConfig`)({
  version: S.Number.annotateKey({
    description: "Monotonic configuration version from the config service.",
  }),
  config: S.Record(S.String, S.Unknown).annotateKey({
    description: "Raw configuration key-value payload broadcast by the config service.",
  }),
}, $I.annote("FlowConfig", {
  description: "Hot-reloaded configuration payload broadcast over config-push.",
})) {}

const decodeConfigPush = S.decodeUnknownSync(S.fromJsonString(FlowConfig));

const INITIAL_CONFIG = new FlowConfig({ version: 0, config: {} });

// ---------------------------------------------------------------------------
// Service definition
// ---------------------------------------------------------------------------

/**
 * Provides access to the latest configuration pushed over NATS.
 *
 * @since 0.1.0
 * @category services
 */
export class ConfigPush extends Context.Service<
  ConfigPush,
  {
    readonly current: Effect.Effect<FlowConfig>;
  }
>()($I`ConfigPush`) {}

// ---------------------------------------------------------------------------
// Internal error
// ---------------------------------------------------------------------------

class ConfigDecodeError extends TaggedErrorClass<ConfigDecodeError>($I`ConfigDecodeError`)(
  "ConfigDecodeError",
  {
    raw: S.String,
  },
  $I.annote("ConfigDecodeError", {
    description: "Config-push payload could not be decoded into a FlowConfig.",
  }),
) {}

// ---------------------------------------------------------------------------
// Internal: decode a config-push message
// ---------------------------------------------------------------------------

const decodeMsg = Effect.fn("ConfigPush.decodeMsg")(function* (msg: NatsMessage) {
  const text = new TextDecoder().decode(msg.data);
  const parsed = yield* Effect.try({
    try: () => decodeConfigPush(text),
    catch: () => new ConfigDecodeError({ raw: text }),
  });
  return parsed;
});

// ---------------------------------------------------------------------------
// Layer
// ---------------------------------------------------------------------------

const CONFIG_PUSH_TOPIC = "tg.flow.config-push";

/**
 * Live layer that subscribes to config-push and maintains a `Ref`.
 *
 * @since 0.1.0
 * @category layers
 */
export const ConfigPushLive: Layer.Layer<ConfigPush, NatsConnectionError, NatsClient> = Layer.effect(
  ConfigPush,
  Effect.gen(function* () {
    const nats = yield* NatsClient;
    const ref = yield* Ref.make<FlowConfig>(INITIAL_CONFIG);

    const rawStream = yield* nats.subscribe(CONFIG_PUSH_TOPIC, "beepgraph-config-push");

    yield* rawStream.pipe(
      Stream.mapEffect((msg: NatsMessage) =>
        decodeMsg(msg).pipe(
          Effect.andThen((parsed) =>
            Effect.gen(function* () {
              yield* Ref.set(ref, parsed);
              yield* msg.ack();
              yield* Effect.logDebug(`ConfigPush: updated to v${parsed.version}`);
            })
          ),
          Effect.catchTag("ConfigDecodeError", () =>
            Effect.gen(function* () {
              yield* Effect.logWarning("ConfigPush: failed to decode config-push message");
              yield* msg.nak();
            })
          )
        )
      ),
      Stream.runDrain,
      Effect.forkScoped
    );

    return ConfigPush.of({
      current: Ref.get(ref),
    });
  })
);
