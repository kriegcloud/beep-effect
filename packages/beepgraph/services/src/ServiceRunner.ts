/**
 * High-level service runner for the common request/response pattern.
 *
 * @module
 * @since 0.1.0
 */

import type { NatsMessage } from "@beep/beepgraph-messaging/NatsClient";

import { NatsClient } from "@beep/beepgraph-messaging/NatsClient";
import { Data, Effect, Schema, Stream } from "effect";

// ---------------------------------------------------------------------------
// JSON helpers via Schema
// ---------------------------------------------------------------------------

const jsonParse = Schema.decodeUnknownSync(Schema.UnknownFromJsonString);
const jsonStringify = Schema.encodeUnknownSync(Schema.UnknownFromJsonString);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Handler function invoked for each decoded request.
 *
 * @since 0.1.0
 * @category models
 */
export type RequestHandler<Req, Res, E, R> = (request: Req, requestId: string) => Effect.Effect<Res, E, R>;

/**
 * Configuration for `makeServiceRunner`.
 *
 * @since 0.1.0
 * @category models
 */
export interface ServiceRunnerConfig<Req, Res, E, R> {
  readonly consumerGroup: string;
  readonly handler: RequestHandler<Req, Res, E, R>;
  readonly name: string;
  readonly requestDecoder: Schema.Decoder<Req>;
  readonly requestTopic: string;
  readonly responseEncoder: Schema.Encoder<Res>;
  readonly responseTopic: string;
}

// ---------------------------------------------------------------------------
// Internal error for decode failures
// ---------------------------------------------------------------------------

class RequestDecodeError extends Data.TaggedError("RequestDecodeError")<{
  readonly raw: string;
}> {}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

/**
 * Create a scoped service runner that subscribes to a request topic,
 * decodes messages, invokes a handler, encodes responses, and publishes
 * them.
 *
 * @since 0.1.0
 * @category constructors
 */
export const makeServiceRunner = <Req, Res, E, R>(config: ServiceRunnerConfig<Req, Res, E, R>) => {
  const decodeRequest = Schema.decodeUnknownSync(config.requestDecoder);
  const encodeResponse = Schema.encodeUnknownSync(config.responseEncoder);

  return Effect.gen(function* () {
    const nats = yield* NatsClient;
    const rawStream = yield* nats.subscribe(config.requestTopic, config.consumerGroup);

    yield* rawStream.pipe(
      Stream.mapEffect((msg: NatsMessage) =>
        Effect.gen(function* () {
          const requestId = msg.properties.id ?? "unknown";
          const text = new TextDecoder().decode(msg.data);

          // Decode the request
          const decoded = yield* Effect.try({
            try: () => decodeRequest(jsonParse(text)),
            catch: () => new RequestDecodeError({ raw: text }),
          });

          // Handle
          const response = yield* config.handler(decoded, requestId).pipe(
            Effect.withSpan(`${config.name}.handle`, {
              attributes: { requestId },
            })
          );

          // Encode + publish response
          const responseEncoded = encodeResponse(response);
          const responseJson = jsonStringify(responseEncoded);
          yield* nats.publish(config.responseTopic, new TextEncoder().encode(responseJson), {
            "Nats-Msg-Id": requestId,
          });

          yield* msg.ack();
        }).pipe(
          Effect.catchTag("RequestDecodeError", () =>
            Effect.gen(function* () {
              yield* Effect.logWarning(`${config.name}: decode failed`);
              yield* msg.nak();
            })
          )
        )
      ),
      Stream.runDrain,
      Effect.withSpan(`${config.name}.consumer`),
      Effect.forkScoped
    );
  });
};
