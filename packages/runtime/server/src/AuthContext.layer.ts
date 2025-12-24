import { BeepError } from "@beep/errors";
import { Auth, IamDb } from "@beep/iam-server";
import { IamDbSchema } from "@beep/iam-tables";
import { Policy } from "@beep/shared-domain";
import { Organization, Session, User } from "@beep/shared-domain/entities";
import { AuthContext, AuthContextRpcMiddleware, type AuthContextShape } from "@beep/shared-domain/Policy";
import * as PlatformHeaders from "@effect/platform/Headers";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import { eq } from "drizzle-orm";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Authentication from "./Authentication.layer";

/**
 * Extracts authentication context from HTTP headers.
 */
const getAuthContext = ({
  headers,
  iamDb: { execute },
  auth,
}: {
  readonly auth: Auth.Auth;
  readonly iamDb: IamDb.Shape;
  readonly headers: PlatformHeaders.Headers;
}): Effect.Effect<AuthContextShape, BeepError.Unauthorized, never> =>
  Effect.gen(function* () {
    const cookie = PlatformHeaders.get(headers, "cookie");
    const authorization = PlatformHeaders.get(headers, "authorization");

    if (O.isNone(cookie) && O.isNone(authorization)) {
      return yield* new BeepError.Unauthorized({
        message: "Missing authentication headers",
      });
    }

    // Create browser Headers for Better Auth API
    const forwardedHeaders = new Headers();
    if (O.isSome(cookie)) forwardedHeaders.set("cookie", cookie.value);
    if (O.isSome(authorization)) forwardedHeaders.set("authorization", authorization.value);

    // Get session from Better Auth
    const { user, session } = yield* Effect.tryPromise({
      try: async () => {
        const session = await auth.api.getSession({
          headers: forwardedHeaders,
        });
        return O.fromNullable(session).pipe(O.getOrThrow);
      },
      catch: (cause) => new BeepError.Unauthorized({ cause }),
    }).pipe(
      Effect.flatMap(
        S.decodeUnknown(
          S.Struct({
            user: User.Model,
            session: Session.Model,
          })
        )
      ),
      Effect.mapError(() => new BeepError.Unauthorized({ message: "Invalid session" }))
    );

    // Fetch organization
    const currentOrg = yield* execute((client) =>
      client
        .select()
        .from(IamDbSchema.organization)
        .where(eq(IamDbSchema.organization.id, session.activeOrganizationId))
    ).pipe(
      Effect.flatMap(A.head),
      Effect.flatMap(S.decodeUnknown(Organization.Model)),
      Effect.mapError(
        () =>
          new BeepError.Unauthorized({
            message: "Organization not found",
          })
      )
    );

    return {
      user,
      session,
      organization: currentOrg,
    };
  });

/**
 * Layer that provides AuthContext per-request.
 *
 * This layer depends on HttpServerRequest which is available during request handling.
 * When a handler runs and accesses AuthContext, this layer extracts auth from the
 * request headers and provides the AuthContext service.
 */
const contextLayerEffect: Effect.Effect<
  AuthContextShape,
  BeepError.Unauthorized,
  Auth.Service | IamDb.IamDb | HttpServerRequest.HttpServerRequest
> = Effect.gen(function* () {
  const auth = yield* Auth.Service;
  const iamDb = yield* IamDb.IamDb;
  const request = yield* HttpServerRequest.HttpServerRequest;
  return yield* getAuthContext({
    auth,
    iamDb,
    headers: request.headers,
  });
});
export const AuthContextLayer = Layer.effect(AuthContext, contextLayerEffect);

export const AuthContextRpcMiddlewaresLayer = Layer.effect(
  Policy.AuthContextRpcMiddleware,
  Effect.gen(function* () {
    // Acquire dependencies during Layer construction
    const auth = yield* Auth.Service;
    const iamDb = yield* IamDb.IamDb;

    // Return the middleware FUNCTION (not the context value)
    // This function will be called for each RPC request with headers, clientId, etc.
    return AuthContextRpcMiddleware.of((options) =>
      getAuthContext({
        auth,
        iamDb,
        headers: options.headers,
      })
    );
  })
);
export const AuthContextHttpMiddlewaresLayer = Layer.effect(
  Policy.AuthContextHttpMiddleware,
  Effect.gen(function* () {
    const auth = yield* Auth.Service;
    const iamDb = yield* IamDb.IamDb;

    return Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const headers = request.headers;

      return yield* getAuthContext({
        auth,
        iamDb,
        headers,
      });
    });
  })
);

/**
 * Combined middleware layer for RPC and HTTP auth context.
 *
 * The middleware layers return Effect values that capture HttpServerRequest
 * at request time (deferred pattern), so they don't require HttpServerRequest
 * at layer construction time.
 */
export const authContextMiddlewareLayer = Layer.merge(AuthContextRpcMiddlewaresLayer, AuthContextHttpMiddlewaresLayer);

export type Services = AuthContextRpcMiddleware | Policy.AuthContextHttpMiddleware | Authentication.Services;

/**
 * Complete auth layer that provides auth context middlewares and authentication services.
 *
 * Uses `provideMerge` to expose Authentication.Services (including Auth.Service)
 * so that downstream layers like IamApiLive can access them.
 */
export const layer: Layer.Layer<Services, never, never> = authContextMiddlewareLayer.pipe(
  Layer.provideMerge(Authentication.layer)
);
