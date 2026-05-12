/**
 * Effect service for Runpod REST API v1 operations.
 *
 * @packageDocumentation
 * @since 0.1.0
 */

import { $RunpodId } from "@beep/identity";
import { Config, Context, Effect, Layer, Match, pipe, type Redacted, Result } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { FetchHttpClient } from "effect/unstable/http";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import type * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import * as G from "./_generated/Runpod.generated.ts";
import { RUNPOD_API_URL, RunpodConfigInput } from "./Runpod.config.ts";
import { RunpodError } from "./Runpod.errors.ts";

const $I = $RunpodId.create("Runpod.service");

/**
 * Scalar query values accepted by Runpod request models and raw requests.
 *
 * @category models
 * @since 0.1.0
 */
export const RunpodQueryScalar = S.Union([S.Boolean, S.Number, S.String]).pipe(
  $I.annoteSchema("RunpodQueryScalar", {
    description: "Scalar query values accepted by Runpod request models and raw requests.",
  })
);

/**
 * Type for {@link RunpodQueryScalar}.
 *
 * @category models
 * @since 0.1.0
 */
export type RunpodQueryScalar = typeof RunpodQueryScalar.Type;

const RunpodQueryScalarArray = S.Array(RunpodQueryScalar);
const isRunpodQueryScalarArray = S.is(RunpodQueryScalarArray);

/**
 * Query value accepted by the raw Runpod request escape hatch.
 *
 * @category models
 * @since 0.1.0
 */
export const RunpodQueryValue = S.Union([RunpodQueryScalar, RunpodQueryScalarArray]).pipe(
  $I.annoteSchema("RunpodQueryValue", {
    description: "Query value accepted by the raw Runpod request escape hatch.",
  })
);

/**
 * Type for {@link RunpodQueryValue}.
 *
 * @category models
 * @since 0.1.0
 */
export type RunpodQueryValue = typeof RunpodQueryValue.Type;

/**
 * Raw Runpod HTTP request escape hatch for endpoints ahead of the checked-in OpenAPI document.
 *
 * @category models
 * @since 0.1.0
 */
export class RunpodRawRequest extends S.Class<RunpodRawRequest>($I`RunpodRawRequest`)(
  {
    authenticated: S.optionalKey(S.Boolean),
    body: S.optionalKey(S.Unknown),
    headers: S.optionalKey(S.Record(S.String, S.String)),
    method: G.RunpodHttpMethod,
    path: S.String,
    query: S.optionalKey(S.Record(S.String, RunpodQueryValue)),
  },
  $I.annote("RunpodRawRequest", {
    description: "Raw Runpod HTTP request escape hatch for endpoints ahead of the checked-in OpenAPI document.",
  })
) {}

/**
 * Raw Runpod HTTP response returned by {@link Runpod.raw}.
 *
 * @category models
 * @since 0.1.0
 */
export class RunpodRawResponse extends S.Class<RunpodRawResponse>($I`RunpodRawResponse`)(
  {
    body: S.optionalKey(S.Unknown),
    headers: S.Record(S.String, S.String),
    status: S.Number,
    text: S.optionalKey(S.String),
  },
  $I.annote("RunpodRawResponse", {
    description: "Raw Runpod HTTP response returned by the raw escape hatch.",
  })
) {}

/**
 * Public service shape for generated Runpod operations plus the raw request escape hatch.
 *
 * @category services
 * @since 0.1.0
 */
export type RunpodShape = G.RunpodOperationsShape<RunpodError> & {
  readonly raw: (request: RunpodRawRequest) => Effect.Effect<RunpodRawResponse, RunpodError>;
};

type ResolvedRunpodConfig = {
  readonly apiKey: O.Option<Redacted.Redacted<string>>;
  readonly apiUrl: string;
  readonly headers: Readonly<Record<string, string>>;
};

type UrlParams = Readonly<Record<string, string | ReadonlyArray<string>>>;

type JsonOperationSpec<Request, Response> = {
  readonly descriptor: G.RunpodOperationDescriptor;
  readonly request: S.Decoder<Request>;
  readonly response: S.Decoder<Response>;
};

type VoidOperationSpec<Request> = {
  readonly descriptor: G.RunpodOperationDescriptor;
  readonly request: S.Decoder<Request>;
};

const normalizeBaseUrl = Str.replace(/\/+$/, "");

const resolveConfig = (config: RunpodConfigInput): ResolvedRunpodConfig => ({
  apiKey: O.fromUndefinedOr(config.apiKey),
  apiUrl: normalizeBaseUrl(config.apiUrl ?? RUNPOD_API_URL),
  headers: config.headers ?? {},
});

const decodeQueryValueOption = S.decodeUnknownOption(RunpodQueryValue);
const isRunpodError = S.is(RunpodError);

const queryScalarToString = (value: RunpodQueryScalar): string =>
  Match.type<RunpodQueryScalar>().pipe(
    Match.when(P.isBoolean, (boolean) => (boolean ? "true" : "false")),
    Match.when(P.isNumber, (number) => `${number}`),
    Match.when(P.isString, (text) => text),
    Match.exhaustive
  )(value);

const queryValueToStrings = (value: RunpodQueryValue): ReadonlyArray<string> => {
  if (isRunpodQueryScalarArray(value)) {
    return pipe(value, A.map(queryScalarToString));
  }

  return A.make(queryScalarToString(value));
};

const readProperty = (value: unknown, key: PropertyKey): O.Option<unknown> => {
  if (!P.isObject(value)) {
    return O.none();
  }

  return O.fromUndefinedOr(
    Result.getOrElse(
      Result.try(() => Reflect.get(value, key)),
      () => undefined
    )
  );
};

const requireStringField = (
  descriptor: G.RunpodOperationDescriptor,
  request: unknown,
  key: string
): Effect.Effect<string, RunpodError> =>
  pipe(
    readProperty(request, key),
    O.filter(P.isString),
    O.match({
      onNone: () => Effect.fail(RunpodError.fromDescriptor(descriptor, "request encoding")),
      onSome: Effect.succeed,
    })
  );

const applyPathParams = Effect.fn("Runpod.applyPathParams")(function* (
  descriptor: G.RunpodOperationDescriptor,
  request: unknown
) {
  const params = yield* Effect.forEach(
    descriptor.pathParams,
    (param) =>
      pipe(
        requireStringField(descriptor, request, param),
        Effect.map((value) => [param, value] as const)
      ),
    { concurrency: 1 }
  );

  const path = pipe(
    params,
    A.reduce(descriptor.path, (currentPath, [key, value]) =>
      pipe(currentPath, Str.replace(`{${key}}`, encodeURIComponent(value)))
    )
  );

  if (Str.includes("{")(path)) {
    return yield* RunpodError.fromDescriptor(descriptor, "request encoding");
  }

  return path;
});

const decodeRequest = <Request>(
  descriptor: G.RunpodOperationDescriptor,
  requestSchema: S.Decoder<Request>,
  request: Request
): Effect.Effect<Request, RunpodError> =>
  pipe(
    S.decodeUnknownOption(requestSchema)(request),
    O.match({
      onNone: () => Effect.fail(RunpodError.fromDescriptor(descriptor, "request encoding")),
      onSome: Effect.succeed,
    })
  );

const queryEntry = (request: unknown, key: string): O.Option<readonly [string, string | ReadonlyArray<string>]> =>
  pipe(
    readProperty(request, key),
    O.flatMap(decodeQueryValueOption),
    O.map(queryValueToStrings),
    O.filter(A.isReadonlyArrayNonEmpty),
    O.map((values) => [key, A.length(values) === 1 ? values[0] : values] as const)
  );

const requestQuery = (descriptor: G.RunpodOperationDescriptor, request: unknown): UrlParams =>
  pipe(
    descriptor.queryParams,
    A.map((key) => queryEntry(request, key)),
    A.getSomes,
    R.fromEntries
  );

const selectToken = (
  config: ResolvedRunpodConfig,
  descriptor: G.RunpodOperationDescriptor
): Effect.Effect<O.Option<Redacted.Redacted<string>>, RunpodError> => {
  if (!descriptor.authenticated) {
    return Effect.succeed(O.none());
  }

  return pipe(
    config.apiKey,
    O.match({
      onNone: () => Effect.fail(RunpodError.fromDescriptor(descriptor, "config")),
      onSome: (token) => Effect.succeed(O.some(token)),
    })
  );
};

const defaultAcceptHeader = (descriptor: G.RunpodOperationDescriptor): string => {
  if (descriptor.responseBody === "text") {
    return "text/html";
  }

  return descriptor.responseBody === "json" ? "application/json" : "*/*";
};

const addHeaders = (
  request: HttpClientRequest.HttpClientRequest,
  config: ResolvedRunpodConfig,
  descriptor: G.RunpodOperationDescriptor,
  token: O.Option<Redacted.Redacted<string>>,
  headers: Readonly<Record<string, string>> = {}
): HttpClientRequest.HttpClientRequest =>
  pipe(
    request,
    HttpClientRequest.accept(defaultAcceptHeader(descriptor)),
    HttpClientRequest.setHeaders(config.headers),
    HttpClientRequest.setHeaders(headers),
    (currentRequest) =>
      pipe(
        token,
        O.match({
          onNone: () => currentRequest,
          onSome: (value) => pipe(currentRequest, HttpClientRequest.bearerToken(value)),
        })
      )
  );

const addJsonBody = (
  descriptor: G.RunpodOperationDescriptor,
  request: HttpClientRequest.HttpClientRequest,
  decodedRequest: unknown
): Effect.Effect<HttpClientRequest.HttpClientRequest, RunpodError> => {
  if (descriptor.requestBody === "none") {
    return Effect.succeed(request);
  }

  return pipe(
    readProperty(decodedRequest, "body"),
    O.match({
      onNone: () => Effect.fail(RunpodError.fromDescriptor(descriptor, "request encoding")),
      onSome: (body) =>
        pipe(
          HttpClientRequest.bodyJson(request, body),
          Effect.mapError((cause) => RunpodError.fromDescriptor(descriptor, "request encoding", { cause }))
        ),
    })
  );
};

const buildRequest = Effect.fn("Runpod.buildRequest")(function* <Request>(
  config: ResolvedRunpodConfig,
  descriptor: G.RunpodOperationDescriptor,
  requestSchema: S.Decoder<Request>,
  request: Request
) {
  const decodedRequest = yield* decodeRequest(descriptor, requestSchema, request);
  const path = yield* applyPathParams(descriptor, decodedRequest);
  const token = yield* selectToken(config, descriptor);

  const baseRequest = addHeaders(
    HttpClientRequest.make(descriptor.method)(`${config.apiUrl}${path}`, {
      urlParams: requestQuery(descriptor, decodedRequest),
    }),
    config,
    descriptor,
    token
  );

  return yield* addJsonBody(descriptor, baseRequest, decodedRequest);
});

const executeRawResponse = Effect.fn("Runpod.executeRawResponse")(function* (
  client: HttpClient.HttpClient,
  descriptor: G.RunpodOperationDescriptor,
  request: HttpClientRequest.HttpClientRequest
) {
  return yield* client.execute(request).pipe(
    Effect.mapError((cause) => RunpodError.fromDescriptor(descriptor, "transport", { cause })),
    Effect.tapError(logDriverFailure("transport"))
  );
});

const ensureSuccessStatus = (
  descriptor: G.RunpodOperationDescriptor,
  response: HttpClientResponse.HttpClientResponse
): Effect.Effect<HttpClientResponse.HttpClientResponse, RunpodError> =>
  response.status >= 200 && response.status < 300
    ? Effect.succeed(response)
    : pipe(RunpodError.fromDescriptor(descriptor, "response status", { status: response.status }), (error) =>
        pipe(logStatusFailure(error), Effect.andThen(Effect.fail(error)))
      );

const decodeJsonResponse = <Response>(
  descriptor: G.RunpodOperationDescriptor,
  responseSchema: S.Decoder<Response>,
  response: HttpClientResponse.HttpClientResponse
): Effect.Effect<Response, RunpodError> =>
  response.json.pipe(
    Effect.mapError((cause) => RunpodError.fromDescriptor(descriptor, "response decoding", { cause })),
    Effect.flatMap((body) =>
      pipe(
        S.decodeUnknownOption(responseSchema)(body),
        O.match({
          onNone: () => Effect.fail(RunpodError.fromDescriptor(descriptor, "response decoding")),
          onSome: Effect.succeed,
        })
      )
    )
  );

const decodeTextResponse = (
  descriptor: G.RunpodOperationDescriptor,
  response: HttpClientResponse.HttpClientResponse
): Effect.Effect<string, RunpodError> =>
  response.text.pipe(
    Effect.mapError((cause) => RunpodError.fromDescriptor(descriptor, "response decoding", { cause }))
  );

const executeJsonOperation = <Request, Response>(
  client: HttpClient.HttpClient,
  config: ResolvedRunpodConfig,
  spec: JsonOperationSpec<Request, Response>,
  request: Request
): Effect.Effect<Response, RunpodError> =>
  Effect.gen(function* () {
    const httpRequest = yield* buildRequest(config, spec.descriptor, spec.request, request);
    const response = yield* executeRawResponse(client, spec.descriptor, httpRequest);
    const successfulResponse = yield* ensureSuccessStatus(spec.descriptor, response);
    return yield* decodeJsonResponse(spec.descriptor, spec.response, successfulResponse);
  }).pipe(operationSpan(spec.descriptor));

const executeTextOperation = <Request>(
  client: HttpClient.HttpClient,
  config: ResolvedRunpodConfig,
  spec: JsonOperationSpec<Request, string>,
  request: Request
): Effect.Effect<string, RunpodError> =>
  Effect.gen(function* () {
    const httpRequest = yield* buildRequest(config, spec.descriptor, spec.request, request);
    const response = yield* executeRawResponse(client, spec.descriptor, httpRequest);
    const successfulResponse = yield* ensureSuccessStatus(spec.descriptor, response);
    return yield* decodeTextResponse(spec.descriptor, successfulResponse);
  }).pipe(operationSpan(spec.descriptor));

const executeVoidOperation = <Request>(
  client: HttpClient.HttpClient,
  config: ResolvedRunpodConfig,
  spec: VoidOperationSpec<Request>,
  request: Request
): Effect.Effect<void, RunpodError> =>
  Effect.gen(function* () {
    const httpRequest = yield* buildRequest(config, spec.descriptor, spec.request, request);
    const response = yield* executeRawResponse(client, spec.descriptor, httpRequest);
    yield* ensureSuccessStatus(spec.descriptor, response);
  }).pipe(operationSpan(spec.descriptor));

const requiredJsonOperation =
  <Request, Response>(
    client: HttpClient.HttpClient,
    config: ResolvedRunpodConfig,
    spec: JsonOperationSpec<Request, Response>
  ) =>
  (request: Request): Effect.Effect<Response, RunpodError> =>
    executeJsonOperation(client, config, spec, request);

const optionalJsonOperation =
  <Request, Response>(
    client: HttpClient.HttpClient,
    config: ResolvedRunpodConfig,
    spec: JsonOperationSpec<Request, Response>,
    defaultRequest: () => Request
  ) =>
  (request?: Request): Effect.Effect<Response, RunpodError> =>
    executeJsonOperation(client, config, spec, request ?? defaultRequest());

const optionalTextOperation =
  <Request>(
    client: HttpClient.HttpClient,
    config: ResolvedRunpodConfig,
    spec: JsonOperationSpec<Request, string>,
    defaultRequest: () => Request
  ) =>
  (request?: Request): Effect.Effect<string, RunpodError> =>
    executeTextOperation(client, config, spec, request ?? defaultRequest());

const requiredVoidOperation =
  <Request>(client: HttpClient.HttpClient, config: ResolvedRunpodConfig, spec: VoidOperationSpec<Request>) =>
  (request: Request): Effect.Effect<void, RunpodError> =>
    executeVoidOperation(client, config, spec, request);

const operationSpan =
  (descriptor: G.RunpodOperationDescriptor) =>
  <A, E>(effect: Effect.Effect<A, E>): Effect.Effect<A, E> =>
    effect.pipe(
      Effect.tapError((error) => (isRunpodError(error) ? logDriverFailure("operation")(error) : Effect.void)),
      Effect.withSpan("Runpod.operation", {
        attributes: {
          method: descriptor.method,
          methodName: descriptor.methodName,
          operationId: descriptor.operationId,
          path: descriptor.path,
          provider: "runpod",
        },
      })
    );

const diagnosticsFor = (event: string, error: RunpodError): Readonly<Record<string, unknown>> => ({
  event,
  method: error.method,
  methodName: error.methodName,
  operationId: error.operationId,
  path: error.path,
  provider: "runpod",
  reason: error.reason,
  ...R.getSomes({
    cause: O.fromUndefinedOr(error.cause),
  }),
  ...R.getSomes({
    status: O.fromUndefinedOr(error.status),
  }),
});

const logDriverFailure =
  (event: string) =>
  (error: RunpodError): Effect.Effect<void> =>
    Effect.logDebug(diagnosticsFor(event, error));

const logStatusFailure = (error: RunpodError): Effect.Effect<void> =>
  Effect.logWarning(diagnosticsFor("response-status", error));

const rawUrlParams = (request: RunpodRawRequest): UrlParams =>
  pipe(
    request.query ?? {},
    R.toEntries,
    A.map(
      ([key, value]) =>
        [key, pipe(value, queryValueToStrings, (values) => (A.length(values) === 1 ? values[0] : values))] as const
    ),
    R.fromEntries
  );

const addRawBody = (
  request: HttpClientRequest.HttpClientRequest,
  rawRequest: RunpodRawRequest
): Effect.Effect<HttpClientRequest.HttpClientRequest, RunpodError> =>
  pipe(
    readProperty(rawRequest, "body"),
    O.match({
      onNone: () => Effect.succeed(request),
      onSome: (body) =>
        pipe(
          HttpClientRequest.bodyJson(request, body),
          Effect.mapError((cause) =>
            RunpodError.raw({
              cause,
              method: rawRequest.method,
              path: rawRequest.path,
              reason: "request encoding",
            })
          )
        ),
    })
  );

const rawToken = (
  config: ResolvedRunpodConfig,
  request: RunpodRawRequest
): Effect.Effect<O.Option<Redacted.Redacted<string>>, RunpodError> => {
  if (request.authenticated === false) {
    return Effect.succeed(O.none());
  }

  return pipe(
    config.apiKey,
    O.match({
      onNone: () => Effect.fail(RunpodError.raw({ method: request.method, path: request.path, reason: "config" })),
      onSome: (token) => Effect.succeed(O.some(token)),
    })
  );
};

const rawResponseBody = (
  request: RunpodRawRequest,
  response: HttpClientResponse.HttpClientResponse
): Effect.Effect<RunpodRawResponse, RunpodError> => {
  const contentType = response.headers["content-type"] ?? "";

  if (Str.includes("application/json")(contentType)) {
    return response.json.pipe(
      Effect.map(
        (body) =>
          new RunpodRawResponse({
            body,
            headers: response.headers,
            status: response.status,
          })
      ),
      Effect.mapError((cause) =>
        RunpodError.raw({
          cause,
          method: request.method,
          path: request.path,
          reason: "response decoding",
        })
      )
    );
  }

  return response.text.pipe(
    Effect.map(
      (text) =>
        new RunpodRawResponse({
          body: text,
          headers: response.headers,
          status: response.status,
          text,
        })
    ),
    Effect.mapError((cause) =>
      RunpodError.raw({
        cause,
        method: request.method,
        path: request.path,
        reason: "response decoding",
      })
    )
  );
};

const executeRawRequest = Effect.fn("Runpod.raw")(function* (
  client: HttpClient.HttpClient,
  config: ResolvedRunpodConfig,
  rawRequest: RunpodRawRequest
) {
  const decodedRequest = yield* pipe(
    S.decodeUnknownOption(RunpodRawRequest)(rawRequest),
    O.match({
      onNone: () =>
        Effect.fail(
          RunpodError.raw({
            method: rawRequest.method,
            path: rawRequest.path,
            reason: "request encoding",
          })
        ),
      onSome: Effect.succeed,
    })
  );
  const token = yield* rawToken(config, decodedRequest);
  const requestWithHeaders = pipe(
    HttpClientRequest.make(decodedRequest.method)(`${config.apiUrl}${decodedRequest.path}`, {
      urlParams: rawUrlParams(decodedRequest),
    }),
    HttpClientRequest.setHeaders(config.headers),
    HttpClientRequest.setHeaders(decodedRequest.headers ?? {}),
    (request) =>
      pipe(
        token,
        O.match({
          onNone: () => request,
          onSome: (value) => pipe(request, HttpClientRequest.bearerToken(value)),
        })
      )
  );
  const httpRequest = yield* addRawBody(requestWithHeaders, decodedRequest);
  const response = yield* client.execute(httpRequest).pipe(
    Effect.mapError((cause) =>
      RunpodError.raw({
        cause,
        method: decodedRequest.method,
        path: decodedRequest.path,
        reason: "transport",
      })
    ),
    Effect.tapError(logDriverFailure("transport"))
  );

  return yield* rawResponseBody(decodedRequest, response);
});

const makeService = (client: HttpClient.HttpClient, config: ResolvedRunpodConfig): RunpodShape => ({
  createContainerRegistryAuth: requiredJsonOperation(
    client,
    config,
    G.RUNPOD_OPERATION_SPECS.createContainerRegistryAuth
  ),
  createEndpoint: requiredJsonOperation(client, config, G.RUNPOD_OPERATION_SPECS.createEndpoint),
  createNetworkVolume: requiredJsonOperation(client, config, G.RUNPOD_OPERATION_SPECS.createNetworkVolume),
  createPod: requiredJsonOperation(client, config, G.RUNPOD_OPERATION_SPECS.createPod),
  createTemplate: requiredJsonOperation(client, config, G.RUNPOD_OPERATION_SPECS.createTemplate),
  deleteContainerRegistryAuth: requiredVoidOperation(
    client,
    config,
    G.RUNPOD_OPERATION_SPECS.deleteContainerRegistryAuth
  ),
  deleteEndpoint: requiredVoidOperation(client, config, G.RUNPOD_OPERATION_SPECS.deleteEndpoint),
  deleteNetworkVolume: requiredVoidOperation(client, config, G.RUNPOD_OPERATION_SPECS.deleteNetworkVolume),
  deletePod: requiredVoidOperation(client, config, G.RUNPOD_OPERATION_SPECS.deletePod),
  deleteTemplate: requiredVoidOperation(client, config, G.RUNPOD_OPERATION_SPECS.deleteTemplate),
  endpointBilling: optionalJsonOperation(
    client,
    config,
    G.RUNPOD_OPERATION_SPECS.endpointBilling,
    () => new G.EndpointBillingRequest({})
  ),
  getContainerRegistryAuth: requiredJsonOperation(client, config, G.RUNPOD_OPERATION_SPECS.getContainerRegistryAuth),
  getDocs: optionalTextOperation(client, config, G.RUNPOD_OPERATION_SPECS.getDocs, () => new G.GetDocsRequest({})),
  getEndpoint: requiredJsonOperation(client, config, G.RUNPOD_OPERATION_SPECS.getEndpoint),
  getNetworkVolume: requiredJsonOperation(client, config, G.RUNPOD_OPERATION_SPECS.getNetworkVolume),
  getOpenAPI: optionalJsonOperation(
    client,
    config,
    G.RUNPOD_OPERATION_SPECS.getOpenAPI,
    () => new G.GetOpenAPIRequest({})
  ),
  getPod: requiredJsonOperation(client, config, G.RUNPOD_OPERATION_SPECS.getPod),
  getTemplate: requiredJsonOperation(client, config, G.RUNPOD_OPERATION_SPECS.getTemplate),
  listContainerRegistryAuths: optionalJsonOperation(
    client,
    config,
    G.RUNPOD_OPERATION_SPECS.listContainerRegistryAuths,
    () => new G.ListContainerRegistryAuthsRequest({})
  ),
  listEndpoints: optionalJsonOperation(
    client,
    config,
    G.RUNPOD_OPERATION_SPECS.listEndpoints,
    () => new G.ListEndpointsRequest({})
  ),
  listNetworkVolumes: optionalJsonOperation(
    client,
    config,
    G.RUNPOD_OPERATION_SPECS.listNetworkVolumes,
    () => new G.ListNetworkVolumesRequest({})
  ),
  listPods: optionalJsonOperation(client, config, G.RUNPOD_OPERATION_SPECS.listPods, () => new G.ListPodsRequest({})),
  listTemplates: optionalJsonOperation(
    client,
    config,
    G.RUNPOD_OPERATION_SPECS.listTemplates,
    () => new G.ListTemplatesRequest({})
  ),
  networkVolumeBilling: optionalJsonOperation(
    client,
    config,
    G.RUNPOD_OPERATION_SPECS.networkVolumeBilling,
    () => new G.NetworkVolumeBillingRequest({})
  ),
  podBilling: optionalJsonOperation(
    client,
    config,
    G.RUNPOD_OPERATION_SPECS.podBilling,
    () => new G.PodBillingRequest({})
  ),
  raw: (request) =>
    executeRawRequest(client, config, request).pipe(
      Effect.withSpan("Runpod.raw", {
        attributes: {
          method: request.method,
          path: request.path,
          provider: "runpod",
        },
      })
    ),
  resetPod: requiredVoidOperation(client, config, G.RUNPOD_OPERATION_SPECS.resetPod),
  restartPod: requiredVoidOperation(client, config, G.RUNPOD_OPERATION_SPECS.restartPod),
  startPod: requiredVoidOperation(client, config, G.RUNPOD_OPERATION_SPECS.startPod),
  stopPod: requiredVoidOperation(client, config, G.RUNPOD_OPERATION_SPECS.stopPod),
  updateEndpoint: requiredJsonOperation(client, config, G.RUNPOD_OPERATION_SPECS.updateEndpoint),
  updateEndpointViaPost: requiredJsonOperation(client, config, G.RUNPOD_OPERATION_SPECS.updateEndpointViaPost),
  updateNetworkVolume: requiredJsonOperation(client, config, G.RUNPOD_OPERATION_SPECS.updateNetworkVolume),
  updateNetworkVolumeViaPost: requiredJsonOperation(
    client,
    config,
    G.RUNPOD_OPERATION_SPECS.updateNetworkVolumeViaPost
  ),
  updatePod: requiredJsonOperation(client, config, G.RUNPOD_OPERATION_SPECS.updatePod),
  updatePodViaPost: requiredJsonOperation(client, config, G.RUNPOD_OPERATION_SPECS.updatePodViaPost),
  updateTemplate: requiredJsonOperation(client, config, G.RUNPOD_OPERATION_SPECS.updateTemplate),
  updateTemplateViaPost: requiredJsonOperation(client, config, G.RUNPOD_OPERATION_SPECS.updateTemplateViaPost),
});

/**
 * Effect service for all documented Runpod REST API v1 operations.
 *
 * @category services
 * @since 0.1.0
 */
export class Runpod extends Context.Service<Runpod, RunpodShape>()($I`Runpod`) {
  /**
   * Build a Runpod layer from explicit runtime configuration.
   *
   * @category layers
   * @since 0.1.0
   */
  static readonly makeLayer = (config = new RunpodConfigInput({})): Layer.Layer<Runpod, never, HttpClient.HttpClient> =>
    Layer.effect(
      Runpod,
      Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;
        return Runpod.of(makeService(client, resolveConfig(config)));
      })
    );

  /**
   * Live Runpod layer backed by `RUNPOD_API_KEY` and optional `RUNPOD_API_URL`.
   *
   * @category layers
   * @since 0.1.0
   */
  static readonly layer: Layer.Layer<Runpod, RunpodError> = Layer.effect(
    Runpod,
    Effect.gen(function* () {
      const apiKey = yield* Config.redacted("RUNPOD_API_KEY").pipe(Config.option);
      const apiUrl = yield* Config.string("RUNPOD_API_URL").pipe(Config.withDefault(RUNPOD_API_URL));
      const client = yield* HttpClient.HttpClient;

      return Runpod.of(
        makeService(client, {
          apiKey,
          apiUrl: normalizeBaseUrl(apiUrl),
          headers: {},
        })
      );
    }).pipe(Effect.mapError(RunpodError.config))
  ).pipe(Layer.provide(FetchHttpClient.layer));
}
