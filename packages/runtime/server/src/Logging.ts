import { makePrettyConsoleLoggerLayer } from "@beep/errors/server";
import * as HttpMiddleware from "@effect/platform/HttpMiddleware";
import * as HttpServerError from "@effect/platform/HttpServerError";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as RpcMiddleware from "@effect/rpc/RpcMiddleware";
import { Context, Effect, Exit, pipe } from "effect";
import * as Bool from "effect/Boolean";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as O from "effect/Option";
import { isDevEnvironment, logLevel } from "./Environment";

export type LoggingLive = Layer.Layer<never, never, never>;

export const LoggingLive: LoggingLive = Layer.mergeAll(
  Bool.match(isDevEnvironment, {
    onTrue: makePrettyConsoleLoggerLayer,
    onFalse: F.constant(Logger.json),
  }),
  Logger.minimumLogLevel(logLevel)
);

export const httpLogger = HttpMiddleware.make((httpApp) => {
  let counter = 0;
  return Effect.withFiberRuntime((fiber) => {
    const request = Context.unsafeGet(fiber.currentContext, HttpServerRequest.HttpServerRequest);
    return Effect.withLogSpan(
      Effect.flatMap(Effect.exit(httpApp), (exit) => {
        if (fiber.getFiberRef(HttpMiddleware.loggerDisabled)) {
          return exit;
        }

        if (exit._tag === "Failure") {
          const [response, cause] = HttpServerError.causeResponseStripped(exit.cause);
          if (response.status === 404) {
            return exit;
          }
          return Effect.zipRight(
            Effect.annotateLogs(
              pipe(
                cause,
                O.match({
                  onNone: F.constant("Sent Http Response"),
                  onSome: F.identity,
                }),
                Effect.log
              ),

              {
                "http.method": request.method,
                "http.url": request.url,
                "http.status": response.status,
              }
            ),
            exit
          );
        }
        return Effect.zipRight(
          Effect.annotateLogs(Effect.log("Sent HTTP response"), {
            "http.method": request.method,
            "http.url": request.url,
            "http.status": exit.value.status,
          }),
          exit
        );
      }),
      `http.span.${++counter}`
    );
  });
});

export class RpcLogger extends RpcMiddleware.Tag<RpcLogger>()("RpcLogger", {
  wrap: true,
  optional: true,
}) {}

export const RpcLoggerLive = Layer.succeed(
  RpcLogger,
  RpcLogger.of((opts) =>
    Effect.flatMap(Effect.exit(opts.next), (exit) =>
      Exit.match(exit, {
        onSuccess: F.constant(exit),
        onFailure: (cause) =>
          Effect.zipRight(
            Effect.annotateLogs(Effect.logError(`RPC request failed: ${opts.rpc._tag}`, cause), {
              "rpc.method": opts.rpc._tag,
              "rpc.clientId": opts.clientId,
            }),
            exit
          ),
      })
    )
  )
);
