import type { AnyRegisteredEndpoint, AnySchema, HttpMethod, RegisteredEndpoint } from "@beep/schema/contract/types";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as Str from "effect/String";

const makeRouteKey = <Path extends string>(
  method: HttpMethod.Type,
  path: Path
): `${Uppercase<typeof method>}_${Path}` => F.pipe(Str.toUpperCase(method), Str.concat("_"), Str.concat(path));

export declare namespace Router {
  export type Type = {
    readonly register: <
      const PayloadSchema extends AnySchema,
      const SuccessSchema extends AnySchema,
      const FailureSchema extends AnySchema,
    >(
      endpoint: RegisteredEndpoint<PayloadSchema, SuccessSchema, FailureSchema>
    ) => Effect.Effect<void>;
    readonly endpoints: Effect.Effect<ReadonlyArray<AnyRegisteredEndpoint>>;
    readonly find: (method: HttpMethod.Type, path: string) => Effect.Effect<AnyRegisteredEndpoint | undefined>;
  };
}

export class Router extends Context.Tag("@beep/Router")<Router, Router.Type>() {
  static readonly Live = Layer.sync(this, () => {
    const routes = new Map<string, AnyRegisteredEndpoint>();
    return this.of({
      register: (endpoint) =>
        Effect.suspend(() => {
          const routeKey = makeRouteKey(endpoint.method, endpoint.path);

          if (routes.has(routeKey)) {
            return Effect.dieMessage(`Route collision detected for ${endpoint.method} ${endpoint.path}`);
          }
          routes.set(routeKey, endpoint);
          return Effect.void;
        }),
      find: (method: HttpMethod.Type, path: string) => Effect.sync(() => routes.get(makeRouteKey(method, path))),
      endpoints: Effect.sync(() => Array.from(routes.values())),
    });
  });
}
