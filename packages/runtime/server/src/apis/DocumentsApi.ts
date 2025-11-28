import { AllowedHeaders, AllowedHttpMethods } from "@beep/constants";
import { Db } from "@beep/core-db";
import { ResendService } from "@beep/core-email";
import { serverEnv } from "@beep/core-env/server";
import { layer as reposLayer } from "@beep/documents-infra/adapters/repositories";
import { Api, KnowledgePageRouterLive } from "@beep/documents-infra/routes";
import { BeepError } from "@beep/errors/shared";
import { AuthEmailService } from "@beep/iam-infra";
import { AuthService } from "@beep/iam-infra/adapters/better-auth/Auth.service";
import { IamConfig } from "@beep/iam-infra/config";
import { IamDb } from "@beep/iam-infra/db";
import { Session, User } from "@beep/shared-domain/entities";
import { AuthContext, UserAuthMiddleware } from "@beep/shared-domain/Policy";
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

const DbLive = Layer.provideMerge(IamDb.IamDb.Live, Db.Live);
const ReposLive = Layer.provideMerge(reposLayer, DbLive);

const AuthEmailLive = AuthEmailService.DefaultWithoutDependencies.pipe(
  Layer.provideMerge(Layer.provideMerge(ResendService.Default, IamConfig.Live))
);

const CoreServicesLive = Layer.provideMerge(ReposLive, AuthEmailLive);

const AuthLive = AuthService.DefaultWithoutDependencies.pipe(Layer.provide([CoreServicesLive, IamConfig.Live]));

const UserAuthMiddlewareLive = Layer.effect(
  UserAuthMiddleware,
  Effect.gen(function* () {
    const { auth } = yield* AuthService;
    const currentUserOpt = yield* Effect.tryPromise({
      try: async () => {
        const session = await auth.api.getSession({
          headers: await headers(),
        });
        return O.fromNullable(session);
      },
      catch: () =>
        new BeepError.Unauthorized({
          message: "Unauthorized current User not found",
        }),
    });
    if (O.isNone(currentUserOpt)) {
      return yield* new BeepError.Unauthorized({
        message: "Unauthorized current User not found",
      });
    }
    const currentUser = yield* S.decodeUnknown(User.Model)(currentUserOpt.value.user).pipe(
      Effect.mapError(
        () =>
          new BeepError.Unauthorized({
            message: "Unauthorized current User not found",
          })
      )
    );
    const currentSession = yield* S.decodeUnknown(Session.Model)(currentUserOpt.value.session).pipe(
      Effect.mapError(
        () =>
          new BeepError.Unauthorized({
            message: "Unauthorized current User not found",
          })
      )
    );
    return Effect.succeed(
      AuthContext.of({
        user: currentUser,
        session: currentSession,
      } as const)
    );
  })
).pipe(Layer.provide(AuthLive));
UserAuthMiddlewareLive;
const RoutesLive = Layer.provideMerge(KnowledgePageRouterLive, ReposLive);
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
