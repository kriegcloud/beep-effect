// import * as WebSdk from "@effect/opentelemetry";
import * as HttpBody from "@effect/platform/HttpBody";
import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientError from "@effect/platform/HttpClientError";
import * as HttpClientRequest from "@effect/platform/HttpClientRequest";
import * as HttpClientResponse from "@effect/platform/HttpClientResponse";
// import * as Logger from "effect/Logger";
// import * as LogLevel from "effect/LogLevel";
import * as BrowserHttpClient from "@effect/platform-browser/BrowserHttpClient";
import * as Console from "effect/Console";
import * as Context from "effect/Context";
import * as Data from "effect/Data";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
// import * as Config from "effect/Config";
import * as Either from "effect/Either";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
// import * as NodeHttpClient from "@effect/platform-node/NodeHttpClient";
import * as ParseResult from "effect/ParseResult";
// import * as A from "effect/Array";
import * as Schedule from "effect/Schedule";
import * as S from "effect/Schema";
import * as Str from "effect/String";

// import * as Ref from "effect/Ref";

const HEADER_ERRORS = [
  "LimitExceededException",
  "UserNotFoundException",
  "AccessDeniedException",
  "IncompleteSignature",
  "InternalFailure",
  "InvalidAction",
  "InvalidClientTokenId",
  "NotAuthorized",
  "OptInRequired",
  "RequestExpired",
  "ServiceUnavailable",
  "ThrottlingException",
  "ValidationError",
  "NotAuthorizedException",
  "CodeMismatchEsception",
] as const;

type ErrorWithoutColon = (typeof HEADER_ERRORS)[number];

const AmazonErrorTypeSchema = S.Literal(...HEADER_ERRORS.map((error) => `${error}:` as const)).pipe(
  S.transform(S.Literal(...HEADER_ERRORS), {
    strict: true,
    decode: (from) => Str.replace(/:/g, "")(from) as ErrorWithoutColon,
    encode: (to) => `${to}:` as const,
  })
);

const CognitoResponseHeadersErrorSchema = S.Struct({
  "x-amxn-errortype": AmazonErrorTypeSchema,
}).pipe(
  S.rename({
    "x-amxn-errortype": "errorType",
  })
);

export class CognitoResponseError extends Data.TaggedError("CognitoResponseError")<{
  readonly errorType: ErrorWithoutColon;
}> {
  public override get message(): ErrorWithoutColon {
    return this.errorType;
  }
}

const UrlSchema = S.NonEmptyTrimmedString.pipe(
  S.filter((url) => Either.try(() => new URL(url)).pipe(Either.isRight)),
  S.brand("UrlSchema")
);

const ClientEnvSchema = S.Struct({
  jsonPlaceholderUrl: UrlSchema.pipe(S.filter((url) => !Str.endsWith("/")(url.toString()))),
});

const makeCognitoClient = Effect.gen(function* () {
  const httpClient = (yield* HttpClient.HttpClient).pipe(
    HttpClient.retryTransient({
      times: 3,
      schedule: Schedule.spaced("1 second"),
    }),
    HttpClient.transformResponse(
      Effect.flatMap((response) =>
        F.pipe(
          response.headers,
          S.decodeUnknownEither(CognitoResponseHeadersErrorSchema),
          Either.match({
            onLeft: () => Effect.succeed(response),
            onRight: (error) => new CognitoResponseError({ errorType: error.errorType }),
          })
        )
      )
    ),
    HttpClient.transformResponse(Effect.timeout("5 seconds")),
    HttpClient.filterStatusOk
  );

  return {
    httpClient,
  };
});

class CognitoHttpClient extends Context.Tag("@sellhub/CognitoHttpClient")<
  CognitoHttpClient,
  Effect.Effect.Success<typeof makeCognitoClient>
>() {
  static readonly Live = Layer.effect(this, makeCognitoClient);
}

export const program3 = Effect.gen(function* () {
  const { httpClient } = yield* CognitoHttpClient;

  const response = yield* httpClient
    .get("https://cognito-idp.us-east-1.amazonaws.com/us-east-1_12345689")
    .pipe(Effect.flatMap(HttpClientResponse.schemaBodyJson(S.Any)));
  yield* Console.log(response);
}).pipe(
  Effect.provide([
    CognitoHttpClient.Live,
    // Effect.provide(FetchHttpClient.layer) // global this.fetch
    // Effect.provide(NodeHttpClient.layer) // build-in node:http and node:https
    // Effect.provide(NodeHttpClient.layerUndici) // undici (high performance http client)
    BrowserHttpClient.layerXMLHttpRequest, // XMLHttpRequest (browser)
  ])
);

export const program1 = Effect.gen(function* () {
  // const tokenRef = yield* Ref.make("");

  const httpClient = (yield* HttpClient.HttpClient).pipe(
    HttpClient.retryTransient({
      times: 3,
      schedule: Schedule.spaced("1 second"),
    }),
    HttpClient.transformResponse(
      Effect.flatMap((response) =>
        F.pipe(
          response.headers,
          S.decodeUnknownEither(CognitoResponseHeadersErrorSchema),
          Either.match({
            onLeft: () => Effect.succeed(response),
            onRight: (error) => new CognitoResponseError({ errorType: error.errorType }),
          })
        )
      )
    )
  );

  const computation = httpClient.get("https://cognito-idp.us-east-1.amazonaws.com/us-east-1_12345689").pipe(
    Effect.catchTags({
      CognitoResponseError: (error) => Effect.fail(error),
    })
  );
  yield* Console.log(computation);
});

export class ClientConfigError extends S.TaggedError<ClientConfigError>("@beep/ClientConfigError")(
  "ClientConfigError",
  {
    cause: S.Defect,
    message: S.String,
  }
) {}

const clientEnv = F.pipe(
  Data.struct({
    jsonPlaceholderUrl: process.env.NEXT_PUBLIC_JSON_PLACEHOLDER_URL,
  }) satisfies Record<keyof S.Schema.Type<typeof ClientEnvSchema>, unknown>,
  S.decodeUnknownEither(ClientEnvSchema),
  Either.getOrElse((parseError) => {
    throw new ClientConfigError({
      cause: parseError,
      message: `❌ Invalid environment variables: ${ParseResult.TreeFormatter.formatErrorSync(parseError)}`,
    });
  })
);

class Todo extends S.Class<Todo>("Todo")({
  userId: S.Number,
  id: S.Number,
  title: S.String,
  completed: S.Boolean,
}) {}

export const composeRequest = (request: HttpClientRequest.HttpClientRequest) =>
  request.pipe(HttpClientRequest.bearerToken("123"), HttpClientRequest.setHeader("API-Version", "1.0"));

export const program2 = Effect.gen(function* () {
  // const tokenRef = yield* Ref.make("");
  // const httpClient = (yield* HttpClient.HttpClient).pipe(
  //   HttpClient.mapRequest((request) => request.pipe(
  //     HttpClientRequest.bearerToken("123"),
  // HttpClientRequest.setHeader("API-Version", "1.0")
  //   ))
  // );
  const httpClient = (yield* HttpClient.HttpClient).pipe(
    HttpClient.mapRequestEffect(
      Effect.fn(function* (request) {
        return request.pipe(HttpClientRequest.bearerToken("123"), HttpClientRequest.setHeader("API-Version", "1.0"));
      })
    ),
    // HttpClient.mapRequestInputEffect
    HttpClient.mapRequestInput((request) => request),
    // HttpClient.transformResponse(Effect.retry({
    //   // schedule: Schedule.spaced("1 second"),
    //   until: (response) => response.status === 401
    //   times: 3,
    //   while: (error) => error._tag === "RequestError"
    // }),
    HttpClient.retryTransient({
      times: 3,
      schedule: Schedule.spaced("1 second"),
      //   while: (error) => error._tag === "RequestError"
    })
  );

  const request = HttpClientRequest.post(`${clientEnv.jsonPlaceholderUrl}/todos`).pipe(
    HttpClientRequest.bearerToken("123"),
    HttpClientRequest.setHeader("Content-Type", "application/json"),
    HttpClientRequest.setBody(
      yield* HttpBody.json({
        userId: 1,
        title: "foo",
        completed: false,
      })
    )
  );

  const res1 = yield* httpClient.execute(request);
  // httpClient.post(clientEnv.jsonPlaceholderUrl, {
  //   body: yield* HttpBody.json({
  //     userId: 1,
  //     title: "foo",
  //     completed: false
  //   })
  // })
  yield* Console.log(res1);
  const res3 = yield* httpClient
    .post(`${clientEnv.jsonPlaceholderUrl}/todos`, {
      body: HttpBody.unsafeJson({
        userId: 1,
        title: "foo",
        completed: false,
      }),
    })
    .pipe(Effect.flatMap(HttpClientResponse.schemaBodyJson(Todo)));

  yield* Console.log(res3);
  const res2 = yield* httpClient
    .get(`${clientEnv.jsonPlaceholderUrl}/todos/1`)
    .pipe(Effect.flatMap(HttpClientResponse.schemaBodyJson(S.Array(Todo))));
  yield* Console.log(res2);

  // const json = yield* res2.json;

  // const todo = yield* S.decodeUnknown(Todo)(res2);

  return res2;
});

// const makeRequest = HttpClient.HttpClient.pipe(
//   Effect.flatMap((service) => service.get("https://httpbin.org/status/500"))
// );
//
// const retryAfterSchedule = Schedule.identity<unknown>().pipe(
//   Schedule.map((unknownError) =>
//     O.liftPredicate(unknownError, (error) => error instanceof HttpClientError.ResponseError).pipe(
//       O.flatMap((error) => Duration.decodeUnknown(error.response.headers["X-Retry-After"])),
//       O.getOrElse(() => Duration.zero)
//     )
//   ),
//   Schedule.tapOutput((delay) => Effect.logInfo(`Calculated retry delay: ${Duration.toMillis(delay)}ms`)),
//   Schedule.delayedSchedule
// )
//
// export const retriedEffect = makeRequest.pipe(Effect.retry(retryAfterSchedule))

const makeRequest = HttpClient.HttpClient.pipe(
  Effect.flatMap((service) => service.get("https://httpbin.org/status/500"))
);

const retryAfterSchedule = Schedule.identity<unknown>().pipe(
  Schedule.map((unknownError) =>
    O.liftPredicate(unknownError, (error) => error instanceof HttpClientError.ResponseError).pipe(
      O.flatMap((error) => Duration.decodeUnknown(error.response.headers["X-Retry-After"])),
      O.getOrElse(() => Duration.zero)
    )
  ),
  Schedule.tapOutput((delay) => Effect.logInfo(`Calculated retry delay: ${Duration.toMillis(delay)}ms`)),
  Schedule.delayedSchedule
);

export const retriedEffect = makeRequest.pipe(Effect.retry(retryAfterSchedule));

class MyClient extends Effect.Service<MyClient>()("MyClient", {
  dependencies: [BrowserHttpClient.layerXMLHttpRequest],
  effect: Effect.gen(function* () {
    const httpClient = yield* HttpClient.HttpClient;

    return {
      client: httpClient,
      clientWithRetryAfter: httpClient.pipe(HttpClient.transformResponse(Effect.retry(retryAfterSchedule))),
    };
  }),
}) {}

export const main = Effect.gen(function* () {
  const myClient = yield* MyClient;

  yield* myClient.client.get("https://httpbin.org/status/500");
}).pipe(Effect.provide([MyClient.Default]));

export const View = () => {
  return <>beep</>;
};
