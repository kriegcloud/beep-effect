import { BeepError } from "@beep/errors";
import { AuthEmailService, IamConfig, IamDb, layer as reposLayer } from "@beep/iam-infra";
import { AuthService } from "@beep/iam-infra/adapters/better-auth/Auth.service";
import { IamDbSchema } from "@beep/iam-tables";
import { Organization, Session, User } from "@beep/shared-domain/entities";
import { AuthContextRpcMiddleware } from "@beep/shared-domain/Policy";
import { Live } from "@beep/shared-infra/Live";
import { eq } from "drizzle-orm";
import { Effect, Layer } from "effect";
import * as A from "effect/Array";
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

export const AuthContextHttpMiddlewareLive = Layer.effect(
  AuthContextRpcMiddleware,
  Effect.gen(function* () {
    const { auth } = yield* AuthService;
    const { execute } = yield* IamDb.IamDb;

    return AuthContextRpcMiddleware.of(() =>
      Effect.gen(function* () {
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

        return {
          user: currentUser,
          session: currentSession,
          organization: currentOrg,
        };
      })
    );
  })
).pipe(Layer.provide(Layer.mergeAll(AuthLive, ReposLive)));
