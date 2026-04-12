/**
 * Hot-reloading configuration via NATS config-push subscription.
 *
 * @module
 * @since 0.1.0
 */

import type { NatsConnectionError } from "@beep/beepgraph-messaging/Errors";
import type { NatsMessage } from "@beep/beepgraph-messaging/NatsClient";
import { NatsClient } from "@beep/beepgraph-messaging/NatsClient";
import { Context, Data, Effect, Layer, Ref, Schema, Stream } from "effect";

// ---------------------------------------------------------------------------
// JSON parsing via Schema
// ---------------------------------------------------------------------------

const jsonParse = Schema.decodeUnknownSync(Schema.UnknownFromJsonString);

// ---------------------------------------------------------------------------
// Config types
// ---------------------------------------------------------------------------

const ConfigPushMessage = Schema.Struct({
  version: Schema.Number,
  config: Schema.Record(Schema.String, Schema.Unknown),
});

const decodeConfigPush = Schema.decodeUnknownSync(ConfigPushMessage);

/**
 * The full configuration payload broadcast by the ConfigService.
 *
 * @since 0.1.0
 * @category models
 */
export interface FlowConfig {
  readonly config: Record<string, unknown>;
  readonly version: number;
}

const INITIAL_CONFIG: FlowConfig = { version: 0, config: {} };

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
>()("@beep/beepgraph-services/ConfigPush") {}

// ---------------------------------------------------------------------------
// Internal error
// ---------------------------------------------------------------------------

class ConfigDecodeError extends Data.TaggedError("ConfigDecodeError") {}

// ---------------------------------------------------------------------------
// Internal: decode a config-push message
// ---------------------------------------------------------------------------

const decodeMsg = Effect.fn("ConfigPush.decodeMsg")(function* (msg: NatsMessage) {
  const text = new TextDecoder().decode(msg.data);
  const parsed = yield* Effect.try({
    try: () => decodeConfigPush(jsonParse(text)),
    catch: () => new ConfigDecodeError(),
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
              const flowConfig: FlowConfig = {
                version: parsed.version,
                config: parsed.config as Record<string, unknown>,
              };
              yield* Ref.set(ref, flowConfig);
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
