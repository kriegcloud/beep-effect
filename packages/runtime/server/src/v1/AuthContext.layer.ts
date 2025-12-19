import { BeepError } from "@beep/errors";
import { Auth, IamDb } from "@beep/iam-server";
import { IamDbSchema } from "@beep/iam-tables";
import { Organization, Session, User } from "@beep/shared-domain/entities";
import { AuthContext } from "@beep/shared-domain/Policy";
import * as PlatformHeaders from "@effect/platform/Headers";
import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import type * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import { eq } from "drizzle-orm";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Authentication from "./Authentication.layer.ts";

/**
 * Extracts authentication context from HTTP headers.
 */
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
 * HttpLayerRouter middleware that provides AuthContext to route handlers.
 *
 * This middleware:
 * 1. Captures Auth.Service and IamDb at construction time (from layer dependencies)
 * 2. At request time, extracts headers from HttpServerRequest
 * 3. Validates session and provides AuthContext to downstream handlers
 *
 * The middleware pattern ensures HttpServerRequest dependency doesn't leak
 * to the server layer - it's only required during request handling.
 */
export const AuthContextMiddlewareLive = HttpLayerRouter.middleware<{
  provides: AuthContext;
}>()(
  Effect.gen(function* () {
    // Capture dependencies at construction time
    const auth = yield* Auth.Service;
    const iamDb = yield* IamDb.IamDb;

    // Return the middleware function that runs per-request
    return (httpEffect: Effect.Effect<HttpServerResponse.HttpServerResponse, unknown, AuthContext>) =>
      Effect.gen(function* () {
        // Access request at request time (from Provided)
        const request = yield* HttpServerRequest.HttpServerRequest;
        const authContext = yield* getAuthContext({
          auth,
          iamDb,
          headers: request.headers,
        });
        return yield* Effect.provideService(httpEffect, AuthContext, authContext);
      });
  })
);

export type Services = Authentication.Services;

/**
 * Layer that provides the AuthContext middleware.
 * Provides Request.From<"Requires", AuthContext> which is consumed by HttpLayerRouter.serve.
 */
export const layer = AuthContextMiddlewareLive.layer.pipe(Layer.provide(Authentication.layer));
