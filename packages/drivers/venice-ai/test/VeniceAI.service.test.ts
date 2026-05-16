import { $VeniceAiId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { decodeJsonString } from "@beep/schema/Json";
import { parseYaml } from "@beep/schema/Yaml";
import { A, Str, thunkEmptyStr, thunkTrue } from "@beep/utils";
import {
  VENICE_AI_OPERATION_DESCRIPTORS,
  VENICE_API_URL,
  VeniceAI,
  VeniceAIConfigInput,
  VeniceAIError,
  VeniceAIRequestOptions,
  VeniceAiChat,
  VeniceAiLanguageModel,
} from "@beep/venice-ai";
import { describe, expect, layer } from "@effect/vitest";
import { Context, Effect, Layer, pipe, Redacted, Ref, Stream } from "effect";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientError from "effect/unstable/http/HttpClientError";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";

const $TestI = $VeniceAiId.create("VeniceAI.service.test");

type CapturedRequest = {
  readonly bodyTag: string;
  readonly bodyText: string | undefined;
  readonly contentType: string | undefined;
  readonly headers: Readonly<Record<string, string>>;
  readonly method: string;
  readonly url: string;
};

type VeniceAITestRespond = (
  request: HttpClientRequest.HttpClientRequest
) => Effect.Effect<Response, HttpClientError.HttpClientError>;

type VeniceAITestHttpShape = {
  readonly captures: Effect.Effect<ReadonlyArray<CapturedRequest>>;
  readonly handle: VeniceAITestRespond;
  readonly reset: Effect.Effect<void>;
  readonly respondWith: (respond: VeniceAITestRespond) => Effect.Effect<void>;
};

class VeniceAITestHttp extends Context.Service<VeniceAITestHttp, VeniceAITestHttpShape>()($TestI`VeniceAITestHttp`) {}

const HttpMethod = LiteralKit(["delete", "get", "patch", "post"] as const).pipe(
  $TestI.annoteSchema("HttpMethod", {
    description: "HTTP methods used by the Venice AI OpenAPI fixture parser.",
  })
);
const isHttpMethod = S.is(HttpMethod);

class OpenApiRequestBody extends S.Class<OpenApiRequestBody>($TestI`OpenApiRequestBody`)(
  {
    content: S.Record(S.String, S.Unknown),
  },
  $TestI.annote("OpenApiRequestBody", {
    description: "OpenAPI request body fixture shape used by Venice AI driver tests.",
  })
) {}

class OpenApiResponse extends S.Class<OpenApiResponse>($TestI`OpenApiResponse`)(
  {
    content: S.optionalKey(S.Record(S.String, S.Unknown)),
  },
  $TestI.annote("OpenApiResponse", {
    description: "OpenAPI response fixture shape used by Venice AI driver tests.",
  })
) {}

class OpenApiOperation extends S.Class<OpenApiOperation>($TestI`OpenApiOperation`)(
  {
    operationId: S.optionalKey(S.String),
    requestBody: S.optionalKey(OpenApiRequestBody),
    responses: S.Record(S.String, OpenApiResponse),
    security: S.Unknown.pipe(S.Array, S.optionalKey),
    tags: S.String.pipe(S.Array, S.optionalKey),
  },
  $TestI.annote("OpenApiOperation", {
    description: "OpenAPI operation fixture shape used by Venice AI driver tests.",
  })
) {}

class OpenApiSpec extends S.Class<OpenApiSpec>($TestI`OpenApiSpec`)(
  {
    paths: S.Record(S.String, S.Record(S.String, S.Unknown)),
  },
  $TestI.annote("OpenApiSpec", {
    description: "OpenAPI document fixture shape used by Venice AI driver tests.",
  })
) {}

const decodeOpenApiSpec = S.decodeUnknownEffect(OpenApiSpec);
const decodeOpenApiOperation = S.decodeUnknownEffect(OpenApiOperation);
class PromptBody extends S.Class<PromptBody>($TestI`PromptBody`)(
  {
    model: S.String,
    prompt: S.String,
    stream: S.optionalKey(S.Boolean),
  },
  $TestI.annote("PromptBody", {
    description: "Minimal JSON prompt body fixture shape used by Venice AI driver tests.",
  })
) {}

const decodePromptBody = S.decodeUnknownEffect(PromptBody);

const sortStrings = A.sort(Order.String);
const swaggerFile = new URL("../swagger.yaml", import.meta.url);

const descriptorIds = () => sortStrings(A.map(VENICE_AI_OPERATION_DESCRIPTORS, (descriptor) => descriptor.operationId));

const readSwagger = Effect.gen(function* () {
  const raw = yield* Effect.tryPromise({
    try: () => Bun.file(swaggerFile).text(),
    catch: () => new VeniceAIError({ path: "swagger.yaml", reason: "request encoding" }),
  });
  return yield* decodeOpenApiSpec(parseYaml(raw));
});

const swaggerOperationIds = Effect.gen(function* () {
  const spec = yield* readSwagger;
  return pipe(
    spec.paths,
    R.toEntries,
    A.flatMap(([path, operations]) =>
      pipe(
        operations,
        R.toEntries,
        A.map(([, operation]) =>
          P.isObject(operation) && P.hasProperty(operation, "operationId") && P.isString(operation.operationId)
            ? operation.operationId
            : path === "/image/styles"
              ? "listImageStyles"
              : ""
        )
      )
    ),
    A.filter(Str.isNonEmpty),
    sortStrings
  );
});

const swaggerDescriptors = Effect.gen(function* () {
  const spec = yield* readSwagger;
  const rawOperations = pipe(
    spec.paths,
    R.toEntries,
    A.flatMap(([path, operations]) =>
      pipe(
        operations,
        R.toEntries,
        A.filter(([method]) => isHttpMethod(method)),
        A.map(([method, operation]) => ({ method, operation, path }))
      )
    ),
    A.sortWith((operation) => `${operation.path}:${operation.method}`, Order.String)
  );

  const descriptors = yield* Effect.forEach(
    rawOperations,
    ({ method, operation, path }) =>
      Effect.gen(function* () {
        const decoded = yield* decodeOpenApiOperation(operation);

        return {
          method: Str.toUpperCase(method),
          operationId: decoded.operationId ?? (path === "/image/styles" ? "listImageStyles" : ""),
          path,
          authenticated: pipe(
            O.fromUndefinedOr(decoded.security),
            O.map(A.isReadonlyArrayEmpty),
            O.map((isEmpty) => !isEmpty),
            O.getOrElse(thunkTrue)
          ),
          requestContentTypes: pipe(
            O.fromUndefinedOr(decoded.requestBody),
            O.map((requestBody) => R.keys(requestBody.content)),
            O.getOrElse(A.empty<string>)
          ),
          responseContentTypes: pipe(
            decoded.responses,
            R.toEntries,
            A.flatMap(([, response]) =>
              pipe(O.fromUndefinedOr(response.content), O.map(R.keys), O.getOrElse(A.empty<string>))
            ),
            A.dedupe,
            sortStrings
          ),
          tag: pipe(O.fromUndefinedOr(decoded.tags), O.flatMap(A.get(0)), O.getOrElse(thunkEmptyStr)),
        };
      }),
    { concurrency: 1 }
  );

  return pipe(
    descriptors,
    A.filter((operation) => Str.isNonEmpty(operation.operationId)),
    A.sortWith((operation) => operation.operationId, Order.String)
  );
});

const makeJsonResponse = (body: unknown, status = 200) =>
  Response.json(body, {
    headers: {
      "content-type": "application/json",
    },
    status,
  });

const defaultRespond: VeniceAITestRespond = () => Effect.succeed(makeJsonResponse({ ok: true }));

const bodyTextFor = (request: HttpClientRequest.HttpClientRequest): string | undefined =>
  request.body._tag === "Uint8Array" ? new TextDecoder().decode(request.body.body) : undefined;

const bodyContentTypeFor = (request: HttpClientRequest.HttpClientRequest): string | undefined =>
  request.body._tag === "Empty" ? undefined : request.body.contentType;

const testSetupError = (path: string): VeniceAIError =>
  new VeniceAIError({
    path,
    reason: "request encoding",
  });

const captureAt = (
  captures: ReadonlyArray<CapturedRequest>,
  index: number,
  label: string
): Effect.Effect<CapturedRequest, VeniceAIError> =>
  pipe(
    captures,
    A.get(index),
    O.match({
      onNone: () => Effect.fail(testSetupError(label)),
      onSome: Effect.succeed,
    })
  );

const bodyTextFromCapture = (capture: CapturedRequest, label: string): Effect.Effect<string, VeniceAIError> =>
  pipe(
    O.fromUndefinedOr(capture.bodyText),
    O.match({
      onNone: () => Effect.fail(testSetupError(label)),
      onSome: Effect.succeed,
    })
  );

const VeniceAITestHttpLayer = Layer.effect(
  VeniceAITestHttp,
  Effect.gen(function* () {
    const capturesRef = yield* Ref.make<ReadonlyArray<CapturedRequest>>([]);
    const respondRef = yield* Ref.make<VeniceAITestRespond>(defaultRespond);

    return VeniceAITestHttp.of({
      captures: Ref.get(capturesRef),
      handle: Effect.fn("VeniceAITestHttp.handle")(function* (request) {
        const url = pipe(
          HttpClientRequest.toUrl(request),
          O.map((value) => value.toString()),
          O.getOrElse(() => request.url)
        );

        yield* Ref.update(
          capturesRef,
          A.append({
            bodyTag: request.body._tag,
            bodyText: bodyTextFor(request),
            contentType: bodyContentTypeFor(request),
            headers: request.headers,
            method: request.method,
            url,
          })
        );

        const respond = yield* Ref.get(respondRef);
        return yield* respond(request);
      }),
      reset: Effect.all([Ref.set(capturesRef, []), Ref.set(respondRef, defaultRespond)], { discard: true }),
      respondWith: Effect.fn("VeniceAITestHttp.respondWith")(function* (respond) {
        yield* Ref.set(respondRef, respond);
      }),
    });
  })
);

const TestHttpClientLayer = Layer.effect(
  HttpClient.HttpClient,
  Effect.gen(function* () {
    const testHttp = yield* VeniceAITestHttp;

    return HttpClient.make((request) =>
      Effect.gen(function* () {
        const response = yield* testHttp.handle(request);
        return HttpClientResponse.fromWeb(request, response);
      })
    );
  })
);

const makeVeniceAIUnitLayer = (
  config = new VeniceAIConfigInput({ apiKey: Redacted.make("test-key"), baseUrl: VENICE_API_URL })
) => VeniceAI.makeLayer(config).pipe(Layer.provide(TestHttpClientLayer), Layer.provideMerge(VeniceAITestHttpLayer));

const makeVeniceAIChatUnitLayer = () => VeniceAiChat.makeLayer.pipe(Layer.provideMerge(makeVeniceAIUnitLayer()));

const pathParamsFor = (path: string): Readonly<Record<string, string>> =>
  R.getSomes({
    id: Str.includes("{id}")(path) ? O.some("api-key-id") : O.none(),
    network: Str.includes("{network}")(path) ? O.some("base") : O.none(),
    slug: Str.includes("{slug}")(path) ? O.some("ada") : O.none(),
    walletAddress: Str.includes("{walletAddress}")(path) ? O.some("0xabc") : O.none(),
  });

const concretePathFor = (path: string): string =>
  pipe(
    path,
    Str.replace("{id}", "api-key-id"),
    Str.replace("{network}", "base"),
    Str.replace("{slug}", "ada"),
    Str.replace("{walletAddress}", "0xabc")
  );

const requestFor = (descriptor: (typeof VENICE_AI_OPERATION_DESCRIPTORS)[number]): VeniceAIRequestOptions => {
  const formData = new FormData();
  formData.append("file", new File(["hello"], "hello.txt", { type: "text/plain" }));

  return new VeniceAIRequestOptions({
    ...R.getSomes({
      body: pipe(descriptor.requestContentTypes, A.contains("application/json"), (hasJson) =>
        hasJson ? O.some({ model: "venice-uncensored-1-2", prompt: "hello" }) : O.none()
      ),
    }),
    ...R.getSomes({
      formData: pipe(descriptor.requestContentTypes, A.contains("multipart/form-data"), (hasMultipart) =>
        hasMultipart ? O.some(formData) : O.none()
      ),
    }),
    path: pathParamsFor(descriptor.path),
    query: {
      limit: 1,
    },
  });
};

describe("@beep/venice-ai", () => {
  layer(makeVeniceAIUnitLayer())((it) =>
    it.effect("keeps the operation registry and service surface aligned with swagger.yaml", () =>
      Effect.gen(function* () {
        const testHttp = yield* VeniceAITestHttp;
        yield* testHttp.reset;

        const fromSwagger = yield* swaggerOperationIds;
        expect(descriptorIds()).toEqual(fromSwagger);

        const venice = yield* VeniceAI;
        const serviceKeys = sortStrings(R.keys(venice));

        expect(serviceKeys).toContain("streamChatCompletion");
        expect(serviceKeys).toContain("streamResponse");
        expect(
          pipe(
            serviceKeys,
            A.filter((key) => !Str.startsWith("stream")(key))
          )
        ).toEqual(fromSwagger);
      })
    )
  );

  layer(makeVeniceAIUnitLayer())((it) =>
    it.effect("keeps descriptor metadata aligned with swagger.yaml", () =>
      Effect.gen(function* () {
        const fromSwagger = yield* swaggerDescriptors;
        const fromRegistry = pipe(
          VENICE_AI_OPERATION_DESCRIPTORS,
          A.map((descriptor) => ({
            authenticated: descriptor.authenticated,
            method: descriptor.method,
            operationId: descriptor.operationId,
            path: descriptor.path,
            requestContentTypes: sortStrings(descriptor.requestContentTypes),
            responseContentTypes: sortStrings(descriptor.responseContentTypes),
            tag: descriptor.tag,
          })),
          A.sortWith((operation) => operation.operationId, Order.String)
        );

        expect(fromRegistry).toEqual(fromSwagger);
      })
    )
  );

  layer(makeVeniceAIUnitLayer())((it) =>
    it.effect("sends every operation with the expected method, path, auth, query, and body mode", () =>
      Effect.gen(function* () {
        const testHttp = yield* VeniceAITestHttp;
        yield* testHttp.reset;

        const venice = yield* VeniceAI;

        yield* Effect.forEach(
          VENICE_AI_OPERATION_DESCRIPTORS,
          (descriptor) => venice[descriptor.operationId](requestFor(descriptor)),
          { concurrency: 1, discard: true }
        );

        const captures = yield* testHttp.captures;
        expect(captures).toHaveLength(VENICE_AI_OPERATION_DESCRIPTORS.length);

        yield* Effect.forEach(
          VENICE_AI_OPERATION_DESCRIPTORS,
          (descriptor, index) =>
            Effect.sync(() => {
              const capture = captures[index];
              const expectedAccept = pipe(
                descriptor.responseContentTypes,
                A.get(0),
                O.getOrElse(() => "application/json")
              );

              expect(capture?.method).toBe(descriptor.method);
              expect(capture?.headers.accept).toBe(expectedAccept);
              expect(capture?.headers.authorization).toBe(descriptor.authenticated ? "Bearer test-key" : undefined);
              expect(capture?.url).toContain(`${VENICE_API_URL}${concretePathFor(descriptor.path)}`);
              expect(capture?.url).toContain("limit=1");

              if (pipe(descriptor.requestContentTypes, A.contains("multipart/form-data"))) {
                expect(capture?.bodyTag).toBe("FormData");
              } else if (pipe(descriptor.requestContentTypes, A.contains("application/json"))) {
                expect(capture?.contentType).toContain("application/json");
              } else {
                expect(capture?.bodyTag).toBe("Empty");
              }
            }),
          { concurrency: 1, discard: true }
        );
      })
    )
  );

  layer(makeVeniceAIUnitLayer())((it) =>
    it.effect("honors request options for headers, accept, path encoding, JSON bodies, and missing path params", () =>
      Effect.gen(function* () {
        const testHttp = yield* VeniceAITestHttp;
        const venice = yield* VeniceAI;

        yield* testHttp.reset;
        yield* venice.getCharacterBySlug(
          new VeniceAIRequestOptions({
            accept: "text/csv",
            headers: { "x-test": "ok" },
            path: { slug: "ada lovelace" },
          })
        );

        const encodedCapture = yield* pipe(
          testHttp.captures,
          Effect.flatMap((captures) => captureAt(captures, 0, "expected encoded path capture"))
        );

        expect(encodedCapture.headers.accept).toBe("text/csv");
        expect(encodedCapture.headers["x-test"]).toBe("ok");
        expect(encodedCapture.url).toContain("/characters/ada%20lovelace");

        yield* testHttp.reset;
        const missingPathError = yield* venice.getCharacterBySlug().pipe(Effect.flip);
        expect(missingPathError.reason).toBe("request encoding");
        expect(missingPathError.operation).toBe("getCharacterBySlug");

        yield* testHttp.reset;
        const invalidQueryRequest = { query: { bad: null } } as unknown as VeniceAIRequestOptions;
        const invalidQueryError = yield* venice.listModels(invalidQueryRequest).pipe(Effect.flip);
        const capturesAfterInvalidQuery = yield* testHttp.captures;
        expect(invalidQueryError.reason).toBe("request encoding");
        expect(invalidQueryError.operation).toBe("listModels");
        expect(capturesAfterInvalidQuery).toHaveLength(0);

        yield* testHttp.reset;
        const unsupportedJsonBodyError = yield* venice
          .listModels(new VeniceAIRequestOptions({ body: { ignored: true } }))
          .pipe(Effect.flip);
        const capturesAfterUnsupportedJsonBody = yield* testHttp.captures;
        expect(unsupportedJsonBodyError.reason).toBe("request encoding");
        expect(unsupportedJsonBodyError.operation).toBe("listModels");
        expect(capturesAfterUnsupportedJsonBody).toHaveLength(0);

        yield* testHttp.reset;
        const unsupportedMultipartBodyError = yield* venice
          .listModels(new VeniceAIRequestOptions({ formData: new FormData() }))
          .pipe(Effect.flip);
        const capturesAfterUnsupportedMultipartBody = yield* testHttp.captures;
        expect(unsupportedMultipartBodyError.reason).toBe("request encoding");
        expect(unsupportedMultipartBodyError.operation).toBe("listModels");
        expect(capturesAfterUnsupportedMultipartBody).toHaveLength(0);

        yield* testHttp.reset;
        yield* venice.webSearch(
          new VeniceAIRequestOptions({
            body: {
              model: "venice-uncensored-1-2",
              prompt: "hello",
            },
          })
        );

        const jsonCapture = yield* pipe(
          testHttp.captures,
          Effect.flatMap((captures) => captureAt(captures, 0, "expected JSON body capture"))
        );
        const body = yield* pipe(
          bodyTextFromCapture(jsonCapture, "expected JSON body text"),
          Effect.flatMap(decodeJsonString),
          Effect.flatMap(decodePromptBody)
        );

        expect(body.prompt).toBe("hello");
      })
    )
  );

  layer(
    makeVeniceAIUnitLayer(
      new VeniceAIConfigInput({ apiKey: Redacted.make("test-key"), baseUrl: "https://example.test/api/v1///" })
    )
  )((it) =>
    it.effect("normalizes custom base URLs", () =>
      Effect.gen(function* () {
        const testHttp = yield* VeniceAITestHttp;
        yield* testHttp.reset;

        const venice = yield* VeniceAI;
        yield* venice.listModels();

        const capture = yield* pipe(
          testHttp.captures,
          Effect.flatMap((captures) => captureAt(captures, 0, "expected custom base URL capture"))
        );

        expect(capture.url).toContain("https://example.test/api/v1/models");
      })
    )
  );

  layer(makeVeniceAIUnitLayer())((it) =>
    it.effect("decodes JSON, text, and binary success responses", () =>
      Effect.gen(function* () {
        const testHttp = yield* VeniceAITestHttp;
        const venice = yield* VeniceAI;

        yield* testHttp.reset;
        const json = yield* venice.listModels();

        yield* testHttp.reset;
        yield* testHttp.respondWith(() =>
          Effect.succeed(new Response("a,b\n1,2", { headers: { "content-type": "text/csv" } }))
        );
        const text = yield* venice.getBillingUsage();

        yield* testHttp.reset;
        yield* testHttp.respondWith(() =>
          Effect.succeed(new Response(new Uint8Array([1, 2, 3]), { headers: { "content-type": "image/png" } }))
        );
        const binary = yield* venice.generateImage(requestFor(VENICE_AI_OPERATION_DESCRIPTORS[2]));

        expect(json._tag).toBe("Json");
        expect(text._tag).toBe("Text");
        expect(binary._tag).toBe("Binary");
        expect(json.status).toBe(200);
        expect(json.contentType).toContain("application/json");
        if (json._tag === "Json") {
          expect(json.body).toEqual({ ok: true });
        }
        if (text._tag === "Text") {
          expect(text.text).toBe("a,b\n1,2");
          expect(text.contentType).toContain("text/csv");
        }
        if (binary._tag !== "Binary") {
          return;
        }
        expect(binary.status).toBe(200);
        expect(binary.contentType).toContain("image/png");
        expect(binary.bytes).toEqual(new Uint8Array([1, 2, 3]));
      })
    )
  );

  layer(makeVeniceAIUnitLayer())((it) =>
    it.effect("maps response status, malformed JSON, multipart, transport, and SSE failures", () =>
      Effect.gen(function* () {
        const testHttp = yield* VeniceAITestHttp;
        const venice = yield* VeniceAI;

        yield* testHttp.reset;
        yield* testHttp.respondWith(() => Effect.succeed(makeJsonResponse({ code: "INSUFFICIENT_BALANCE" }, 402)));
        const statusError = yield* venice
          .topUpX402Balance(requestFor(VENICE_AI_OPERATION_DESCRIPTORS[44]))
          .pipe(Effect.flip);

        yield* testHttp.reset;
        yield* testHttp.respondWith(() =>
          Effect.succeed(new Response("{", { headers: { "content-type": "application/json" } }))
        );
        const malformedError = yield* venice.listModels().pipe(Effect.flip);

        yield* testHttp.reset;
        const multipartError = yield* venice.createTranscription().pipe(Effect.flip);

        yield* testHttp.reset;
        yield* testHttp.respondWith((request) =>
          Effect.fail(
            new HttpClientError.HttpClientError({
              reason: new HttpClientError.TransportError({
                request,
              }),
            })
          )
        );
        const transportError = yield* venice.listModels().pipe(Effect.flip);
        const hostileProxyError = VeniceAIError.fromDescriptor(VENICE_AI_OPERATION_DESCRIPTORS[0], "transport", {
          cause: new Proxy(
            {},
            {
              get() {
                throw new Error("hostile get");
              },
              getOwnPropertyDescriptor() {
                throw new Error("hostile descriptor");
              },
              getPrototypeOf() {
                throw new Error("hostile prototype");
              },
              ownKeys() {
                throw new Error("hostile keys");
              },
            }
          ),
        });
        const throwingNameError = VeniceAIError.fromDescriptor(VENICE_AI_OPERATION_DESCRIPTORS[0], "transport", {
          cause: {
            get name(): string {
              throw new Error("name getter failed");
            },
          },
        });

        yield* testHttp.reset;
        yield* testHttp.respondWith(() =>
          Effect.succeed(new Response("data: nope\n\n", { headers: { "content-type": "text/event-stream" } }))
        );
        const sseError = yield* venice
          .streamChatCompletion(requestFor(VENICE_AI_OPERATION_DESCRIPTORS[0]))
          .pipe(Stream.runCollect, Effect.flip);

        yield* testHttp.reset;
        yield* testHttp.respondWith(() =>
          Effect.succeed(new Response('{"message":"not sse"}', { headers: { "content-type": "application/json" } }))
        );
        const nonSseError = yield* venice
          .streamChatCompletion(requestFor(VENICE_AI_OPERATION_DESCRIPTORS[0]))
          .pipe(Stream.runCollect, Effect.flip);

        yield* testHttp.reset;
        yield* testHttp.respondWith(() =>
          Effect.succeed(
            new Response('data: {"delta":"hello"}\n\n', {
              headers: { "content-type": "application/json; note=text/event-stream" },
            })
          )
        );
        const spoofedContentTypeError = yield* venice
          .streamChatCompletion(requestFor(VENICE_AI_OPERATION_DESCRIPTORS[0]))
          .pipe(Stream.runCollect, Effect.flip);

        yield* testHttp.reset;
        yield* testHttp.respondWith(() =>
          Effect.succeed(new Response("not-json", { headers: { "content-type": "application/json" } }))
        );
        const jsonError = yield* venice.listModels().pipe(Effect.flip);

        expect(statusError).toBeInstanceOf(VeniceAIError);
        expect(statusError.reason).toBe("response status");
        expect(statusError.status).toBe(402);
        expect(statusError.operation).toBe("topUpX402Balance");
        expect(statusError.method).toBe("POST");
        expect(statusError.path).toBe("/x402/top-up");
        expect(malformedError.reason).toBe("response decoding");
        expect(malformedError.cause).toBe("HttpClientError:DecodeError");
        expect(multipartError.reason).toBe("multipart encoding");
        expect(transportError.reason).toBe("transport");
        expect(transportError.cause).toBe("HttpClientError:TransportError");
        expect(hostileProxyError.reason).toBe("transport");
        expect(hostileProxyError.cause).toBeUndefined();
        expect(throwingNameError.reason).toBe("transport");
        expect(throwingNameError.cause).toBeUndefined();
        expect(sseError.reason).toBe("sse decoding");
        expect(sseError.cause).toBeDefined();
        expect(nonSseError.reason).toBe("sse decoding");
        expect(nonSseError.status).toBe(200);
        expect(spoofedContentTypeError.reason).toBe("sse decoding");
        expect(spoofedContentTypeError.status).toBe(200);
        expect(jsonError.reason).toBe("response decoding");
        expect(jsonError.cause).toBe("HttpClientError:DecodeError");
      })
    )
  );

  layer(makeVeniceAIUnitLayer())((it) =>
    it.effect("maps language-model transport failures to retryable network errors", () =>
      Effect.gen(function* () {
        const testHttp = yield* VeniceAITestHttp;
        yield* testHttp.reset;
        yield* testHttp.respondWith((request) =>
          Effect.fail(
            new HttpClientError.HttpClientError({
              reason: new HttpClientError.TransportError({
                request,
              }),
            })
          )
        );

        const languageModel = yield* VeniceAiLanguageModel.make({ model: "venice-test-model" });
        const error = yield* languageModel.generateText({ prompt: "hello" }).pipe(Effect.flip);

        expect(error.reason._tag).toBe("NetworkError");
        expect(error.reason.isRetryable).toBe(true);
        if (error.reason._tag !== "NetworkError") {
          return;
        }
        expect(error.reason.request.headers).toEqual({});
        expect(error.reason.description ?? "").not.toContain("test-key");
        expect(error.reason.description ?? "").not.toContain("hello");
      })
    )
  );

  layer(makeVeniceAIUnitLayer())((it) =>
    it.effect("parses SSE streams for chat completions and responses", () =>
      Effect.gen(function* () {
        const testHttp = yield* VeniceAITestHttp;
        yield* testHttp.reset;
        yield* testHttp.respondWith(() =>
          Effect.succeed(
            new Response('data: {"delta":"hello"}\n\ndata: [DONE]\n\n', {
              headers: { "content-type": "text/event-stream" },
            })
          )
        );

        const venice = yield* VeniceAI;
        const chatEvents = yield* venice
          .streamChatCompletion(requestFor(VENICE_AI_OPERATION_DESCRIPTORS[0]))
          .pipe(Stream.runCollect);
        const responseEvents = yield* venice
          .streamResponse(requestFor(VENICE_AI_OPERATION_DESCRIPTORS[1]))
          .pipe(Stream.runCollect);
        const captures = yield* testHttp.captures;

        const chatEventArray = A.fromIterable(chatEvents);
        const responseEventArray = A.fromIterable(responseEvents);

        expect(chatEventArray).toHaveLength(2);
        expect(responseEventArray).toHaveLength(2);
        expect(chatEventArray[0]?.data).toEqual({ delta: "hello" });
        expect(chatEventArray[0]?.done).toBe(false);
        expect(chatEventArray[0]?.index).toBe(0);
        expect(chatEventArray[1]?.done).toBe(true);
        expect(chatEventArray[1]?.index).toBe(1);
        expect(responseEventArray[0]?.data).toEqual({ delta: "hello" });
        expect(captures[0]?.headers.accept).toBe("text/event-stream");
        expect(captures[0]?.bodyText).toContain('"stream":true');
        expect(captures[1]?.headers.accept).toBe("text/event-stream");
        expect(captures[1]?.bodyText).toContain('"stream":true');
      })
    )
  );

  layer(makeVeniceAIUnitLayer())((it) =>
    it.effect("emits SSE events before the response body closes", () =>
      Effect.gen(function* () {
        const testHttp = yield* VeniceAITestHttp;
        yield* testHttp.reset;
        yield* testHttp.respondWith(() =>
          Effect.succeed(
            new Response(
              new ReadableStream<Uint8Array>({
                start(controller) {
                  controller.enqueue(new TextEncoder().encode('data: {"delta":"first"}\n\n'));
                },
              }),
              {
                headers: { "content-type": "text/event-stream" },
              }
            )
          )
        );

        const venice = yield* VeniceAI;
        const first = yield* venice
          .streamChatCompletion(requestFor(VENICE_AI_OPERATION_DESCRIPTORS[0]))
          .pipe(Stream.take(1), Stream.runCollect, Effect.timeoutOption("1 second"));

        expect(O.isSome(first)).toBe(true);
        if (O.isNone(first)) {
          return;
        }
        expect(A.fromIterable(first.value)[0]?.data).toEqual({ delta: "first" });
      })
    )
  );

  layer(makeVeniceAIChatUnitLayer())((it) =>
    it.effect("delegates the compatibility chat service through VeniceAI", () =>
      Effect.gen(function* () {
        const testHttp = yield* VeniceAITestHttp;
        const chat = yield* VeniceAiChat;

        yield* testHttp.reset;
        yield* testHttp.respondWith(() =>
          Effect.succeed(
            makeJsonResponse({
              choices: [
                {
                  message: {
                    content: "hello from Venice",
                  },
                },
              ],
            })
          )
        );

        const text = yield* chat.chat("hello");
        expect(text).toBe("hello from Venice");

        yield* testHttp.reset;
        yield* testHttp.respondWith(() =>
          Effect.succeed(new Response(new Uint8Array([1, 2, 3]), { headers: { "content-type": "image/png" } }))
        );
        const nonJson = yield* chat.chat("hello").pipe(Effect.flip);

        yield* testHttp.reset;
        yield* testHttp.respondWith(() =>
          Effect.succeed(
            makeJsonResponse({
              choices: [],
            })
          )
        );
        const emptyChoices = yield* chat.chat("hello").pipe(Effect.flip);

        yield* testHttp.reset;
        yield* testHttp.respondWith(() =>
          Effect.succeed(
            makeJsonResponse({
              choices: [
                {
                  message: {
                    content: null,
                  },
                },
              ],
            })
          )
        );
        const nullContent = yield* chat.chat("hello").pipe(Effect.flip);

        yield* testHttp.reset;
        yield* testHttp.respondWith(() => Effect.succeed(makeJsonResponse({ choices: [{ message: {} }] })));
        const malformed = yield* chat.chat("hello").pipe(Effect.flip);

        expect(nonJson.reason).toBe("response decoding");
        expect(emptyChoices.reason).toBe("response decoding");
        expect(nullContent.reason).toBe("response decoding");
        expect(malformed.reason).toBe("response decoding");
      })
    )
  );
});
