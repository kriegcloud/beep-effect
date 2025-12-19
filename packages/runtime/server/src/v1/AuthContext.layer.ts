import { BeepError } from "@beep/errors";
import { Auth, IamDb } from "@beep/iam-infra";
import { IamDbSchema } from "@beep/iam-tables";
import { Organization, Session, User } from "@beep/shared-domain/entities";
import { AuthContextHttpMiddleware, AuthContextRpcMiddleware } from "@beep/shared-domain/Policy";
import * as PlatformHeaders from "@effect/platform/Headers";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import { eq } from "drizzle-orm";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Authentication from "./Authentication.layer.ts";

const getAuthContext = ({
  auth,
  iamDb: { execute },
  headers,
}: {
  auth: Auth.Auth;
  iamDb: IamDb.Shape;
  headers: PlatformHeaders.Headers;
}) =>
  Effect.gen(function* () {
    // Extract headers from RPC options (NOT from HttpServerRequest)
    // PlatformHeaders.get returns Option<string>
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

    // Return the AuthContext value
    // RpcServer will automatically call Effect.provideService(handler, AuthContext, thisValue)
    return {
      user,
      session,
      organization: currentOrg,
    };
  });

export const AuthContextRpcMiddlewareLive: Layer.Layer<AuthContextRpcMiddleware, never, Auth.Service | IamDb.IamDb> =
  Layer.effect(
    AuthContextRpcMiddleware,
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

export const AuthContextHttpMiddlewareLive: Layer.Layer<AuthContextHttpMiddleware, never, Auth.Service | IamDb.IamDb> =
  Layer.effect(
    AuthContextHttpMiddleware,
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

type AuthorizationMiddlewares = AuthContextHttpMiddleware | AuthContextRpcMiddleware;

const authorizationMiddlewareLayer: Layer.Layer<AuthorizationMiddlewares, never, Auth.Service | IamDb.IamDb> =
  Layer.mergeAll(AuthContextHttpMiddlewareLive, AuthContextRpcMiddlewareLive);

export type Services = AuthorizationMiddlewares | Authentication.Services;

export const layer: Layer.Layer<Services, never, never> = authorizationMiddlewareLayer.pipe(
  Layer.provideMerge(Authentication.layer)
);
