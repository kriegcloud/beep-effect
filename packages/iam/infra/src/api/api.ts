import { AllowedHeaders, AllowedHttpMethods } from "@beep/constants";
import { BeepError } from "@beep/errors/shared";
import { AuthEmailService } from "@beep/iam-infra";
import { AuthService } from "@beep/iam-infra/adapters/better-auth/Auth.service";
import { layer as reposLayer } from "@beep/iam-infra/adapters/repositories";
import { CurrentUserLive } from "@beep/iam-infra/api/current-user.live";
import { Api } from "@beep/iam-infra/api/root";
import { IamConfig } from "@beep/iam-infra/config";
import { IamDb } from "@beep/iam-infra/db";
import { IamDbSchema } from "@beep/iam-tables";
import { Organization, Session, User } from "@beep/shared-domain/entities";
import { AuthContext, AuthContextHttpMiddleware } from "@beep/shared-domain/Policy";
import { Live } from "@beep/shared-infra/Live";
import { serverEnv } from "@beep/shared-infra/ServerEnv";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import * as HttpApiScalar from "@effect/platform/HttpApiScalar";
import * as HttpMiddleware from "@effect/platform/HttpMiddleware";
import * as HttpServer from "@effect/platform/HttpServer";
import { eq } from "drizzle-orm";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { headers } from "next/headers";

const DbLive = Layer.provideMerge(IamDb.IamDb.Live, Live);
const ReposLive = Layer.provideMerge(reposLayer, DbLive);

const AuthEmailLive = AuthEmailService.DefaultWithoutDependencies.pipe(
  Layer.provideMerge(Live),
  Layer.provideMerge(IamConfig.Live)
);

const CoreServicesLive = Layer.provideMerge(ReposLive, AuthEmailLive);

const AuthLive = AuthService.DefaultWithoutDependencies.pipe(Layer.provide([CoreServicesLive, IamConfig.Live]));

const AuthContextHttpMiddlewareLive = Layer.effect(
  AuthContextHttpMiddleware,
  Effect.gen(function* () {
    const { auth } = yield* AuthService;
    const { execute } = yield* IamDb.IamDb;

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

      const currentOrg = yield* execute((client) =>
        client
          .select()
          .from(IamDbSchema.organization)
          .where(eq(IamDbSchema.organization.id, currentSession.activeOrganizationId))
      ).pipe(
        Effect.flatMap(A.head),
        Effect.flatMap(S.decodeUnknown(Organization.Model)),
        Effect.mapError(
          () =>
            new BeepError.Unauthorized({
              message: "Unauthorized current Organization not found",
            })
        )
      );

      return AuthContext.of({
        user: currentUser,
        session: currentSession,
        organization: currentOrg,
      } as const);
    });
  })
).pipe(Layer.provide(Layer.mergeAll(AuthLive, ReposLive)));

const RoutesLive = CurrentUserLive.pipe(Layer.provideMerge(ReposLive));
const ScalarLayer = HttpApiScalar.layer({
  path: "/api/v1/iam/docs",
});
const ApiLive = HttpApiBuilder.api(Api).pipe(
  Layer.provide(RoutesLive),
  Layer.provide(AuthContextHttpMiddlewareLive),
  Layer.orDie
);

const CorsLive = HttpApiBuilder.middlewareCors({
  allowedOrigins: [serverEnv.app.env === "dev" ? "*" : serverEnv.app.apiUrl.toString()],
  allowedMethods: AllowedHttpMethods.Options,
  allowedHeaders: AllowedHeaders.Options,
  credentials: true,
});

export const { dispose, handler } = HttpApiBuilder.toWebHandler(
  Layer.mergeAll(ScalarLayer.pipe(Layer.provideMerge(ApiLive)), CorsLive, HttpServer.layerContext),
  {
    middleware: F.pipe(HttpMiddleware.logger),
  }
);
