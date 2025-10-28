import type * as Effect from "effect/Effect";
import type * as S from "effect/Schema";
import type * as Scope from "effect/Scope";
import { stringLiteralKit } from "../kits";
export type AnySchema = S.Schema.AnyNoContext | typeof S.Never;

const HttpMethodKit = stringLiteralKit("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD", "TRACE", "CONNECT");

export class HttpMethod extends HttpMethodKit.Schema {
  static readonly Options = HttpMethodKit.Options;
  static readonly Enum = HttpMethodKit.Enum;
}

export declare namespace HttpMethod {
  export type Type = typeof HttpMethod.Type;
  export type Encoded = typeof HttpMethod.Encoded;
}

export type EndpointHandler<
  PayloadSchema extends AnySchema,
  SuccessSchema extends AnySchema,
  FailureSchema extends AnySchema,
> = (request: {
  readonly payload: S.Schema.Type<PayloadSchema>;
}) => Effect.Effect<S.Schema.Type<SuccessSchema>, S.Schema.Type<FailureSchema>, Scope.Scope>;

export type ProvideHandler<
  PayloadSchema extends AnySchema,
  SuccessSchema extends AnySchema,
  FailureSchema extends AnySchema,
> = <Handler extends EndpointHandler<PayloadSchema, SuccessSchema, FailureSchema>>(handler: Handler) => Handler;

export type RegisteredEndpoint<
  PayloadSchema extends AnySchema,
  SuccessSchema extends AnySchema,
  FailureSchema extends AnySchema,
> = {
  readonly method: HttpMethod.Type;
  readonly path: string;
  readonly payload: PayloadSchema;
  readonly success: SuccessSchema;
  readonly failure: FailureSchema;
  readonly handler: EndpointHandler<PayloadSchema, SuccessSchema, FailureSchema>;
};

export type AnyRegisteredEndpoint = RegisteredEndpoint<AnySchema, AnySchema, AnySchema>;
