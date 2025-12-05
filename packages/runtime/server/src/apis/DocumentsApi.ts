import { AllowedHeaders, AllowedHttpMethods } from "@beep/constants";
import { Api, KnowledgePageRouterLive } from "@beep/documents-infra/routes";
import { BeepError } from "@beep/errors/shared";
import { AuthService } from "@beep/iam-infra/adapters/better-auth/Auth.service";
import { Session, User } from "@beep/shared-domain/entities";
import { AuthContext, UserAuthMiddleware } from "@beep/shared-domain/Policy";
import { serverEnv } from "@beep/shared-infra/ServerEnv";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import * as HttpApiScalar from "@effect/platform/HttpApiScalar";
import * as HttpMiddleware from "@effect/platform/HttpMiddleware";
import * as HttpServer from "@effect/platform/HttpServer";
import type * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { headers } from "next/headers";
import { SlicesLive } from "../Slices";

// User auth middleware - requires AuthService (provided by SlicesLive)
const UserAuthMiddlewareLive = Layer.effect(
  UserAuthMiddleware,
  Effect.gen(function* () {
    const { auth } = yield* AuthService;
    return Effect.gen(function* () {
      const currentUserOpt = yield* Effect.tryPromise({
        try: async () => {
          const session = await auth.api.getSession({
            headers: await headers(),
          });
          return O.fromNullable(session);
        },
        catch: () =>
          new BeepError.Unauthorized({
            message: "Unauthorized: failed to get session",
          }),
      });
      if (O.isNone(currentUserOpt)) {
        return yield* new BeepError.Unauthorized({
          message: "Unauthorized: no session found",
        });
      }
      const currentUser = yield* S.decodeUnknown(User.Model)(currentUserOpt.value.user).pipe(
        Effect.mapError(
          () =>
            new BeepError.Unauthorized({
              message: "Unauthorized: invalid user data",
            })
        )
      );
      const currentSession = yield* S.decodeUnknown(Session.Model)(currentUserOpt.value.session).pipe(
        Effect.mapError(
          () =>
            new BeepError.Unauthorized({
              message: "Unauthorized: invalid session data",
            })
        )
      );
      return AuthContext.of({
        user: currentUser,
        session: currentSession,
      } as const);
    });
  })
).pipe(Layer.provide(SlicesLive));

// Routes layer - requires DocumentsRepos (provided by SlicesLive)
const RoutesLive = KnowledgePageRouterLive.pipe(Layer.provide(SlicesLive));

const ScalarLayer = HttpApiScalar.layer({
  path: "/api/v1/documents/docs",
});

const ApiLive = HttpApiBuilder.api(Api).pipe(Layer.provide(RoutesLive), Layer.provide(UserAuthMiddlewareLive));

const CorsLive = HttpApiBuilder.middlewareCors({
  allowedOrigins: [serverEnv.app.env === "dev" ? "*" : serverEnv.app.apiUrl.toString()],
  allowedMethods: AllowedHttpMethods.Options,
  allowedHeaders: AllowedHeaders.Options,
  credentials: true,
});

export const { handler } = HttpApiBuilder.toWebHandler(
  Layer.mergeAll(ScalarLayer.pipe(Layer.provideMerge(ApiLive)), CorsLive, HttpServer.layerContext),
  {
    middleware: F.pipe(HttpMiddleware.logger),
  }
);

const toNextHandlers = (
  handler: (request: Request, context?: Context.Context<never> | undefined) => Promise<Response>
) => ({
  GET: handler,
  POST: handler,
  PUT: handler,
  DELETE: handler,
  PATCH: handler,
});

export const DocumentsApiHandlers = F.constant(toNextHandlers(handler));
