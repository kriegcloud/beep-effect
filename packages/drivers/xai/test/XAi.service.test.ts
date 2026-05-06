import { inspect } from "node:util";
import { encodeJsonString } from "@beep/schema/Json";
import {
  XAI_API_URL,
  XAI_ENDPOINT_COUNT,
  XAI_ENDPOINT_METHOD_NAMES,
  XAI_ENDPOINTS,
  XAI_MANAGEMENT_API_URL,
  XAi,
  XAiConfigInput,
  XAiEndpoint,
  type XAiEndpointDescriptor,
  XAiError,
  XAiLanguageModel,
  XAiRequestOptions,
} from "@beep/xai";
import { describe, expect, layer } from "@effect/vitest";
import { Context, Effect, Layer, pipe, Redacted, Ref, Stream } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientError from "effect/unstable/http/HttpClientError";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";

type CapturedRequest = {
  readonly bodyTag: string;
  readonly contentType: string | undefined;
  readonly headers: Readonly<Record<string, string>>;
  readonly method: string;
  readonly url: string;
};

type XAiTestRespond = (
  request: HttpClientRequest.HttpClientRequest
) => Effect.Effect<Response, HttpClientError.HttpClientError>;

type XAiTestHttpShape = {
  readonly captures: Effect.Effect<ReadonlyArray<CapturedRequest>>;
  readonly handle: XAiTestRespond;
  readonly reset: Effect.Effect<void>;
  readonly respondWith: (respond: XAiTestRespond) => Effect.Effect<void>;
};

class XAiTestHttp extends Context.Service<XAiTestHttp, XAiTestHttpShape>()(
  "@beep/xai/test/XAi.service.test/XAiTestHttp"
) {}

const sortStrings = A.sort(Order.String);
const encodeJson = encodeJsonString;

const endpointIds = () => sortStrings(A.map(XAI_ENDPOINTS, (descriptor) => descriptor.id));

const endpointMethodNames = () => sortStrings(A.map(XAI_ENDPOINTS, (descriptor) => descriptor.methodName));

const uniqueStrings = (values: ReadonlyArray<string>): ReadonlyArray<string> => pipe(values, sortStrings, A.dedupe);

const httpDescriptors = (): ReadonlyArray<XAiEndpointDescriptor> =>
  pipe(
    XAI_ENDPOINTS,
    A.filter((descriptor) => descriptor.response !== "websocket")
  );

const realtimeVoiceDescriptor = (): Effect.Effect<XAiEndpointDescriptor, XAiError> =>
  pipe(
    XAI_ENDPOINTS,
    A.findFirst((descriptor) => descriptor.methodName === "connectRealtimeVoice"),
    O.match({
      onNone: () => Effect.fail(new XAiError({ reason: "request encoding" })),
      onSome: Effect.succeed,
    })
  );

const makeJsonResponse = (body: unknown, status = 200) =>
  Response.json(body, {
    headers: {
      "content-type": "application/json",
    },
    status,
  });

const defaultRespond: XAiTestRespond = () => Effect.succeed(makeJsonResponse({ ok: true }));

const XAiTestHttpLayer = Layer.effect(
  XAiTestHttp,
  Effect.gen(function* () {
    const capturesRef = yield* Ref.make<ReadonlyArray<CapturedRequest>>([]);
    const respondRef = yield* Ref.make<XAiTestRespond>(defaultRespond);

    return XAiTestHttp.of({
      captures: Ref.get(capturesRef),
      handle: Effect.fn("XAiTestHttp.handle")(function* (request) {
        const url = pipe(
          HttpClientRequest.toUrl(request),
          O.map((value) => value.toString()),
          O.getOrElse(() => request.url)
        );

        yield* Ref.update(
          capturesRef,
          A.append({
            bodyTag: request.body._tag,
            contentType: request.body.contentType,
            headers: request.headers,
            method: request.method,
            url,
          })
        );

        const respond = yield* Ref.get(respondRef);
        return yield* respond(request);
      }),
      reset: Effect.all([Ref.set(capturesRef, []), Ref.set(respondRef, defaultRespond)], { discard: true }),
      respondWith: Effect.fn("XAiTestHttp.respondWith")(function* (respond) {
        yield* Ref.set(respondRef, respond);
      }),
    });
  })
);

const TestHttpClientLayer = Layer.effect(
  HttpClient.HttpClient,
  Effect.gen(function* () {
    const testHttp = yield* XAiTestHttp;

    return HttpClient.make((request) =>
      Effect.gen(function* () {
        const response = yield* testHttp.handle(request);
        return HttpClientResponse.fromWeb(request, response);
      })
    );
  })
);

const makeXAiUnitLayer = () =>
  XAi.makeLayer(
    new XAiConfigInput({
      apiKey: Redacted.make("api-test-key"),
      apiUrl: XAI_API_URL,
      managementApiKey: Redacted.make("management-test-key"),
      managementApiUrl: XAI_MANAGEMENT_API_URL,
    })
  ).pipe(Layer.provide(TestHttpClientLayer), Layer.provideMerge(XAiTestHttpLayer));

const makeInvalidWebSocketUrlLayer = () =>
  XAi.makeLayer(
    new XAiConfigInput({
      apiKey: Redacted.make("api-test-key"),
      websocketUrl: "not a url",
    })
  ).pipe(Layer.provide(TestHttpClientLayer), Layer.provideMerge(XAiTestHttpLayer));

const pathParamsFor = (path: string): Readonly<Record<string, string>> =>
  R.getSomes({
    apiKeyId: Str.includes("{apiKeyId}")(path) ? O.some("api-key-id") : O.none(),
    api_key_id: Str.includes("{api_key_id}")(path) ? O.some("api-key-id") : O.none(),
    batch_id: Str.includes("{batch_id}")(path) ? O.some("batch-id") : O.none(),
    collection_id: Str.includes("{collection_id}")(path) ? O.some("collection-id") : O.none(),
    file_id: Str.includes("{file_id}")(path) ? O.some("file-id") : O.none(),
    model_id: Str.includes("{model_id}")(path) ? O.some("model-id") : O.none(),
    request_id: Str.includes("{request_id}")(path) ? O.some("request-id") : O.none(),
    response_id: Str.includes("{response_id}")(path) ? O.some("response-id") : O.none(),
    teamId: Str.includes("{teamId}")(path) ? O.some("team-id") : O.none(),
    team_id: Str.includes("{team_id}")(path) ? O.some("team-id") : O.none(),
    voice_id: Str.includes("{voice_id}")(path) ? O.some("voice-id") : O.none(),
  });

const concretePathFor = (path: string): string =>
  pipe(
    path,
    Str.replace("{apiKeyId}", "api-key-id"),
    Str.replace("{api_key_id}", "api-key-id"),
    Str.replace("{batch_id}", "batch-id"),
    Str.replace("{collection_id}", "collection-id"),
    Str.replace("{file_id}", "file-id"),
    Str.replace("{model_id}", "model-id"),
    Str.replace("{request_id}", "request-id"),
    Str.replace("{response_id}", "response-id"),
    Str.replace("{teamId}", "team-id"),
    Str.replace("{team_id}", "team-id"),
    Str.replace("{voice_id}", "voice-id")
  );

const requestFor = (descriptor: XAiEndpointDescriptor): XAiRequestOptions => {
  const formData = new FormData();
  formData.append("file", new File(["hello"], "hello.txt", { type: "text/plain" }));

  return new XAiRequestOptions({
    ...R.getSomes({
      body: descriptor.body === "json" ? O.some({ model: "grok-4", prompt: "hello" }) : O.none(),
      bytes: descriptor.body === "binary" ? O.some(new Uint8Array([1, 2, 3])) : O.none(),
      contentType: descriptor.body === "binary" ? O.some("application/octet-stream") : O.none(),
      formData: descriptor.body === "multipart" ? O.some(formData) : O.none(),
    }),
    path: pathParamsFor(descriptor.path),
    query: {
      limit: 1,
    },
  });
};

describe("@beep/xai", () => {
  layer(makeXAiUnitLayer())((it) =>
    it.effect("keeps endpoint manifest and service surface aligned", () =>
      Effect.gen(function* () {
        expect(XAI_ENDPOINTS).toHaveLength(XAI_ENDPOINT_COUNT);
        expect(XAI_ENDPOINT_METHOD_NAMES).toHaveLength(XAI_ENDPOINT_COUNT);
        expect(uniqueStrings(endpointIds())).toHaveLength(XAI_ENDPOINT_COUNT);
        expect(uniqueStrings(endpointMethodNames())).toHaveLength(XAI_ENDPOINT_COUNT);
        expect(endpointMethodNames()).toEqual(sortStrings(XAI_ENDPOINT_METHOD_NAMES));

        for (const descriptor of XAI_ENDPOINTS) {
          expect(S.is(XAiEndpoint)(descriptor)).toBe(true);
        }

        const xai = yield* XAi;
        const serviceEndpointKeys = pipe(
          R.keys(xai),
          A.filter((key) => !Str.startsWith("stream")(key)),
          sortStrings
        );

        expect(serviceEndpointKeys).toEqual(endpointMethodNames());
        expect(R.keys(xai)).toContain("streamAnthropicMessage");
        expect(R.keys(xai)).toContain("streamChatCompletion");
        expect(R.keys(xai)).toContain("streamLegacyCompletion");
        expect(R.keys(xai)).toContain("streamResponse");
      })
    )
  );

  layer(makeXAiUnitLayer())((it) =>
    it.effect("sends every HTTP endpoint with the expected method, path, auth, query, and body mode", () =>
      Effect.gen(function* () {
        const testHttp = yield* XAiTestHttp;
        yield* testHttp.reset;

        const xai = yield* XAi;
        const descriptors = httpDescriptors();

        yield* Effect.forEach(descriptors, (descriptor) => xai[descriptor.methodName](requestFor(descriptor)), {
          concurrency: 1,
          discard: true,
        });

        const captures = yield* testHttp.captures;
        expect(captures).toHaveLength(descriptors.length);

        for (const [index, descriptor] of descriptors.entries()) {
          const capture = captures[index];
          const expectedBase = descriptor.base === "management" ? XAI_MANAGEMENT_API_URL : XAI_API_URL;
          const expectedToken =
            descriptor.auth === "management-key" ? "Bearer management-test-key" : "Bearer api-test-key";

          expect(capture?.method).toBe(descriptor.method);
          expect(capture?.headers.authorization).toBe(expectedToken);
          expect(capture?.url).toContain(`${expectedBase}${concretePathFor(descriptor.path)}`);
          expect(capture?.url).toContain("limit=1");

          if (descriptor.body === "multipart") {
            expect(capture?.bodyTag).toBe("FormData");
          } else if (descriptor.body === "binary") {
            expect(capture?.bodyTag).not.toBe("Empty");
          } else if (descriptor.body === "json") {
            expect(capture?.contentType).toContain("application/json");
          } else {
            expect(capture?.bodyTag).toBe("Empty");
          }
        }
      })
    )
  );

  layer(makeXAiUnitLayer())((it) =>
    it.effect("maps status, malformed JSON, multipart, and SSE failures", () =>
      Effect.gen(function* () {
        const testHttp = yield* XAiTestHttp;
        const xai = yield* XAi;

        yield* testHttp.reset;
        yield* testHttp.respondWith(() => Effect.succeed(makeJsonResponse({ error: "bad" }, 429)));
        const statusError = yield* xai.listModels().pipe(Effect.flip);

        yield* testHttp.reset;
        yield* testHttp.respondWith(() =>
          Effect.succeed(new Response("{", { headers: { "content-type": "application/json" } }))
        );
        const malformedError = yield* xai.listModels().pipe(Effect.flip);

        yield* testHttp.reset;
        const multipartError = yield* xai.uploadFile().pipe(Effect.flip);

        yield* testHttp.reset;
        yield* testHttp.respondWith(() =>
          Effect.succeed(new Response("data: nope\n\n", { headers: { "content-type": "text/event-stream" } }))
        );
        const sseError = yield* xai
          .streamChatCompletion(new XAiRequestOptions({ body: { messages: [], model: "grok-4" } }))
          .pipe(Stream.runCollect, Effect.flip);

        yield* testHttp.reset;
        yield* testHttp.respondWith(() =>
          Effect.succeed(new Response("ok", { headers: { "content-type": "text/plain" } }))
        );
        const nonSseError = yield* xai
          .streamChatCompletion(new XAiRequestOptions({ body: { messages: [], model: "grok-4" } }))
          .pipe(Stream.runCollect, Effect.flip);

        yield* testHttp.reset;
        yield* testHttp.respondWith(() =>
          Effect.succeed(
            new Response('data: {"delta":"hello"}\n\n', {
              headers: { "content-type": "application/json; note=text/event-stream" },
            })
          )
        );
        const spoofedContentTypeError = yield* xai
          .streamChatCompletion(new XAiRequestOptions({ body: { messages: [], model: "grok-4" } }))
          .pipe(Stream.runCollect, Effect.flip);

        expect(statusError).toBeInstanceOf(XAiError);
        expect(statusError.reason).toBe("response status");
        expect(statusError.status).toBe(429);
        expect(malformedError.reason).toBe("response decoding");
        expect(multipartError.reason).toBe("multipart encoding");
        expect(sseError.reason).toBe("sse decoding");
        expect(nonSseError.reason).toBe("sse decoding");
        expect(spoofedContentTypeError.reason).toBe("sse decoding");
      })
    )
  );

  layer(makeXAiUnitLayer())((it) =>
    it.effect("redacts xAI transport and WebSocket failure causes before rendering", () =>
      Effect.gen(function* () {
        const testHttp = yield* XAiTestHttp;
        const xai = yield* XAi;

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
        const transportError = yield* xai.listModels().pipe(Effect.flip);
        const websocketDescriptor = yield* realtimeVoiceDescriptor();
        const websocketError = XAiError.fromDescriptor(websocketDescriptor, "websocket", {
          cause: new Error("Bearer websocket-secret"),
        });
        const hostileProxyError = XAiError.fromDescriptor(websocketDescriptor, "websocket", {
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
        const throwingNameError = XAiError.fromDescriptor(websocketDescriptor, "websocket", {
          cause: {
            get name(): string {
              throw new Error("name getter failed");
            },
          },
        });
        const transportJson = yield* encodeJson(transportError);
        const websocketJson = yield* encodeJson(websocketError);
        const rendered = [
          transportJson,
          inspect(transportError, { depth: 8 }),
          websocketJson,
          inspect(websocketError, { depth: 8 }),
        ].join("\n");

        expect(transportError.reason).toBe("transport");
        expect(transportError.cause).toBe("HttpClientError:TransportError");
        expect(websocketError.reason).toBe("websocket");
        expect(websocketError.cause).toBe("Error");
        expect(hostileProxyError.reason).toBe("websocket");
        expect(hostileProxyError.cause).toBeUndefined();
        expect(throwingNameError.reason).toBe("websocket");
        expect(throwingNameError.cause).toBeUndefined();
        expect(rendered).not.toContain("Bearer");
        expect(rendered).not.toContain("api-test-key");
        expect(rendered).not.toContain("websocket-secret");
      })
    )
  );

  layer(makeXAiUnitLayer())((it) =>
    it.effect("maps language-model transport failures to retryable network errors", () =>
      Effect.gen(function* () {
        const testHttp = yield* XAiTestHttp;
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

        const languageModel = yield* XAiLanguageModel.make({ model: "grok-4" });
        const error = yield* languageModel.generateText({ prompt: "hello" }).pipe(Effect.flip);

        expect(error.reason._tag).toBe("NetworkError");
        expect(error.reason.isRetryable).toBe(true);
        if (error.reason._tag !== "NetworkError") {
          return;
        }
        expect(error.reason.request.headers).toEqual({});
        expect(error.reason.description ?? "").not.toContain("api-test-key");
        expect(error.reason.description ?? "").not.toContain("hello");
      })
    )
  );

  layer(makeXAiUnitLayer())((it) =>
    it.effect("rejects request payloads that do not match the endpoint body mode", () =>
      Effect.gen(function* () {
        const xai = yield* XAi;

        const noneBodyError = yield* xai.listModels(new XAiRequestOptions({ body: {} })).pipe(Effect.flip);
        const jsonBodyError = yield* xai
          .createChatCompletion(new XAiRequestOptions({ bytes: new Uint8Array([1, 2, 3]) }))
          .pipe(Effect.flip);
        const binaryBodyError = yield* xai.uploadFileChunks(new XAiRequestOptions({ body: {} })).pipe(Effect.flip);
        const multipartBodyError = yield* xai.uploadFile(new XAiRequestOptions({ body: {} })).pipe(Effect.flip);
        const websocketBodyError = yield* xai
          .connectRealtimeVoice(new XAiRequestOptions({ body: {} }))
          .pipe(Effect.flip);

        expect(noneBodyError.reason).toBe("request encoding");
        expect(jsonBodyError.reason).toBe("request encoding");
        expect(binaryBodyError.reason).toBe("request encoding");
        expect(multipartBodyError.reason).toBe("request encoding");
        expect(websocketBodyError.reason).toBe("request encoding");
      })
    )
  );

  layer(makeInvalidWebSocketUrlLayer())((it) =>
    it.effect("maps invalid WebSocket URL configuration into a typed driver error", () =>
      Effect.gen(function* () {
        const xai = yield* XAi;
        const invalidUrlError = yield* xai.connectRealtimeVoice().pipe(Effect.flip);

        expect(invalidUrlError).toBeInstanceOf(XAiError);
        expect(invalidUrlError.reason).toBe("websocket");
      })
    )
  );

  layer(makeXAiUnitLayer())((it) =>
    it.effect("parses SSE streams for chat, responses, and legacy-compatible endpoints", () =>
      Effect.gen(function* () {
        const testHttp = yield* XAiTestHttp;
        const xai = yield* XAi;
        yield* testHttp.reset;
        yield* testHttp.respondWith(() =>
          Effect.succeed(
            new Response('data: {"delta":"hello"}\n\ndata: [DONE]\n\n', {
              headers: { "content-type": "text/event-stream" },
            })
          )
        );

        const chatEvents = yield* xai
          .streamChatCompletion(new XAiRequestOptions({ body: { messages: [], model: "grok-4" } }))
          .pipe(Stream.runCollect);
        const responseEvents = yield* xai
          .streamResponse(new XAiRequestOptions({ body: { input: "hello", model: "grok-4" } }))
          .pipe(Stream.runCollect);
        const legacyEvents = yield* xai
          .streamLegacyCompletion(new XAiRequestOptions({ body: { model: "grok-2", prompt: "hello" } }))
          .pipe(Stream.runCollect);
        const anthropicEvents = yield* xai
          .streamAnthropicMessage(new XAiRequestOptions({ body: { max_tokens: 8, messages: [], model: "grok-4" } }))
          .pipe(Stream.runCollect);

        expect(A.fromIterable(chatEvents)).toHaveLength(2);
        expect(A.fromIterable(responseEvents)).toHaveLength(2);
        expect(A.fromIterable(legacyEvents)).toHaveLength(2);
        expect(A.fromIterable(anthropicEvents)).toHaveLength(2);
      })
    )
  );
});
