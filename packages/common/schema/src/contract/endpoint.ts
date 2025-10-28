import { Router } from "@beep/schema/contract/router";
import type { AnySchema, EndpointHandler, HttpMethod, ProvideHandler } from "@beep/schema/contract/types";
import { identity } from "effect";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type * as Scope from "effect/Scope";

export const make = <
  PayloadSchema extends AnySchema,
  SuccessSchema extends AnySchema,
  FailureSchema extends AnySchema,
  BuildE,
  BuildR,
>(options: {
  readonly method: HttpMethod.Type;
  readonly path: string;
  readonly payload: PayloadSchema;
  readonly success: SuccessSchema;
  readonly failure: FailureSchema;
  readonly build: (
    of: ProvideHandler<PayloadSchema, SuccessSchema, FailureSchema>
  ) => Effect.Effect<EndpointHandler<PayloadSchema, SuccessSchema, FailureSchema>, BuildE, BuildR>;
}): Layer.Layer<never, BuildE, Router | Exclude<BuildR, Scope.Scope>> =>
  Layer.scopedDiscard(
    Effect.gen(function* () {
      const router = yield* Router;
      const handler = yield* options.build(identity);
      yield* router.register({
        method: options.method,
        path: options.path,
        payload: options.payload,
        success: options.success,
        failure: options.failure,
        handler,
      });
    })
  );
