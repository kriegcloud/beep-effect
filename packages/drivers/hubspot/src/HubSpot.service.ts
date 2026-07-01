/**
 * Effect service for HubSpot Forms API submissions.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $HubspotId } from "@beep/identity";
import { O, Str } from "@beep/utils";
import { Config, Context, Effect, Layer, pipe } from "effect";
import * as S from "effect/Schema";
import { FetchHttpClient } from "effect/unstable/http";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import { HubSpotConfigInput } from "./HubSpot.config.ts";
import { HubSpotError } from "./HubSpot.errors.ts";
import type { Redacted as RedactedType } from "effect";
import type * as HttpClientError from "effect/unstable/http/HttpClientError";
import type * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";

const $I = $HubspotId.create("HubSpot.service");

const hubSpotEmailPattern =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

const HubSpotContactEmail = S.NonEmptyString.check(
  S.isMaxLength(254, {
    message: "HubSpot contact email must be 254 characters or fewer.",
  }),
  S.isPattern(hubSpotEmailPattern, {
    message: "HubSpot contact email must be a valid email address.",
  })
).pipe(
  $I.annoteSchema("HubSpotContactEmail", {
    description: "HubSpot contact email used as the CRM upsert identity.",
  })
);

/**
 * HubSpot form field submission value.
 *
 * @example
 * ```ts
 * import { HubSpotFormField } from "@beep/hubspot"
 *
 * const field = HubSpotFormField.make({
 *   name: "email",
 *   value: "tom@example.com"
 * })
 *
 * console.log(field.name) // "email"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class HubSpotFormField extends S.Class<HubSpotFormField>($I`HubSpotFormField`)(
  {
    name: S.String,
    value: S.String,
  },
  $I.annote("HubSpotFormField", {
    description: "HubSpot form field submission value.",
  })
) {}

/**
 * HubSpot form submission context.
 *
 * @example
 * ```ts
 * import { HubSpotFormContext } from "@beep/hubspot"
 *
 * const context = HubSpotFormContext.make({
 *   pageName: "Contact",
 *   pageUri: "https://example.com/contact"
 * })
 *
 * console.log(context.pageName) // "Contact"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class HubSpotFormContext extends S.Class<HubSpotFormContext>($I`HubSpotFormContext`)(
  {
    ipAddress: S.optionalKey(S.String),
    pageName: S.optionalKey(S.String),
    pageUri: S.optionalKey(S.String),
  },
  $I.annote("HubSpotFormContext", {
    description: "HubSpot form submission context.",
  })
) {}

/**
 * HubSpot form submission request.
 *
 * @example
 * ```ts
 * import { HubSpotSubmitFormRequest } from "@beep/hubspot"
 *
 * const request = HubSpotSubmitFormRequest.make({
 *   fields: [{ name: "email", value: "tom@example.com" }],
 *   formGuid: "form-guid"
 * })
 *
 * console.log(request.fields[0]?.value) // "tom@example.com"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class HubSpotSubmitFormRequest extends S.Class<HubSpotSubmitFormRequest>($I`HubSpotSubmitFormRequest`)(
  {
    context: S.optionalKey(HubSpotFormContext),
    fields: S.Array(HubSpotFormField),
    formGuid: S.String,
    submittedAt: S.optionalKey(S.Finite),
  },
  $I.annote("HubSpotSubmitFormRequest", {
    description: "HubSpot form submission request.",
  })
) {}

/**
 * HubSpot form submission response.
 *
 * @example
 * ```ts
 * import { HubSpotSubmitFormResponse } from "@beep/hubspot"
 *
 * const response = HubSpotSubmitFormResponse.make({
 *   inlineMessage: "Thanks"
 * })
 *
 * console.log(response.inlineMessage) // "Thanks"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class HubSpotSubmitFormResponse extends S.Class<HubSpotSubmitFormResponse>($I`HubSpotSubmitFormResponse`)(
  {
    inlineMessage: S.optionalKey(S.String),
    redirectUri: S.optionalKey(S.String),
  },
  $I.annote("HubSpotSubmitFormResponse", {
    description: "HubSpot form submission response.",
  })
) {}

/**
 * HubSpot contact upsert request using email as the stable identifier.
 *
 * @example
 * ```ts
 * import { HubSpotUpsertContactRequest } from "@beep/hubspot"
 *
 * const request = HubSpotUpsertContactRequest.make({
 *   email: "tom@example.com",
 *   properties: {
 *     firstname: "Tom"
 *   }
 * })
 *
 * console.log(request.properties.firstname) // "Tom"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class HubSpotUpsertContactRequest extends S.Class<HubSpotUpsertContactRequest>($I`HubSpotUpsertContactRequest`)(
  {
    email: HubSpotContactEmail,
    objectWriteTraceId: S.optionalKey(S.String),
    properties: S.Record(S.String, S.String),
  },
  $I.annote("HubSpotUpsertContactRequest", {
    description: "HubSpot contact upsert request using email as the stable identifier.",
  })
) {}

/**
 * HubSpot contact upsert result.
 *
 * @example
 * ```ts
 * import { HubSpotUpsertContactResult } from "@beep/hubspot"
 *
 * const result = HubSpotUpsertContactResult.make({
 *   id: "contact-id"
 * })
 *
 * console.log(result.id) // "contact-id"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class HubSpotUpsertContactResult extends S.Class<HubSpotUpsertContactResult>($I`HubSpotUpsertContactResult`)(
  {
    id: S.String,
  },
  $I.annote("HubSpotUpsertContactResult", {
    description: "HubSpot contact upsert result.",
  })
) {}

/**
 * HubSpot contact upsert response.
 *
 * @example
 * ```ts
 * import { HubSpotUpsertContactResponse } from "@beep/hubspot"
 *
 * const response = HubSpotUpsertContactResponse.make({
 *   results: [{ id: "contact-id" }],
 *   status: "COMPLETE"
 * })
 *
 * console.log(response.results[0]?.id) // "contact-id"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class HubSpotUpsertContactResponse extends S.Class<HubSpotUpsertContactResponse>(
  $I`HubSpotUpsertContactResponse`
)(
  {
    results: S.Array(HubSpotUpsertContactResult),
    status: S.optionalKey(S.String),
  },
  $I.annote("HubSpotUpsertContactResponse", {
    description: "HubSpot contact upsert response.",
  })
) {}

/**
 * Public HubSpot service shape.
 *
 * @example
 * ```ts
 * import {
 *   HubSpotSubmitFormResponse,
 *   HubSpotUpsertContactResponse,
 *   type HubSpotShape
 * } from "@beep/hubspot"
 * import { Effect } from "effect"
 *
 * const service = {
 *   submitForm: () => Effect.succeed(HubSpotSubmitFormResponse.make({ inlineMessage: "Thanks" })),
 *   upsertContact: () =>
 *     Effect.succeed(HubSpotUpsertContactResponse.make({ results: [{ id: "contact-id" }] }))
 * } satisfies HubSpotShape
 *
 * console.log(service)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export type HubSpotShape = {
  readonly submitForm: (request: HubSpotSubmitFormRequest) => Effect.Effect<HubSpotSubmitFormResponse, HubSpotError>;
  readonly upsertContact: (
    request: HubSpotUpsertContactRequest
  ) => Effect.Effect<HubSpotUpsertContactResponse, HubSpotError>;
};

class ResolvedHubSpotConfig extends S.Class<ResolvedHubSpotConfig>($I`ResolvedHubSpotConfig`)(
  {
    accountId: S.String,
    accessToken: S.String.pipe(S.Redacted, S.Option),
    crmApiUrl: S.String,
    formsApiUrl: S.String,
    headers: S.Record(S.String, S.String),
  },
  $I.annote("ResolvedHubSpotConfig", {
    description: "Resolved runtime configuration for the HubSpot service.",
  })
) {}

const normalizeBaseUrl = Str.replace(/\/+$/, "");
const decodeSubmitFormRequest = S.decodeUnknownEffect(HubSpotSubmitFormRequest);
const decodeSubmitFormResponse = S.decodeUnknownEffect(HubSpotSubmitFormResponse);
const decodeUpsertContactRequest = S.decodeUnknownEffect(HubSpotUpsertContactRequest);
const decodeUpsertContactResponse = S.decodeUnknownEffect(HubSpotUpsertContactResponse);

const resolveConfig = Effect.fn("HubSpot.resolveConfig")(function* (
  input: HubSpotConfigInput
): Effect.fn.Return<ResolvedHubSpotConfig, HubSpotError> {
  const accountId = yield* pipe(
    O.fromNullishOr(input.accountId),
    O.match({
      onNone: HubSpotError.failEffectFromReasonThunk("config"),
      onSome: Effect.succeed,
    })
  );

  return ResolvedHubSpotConfig.make({
    accountId,
    accessToken: O.fromUndefinedOr(input.accessToken),
    crmApiUrl: normalizeBaseUrl(input.crmApiUrl),
    formsApiUrl: normalizeBaseUrl(input.formsApiUrl),
    headers: input.headers ?? {},
  });
});

const submitFormUrl = (config: ResolvedHubSpotConfig, formGuid: string): string =>
  `${config.formsApiUrl}/submissions/v3/integration/secure/submit/${config.accountId}/${formGuid}`;
const upsertContactUrl = (config: ResolvedHubSpotConfig): string =>
  `${config.crmApiUrl}/crm/v3/objects/contacts/batch/upsert`;

const addHeaders = (
  request: HttpClientRequest.HttpClientRequest,
  config: ResolvedHubSpotConfig
): HttpClientRequest.HttpClientRequest =>
  pipe(request, HttpClientRequest.accept("application/json"), HttpClientRequest.setHeaders(config.headers), (current) =>
    pipe(
      config.accessToken,
      O.match({
        onNone: () => current,
        onSome: (token: RedactedType.Redacted) => HttpClientRequest.bearerToken(current, token),
      })
    )
  );

const makeRequest = Effect.fn("HubSpot.makeSubmitFormRequest")(function* (
  config: ResolvedHubSpotConfig,
  request: HubSpotSubmitFormRequest
) {
  const decoded = yield* pipe(
    decodeSubmitFormRequest(request),
    Effect.mapError((cause) => HubSpotError.fromReason("request encoding", { cause, formGuid: request.formGuid }))
  );
  const url = submitFormUrl(config, decoded.formGuid);

  return yield* pipe(
    HttpClientRequest.post(url),
    (base) => addHeaders(base, config),
    (base) =>
      HttpClientRequest.bodyJson(base, {
        fields: decoded.fields,
        context: decoded.context,
        submittedAt: decoded.submittedAt,
      }),
    Effect.mapError((cause) => HubSpotError.fromReason("request encoding", { cause, formGuid: decoded.formGuid, url }))
  );
});

const makeUpsertContactRequest = Effect.fn("HubSpot.makeUpsertContactRequest")(function* (
  config: ResolvedHubSpotConfig,
  request: HubSpotUpsertContactRequest
) {
  const decoded = yield* pipe(
    decodeUpsertContactRequest(request),
    Effect.mapError((cause) => HubSpotError.fromReason("request encoding", { cause, email: request.email }))
  );
  const url = upsertContactUrl(config);

  return yield* pipe(
    HttpClientRequest.post(url),
    (base) => addHeaders(base, config),
    (base) =>
      HttpClientRequest.bodyJson(base, {
        inputs: [
          {
            id: decoded.email,
            idProperty: "email",
            objectWriteTraceId: decoded.objectWriteTraceId,
            properties: decoded.properties,
          },
        ],
      }),
    Effect.mapError((cause) => HubSpotError.fromReason("request encoding", { cause, email: decoded.email, url }))
  );
});

const ensureSubmitFormSuccess = Effect.fnUntraced(function* (
  formGuid: string,
  url: string,
  response: HttpClientResponse.HttpClientResponse
): Effect.fn.Return<HttpClientResponse.HttpClientResponse, HubSpotError> {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  return yield* HubSpotError.fromReason("response status", { formGuid, status: response.status, url });
});

const ensureUpsertContactSuccess = Effect.fnUntraced(function* (
  email: string,
  url: string,
  response: HttpClientResponse.HttpClientResponse
): Effect.fn.Return<HttpClientResponse.HttpClientResponse, HubSpotError> {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  return yield* HubSpotError.fromReason("response status", { email, status: response.status, url });
});

const decodeResponse = Effect.fnUntraced(
  function* (
    _formGuid: string,
    _url: string,
    response: HttpClientResponse.HttpClientResponse
  ): Effect.fn.Return<HubSpotSubmitFormResponse, HttpClientError.HttpClientError | S.SchemaError> {
    const contentType = response.headers["content-type"] ?? "";

    if (!Str.includes("application/json")(contentType)) {
      return HubSpotSubmitFormResponse.make({});
    }

    const body = yield* response.json;

    return yield* decodeSubmitFormResponse(body);
  },
  (effect, formGuid, url) =>
    effect.pipe(Effect.mapError((cause) => HubSpotError.fromReason("response decoding", { cause, formGuid, url })))
);

const decodeUpsertContact = Effect.fnUntraced(
  function* (
    _email: string,
    _url: string,
    response: HttpClientResponse.HttpClientResponse
  ): Effect.fn.Return<HubSpotUpsertContactResponse, HttpClientError.HttpClientError | S.SchemaError> {
    const body = yield* response.json;

    return yield* decodeUpsertContactResponse(body);
  },
  (effect, email, url) =>
    effect.pipe(Effect.mapError((cause) => HubSpotError.fromReason("response decoding", { cause, email, url })))
);

const makeService = (client: HttpClient.HttpClient, config: ResolvedHubSpotConfig): HubSpotShape => ({
  submitForm: Effect.fn("HubSpot.submitForm")(function* (request) {
    const httpRequest = yield* makeRequest(config, request);
    const url = submitFormUrl(config, request.formGuid);
    const response = yield* client
      .execute(httpRequest)
      .pipe(
        Effect.mapError((cause) => HubSpotError.fromReason("transport", { cause, formGuid: request.formGuid, url }))
      );
    const success = yield* ensureSubmitFormSuccess(request.formGuid, url, response);
    return yield* decodeResponse(request.formGuid, url, success);
  }),
  upsertContact: Effect.fn("HubSpot.upsertContact")(function* (request) {
    const httpRequest = yield* makeUpsertContactRequest(config, request);
    const url = upsertContactUrl(config);
    const response = yield* client
      .execute(httpRequest)
      .pipe(Effect.mapError((cause) => HubSpotError.fromReason("transport", { cause, email: request.email, url })));
    const success = yield* ensureUpsertContactSuccess(request.email, url, response);
    return yield* decodeUpsertContact(request.email, url, success);
  }),
});

/**
 * Effect service for HubSpot Forms API submissions.
 *
 * @example
 * ```ts
 * import { HubSpot, HubSpotConfigInput } from "@beep/hubspot"
 *
 * const layer = HubSpot.makeLayer(
 *   HubSpotConfigInput.make({
 *     accountId: "12345"
 *   })
 * )
 *
 * console.log(layer)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class HubSpot extends Context.Service<HubSpot, HubSpotShape>()($I`HubSpot`) {
  /**
   * Build a HubSpot layer from explicit runtime configuration.
   *
   * @example
   * ```ts
   * import { HubSpot, HubSpotConfigInput } from "@beep/hubspot"
   *
   * const layer = HubSpot.makeLayer(
   *   HubSpotConfigInput.make({
   *     accountId: "12345"
   *   })
   * )
   *
   * console.log(layer)
   * ```
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly makeLayer = (config: HubSpotConfigInput): Layer.Layer<HubSpot, HubSpotError, HttpClient.HttpClient> =>
    Layer.effect(
      HubSpot,
      Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;
        const resolved = yield* resolveConfig(config);
        return HubSpot.of(makeService(client, resolved));
      })
    );

  /**
   * Live HubSpot layer backed by ambient Effect Config values.
   *
   * @example
   * ```ts
   * import { HubSpot } from "@beep/hubspot"
   *
   * console.log(HubSpot.layer)
   * ```
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly layer: Layer.Layer<HubSpot, HubSpotError> = Layer.effect(
    HubSpot,
    Effect.gen(function* () {
      const accountId = yield* Config.string("HUBSPOT_ACCOUNT_ID").pipe(Config.option);
      const accessToken = yield* Config.redacted("HUBSPOT_SERVICE_KEY").pipe(Config.option);
      const crmApiUrl = yield* Config.string("HUBSPOT_CRM_API_URL").pipe(Config.option);
      const formsApiUrl = yield* Config.string("HUBSPOT_FORMS_API_URL").pipe(Config.option);
      const client = yield* HttpClient.HttpClient;
      const resolved = yield* resolveConfig(
        HubSpotConfigInput.make({
          ...O.getSomesStruct({ accessToken, accountId, crmApiUrl, formsApiUrl }),
        })
      );

      return HubSpot.of(makeService(client, resolved));
    }).pipe(Effect.mapError((cause) => HubSpotError.fromReason("config", { cause })))
  ).pipe(Layer.provide(FetchHttpClient.layer));
}
