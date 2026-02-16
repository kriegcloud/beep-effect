import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientError from "@effect/platform/HttpClientError";
import * as Effect from "effect/Effect";

export const withResponseErrorLogging = <E, R>(client: HttpClient.HttpClient.With<E, R>) =>
  client.pipe(
    HttpClient.tapError((error) => {
      if (HttpClientError.isHttpClientError(error) && error._tag === "ResponseError") {
        return Effect.gen(function* () {
          const responseBody = yield* error.response.text.pipe(
            Effect.catchAllCause(() => Effect.succeed("<failed to read body>")),
          );

          yield* Effect.logError({
            type: "ResponseError",
            status: error.response.status,
            reason: error.reason,
            description: error.description ?? null,
            request: {
              method: error.request.method,
              url: error.request.url,
              headers: error.request.headers,
            },
            response: {
              headers: error.response.headers,
              body: responseBody,
            },
          });
        });
      }
      return Effect.void;
    }),
  );
