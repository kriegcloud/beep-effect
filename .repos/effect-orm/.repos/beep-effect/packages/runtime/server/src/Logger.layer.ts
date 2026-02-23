import * as HttpMiddleware from "@effect/platform/HttpMiddleware";
import * as HttpServerError from "@effect/platform/HttpServerError";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import { Context, Effect, pipe } from "effect";
import * as F from "effect/Function";
import * as O from "effect/Option";

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
