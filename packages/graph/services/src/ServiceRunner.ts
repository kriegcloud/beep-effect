/**
 * High-level service runner for the common request/response pattern.
 *
 * @module
 * @since 0.1.0
 */

import type {NatsMessage} from "@beep/graph-messaging/NatsClient";

import {NatsClient} from "@beep/graph-messaging/NatsClient";
import {Data, Effect, Schema, Stream} from "effect";

// ---------------------------------------------------------------------------
// JSON helpers via Schema
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Handler function invoked for each decoded request.
 *
 * @since 0.1.0
 * @category models
 */
export type RequestHandler<Req, Res, E, R> = (
  request: Req,
  requestId: string,
) => Effect.Effect<Res, E, R>;

/**
 * Configuration for `makeServiceRunner`.
 *
 * @since 0.1.0
 * @category models
 */
export class ServiceRunnerConfig<Req, Res, E, R> {
  declare readonly consumerGroup: string;
  declare readonly handler: RequestHandler<Req, Res, E, R>;
  declare readonly name: string;
  declare readonly requestDecoder: Schema.Decoder<Req>;
  declare readonly requestTopic: string;
  declare readonly responseEncoder: Schema.Encoder<Res>;
  declare readonly responseTopic: string;
}

// ---------------------------------------------------------------------------
// Internal error for decode failures
// ---------------------------------------------------------------------------

class RequestDecodeError extends Data.TaggedError("RequestDecodeError")<{
  readonly raw: string;
}> {
}

class ResponseEncodeError extends Data.TaggedError("ResponseEncodeError")<{
  readonly cause: string;
}> {
}

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
export const makeServiceRunner = Effect.fn("makeServiceRunner")(
  function* <Req, Res, E, R>(config: ServiceRunnerConfig<Req, Res, E, R>) {
    const nats = yield* NatsClient;
    const decodeRequest = Schema.decodeUnknownEffect(
      Schema.fromJsonString(config.requestDecoder),
    );
    const rawStream = yield* nats.subscribe(
      config.requestTopic,
      config.consumerGroup,
    );

    yield* rawStream.pipe(
      Stream.mapEffect((msg: NatsMessage) => Effect.gen(
        function* () {
          const requestId = msg.properties.id ?? "unknown";
          const text = new TextDecoder().decode(msg.data);

          // Decode the request
          const decoded = yield* decodeRequest(text).pipe(
            Effect.mapError(() => new RequestDecodeError({raw: text})),
          );


          // Handle + encode + publish — wrapped so handler errors
          // don't escape and kill the consumer loop
          const response = yield* config.handler(
            decoded,
            requestId
          )
            .pipe(Effect.withSpan(`${config.name}.handle`, {
              attributes: {requestId},
            }));

          const responseEncoded = yield* Schema.encodeUnknownEffect(config.responseEncoder)(
            response)
            .pipe(Effect.mapError((cause) => new ResponseEncodeError({
              cause: String(cause),
            })))
          const responseJson = yield* Schema.encodeUnknownEffect(Schema.UnknownFromJsonString)(responseEncoded).pipe(
            Effect.mapError((cause) => new ResponseEncodeError({cause: String(cause)}))
          );

          yield* nats.publish(
            config.responseTopic,
            new TextEncoder().encode(responseJson),
            {
              "Nats-Msg-Id": requestId,
            },
          );

          yield* msg.ack();
        })
        .pipe(
          Effect.catchTag(
            "RequestDecodeError",
            Effect.fnUntraced(function* () {
              yield* Effect.logWarning(`${config.name}: decode failed`);
              yield* msg.nak();
            }),
          ),
          Effect.catchTag("ResponseEncodeError",  Effect.fnUntraced(function* () {
            yield* Effect.logError(`${config.name}: response encode failed`);
            yield* msg.nak();
          })),
          // Catch all remaining errors (handler errors of type E, publish
          // errors, etc.) so the consumer loop stays alive
          Effect.catchCause( Effect.fnUntraced(function* (cause) {
            yield* Effect.logError(`${config.name}: handler failed`, cause);
            yield* msg.nak();
          })),
        )),
      Stream.runDrain,
      Effect.withSpan(`${config.name}.consumer`),
      Effect.forkScoped,
    );
  });
