import type { IamAuthError } from "@beep/iam-domain";
import type { Auth } from "@beep/iam-infra";
import type * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import type * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import type * as Effect from "effect/Effect";

export type HandlerArgs<T> = {
  readonly payload: T;
};

export type UrlParamsHandlerArgs<T> = {
  readonly urlParams: T;
  readonly request: HttpServerRequest.HttpServerRequest;
};

export type HandlerEffect<TPayload> = TPayload extends undefined
  ? () => Effect.Effect<
      HttpServerResponse.HttpServerResponse,
      IamAuthError,
      Auth.Service | HttpServerRequest.HttpServerRequest
    >
  : (
      args: HandlerArgs<TPayload>
    ) => Effect.Effect<
      HttpServerResponse.HttpServerResponse,
      IamAuthError,
      Auth.Service | HttpServerRequest.HttpServerRequest
    >;

export type UrlParamsHandlerEffect<TUrlParams> = (
  args: UrlParamsHandlerArgs<TUrlParams>
) => Effect.Effect<
  HttpServerResponse.HttpServerResponse,
  IamAuthError,
  Auth.Service | HttpServerRequest.HttpServerRequest
>;
