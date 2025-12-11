import { BeepError } from "@beep/errors";
import { IamDb } from "@beep/iam-infra";
import { IamDbSchema } from "@beep/iam-tables";
import { Organization, Session, User } from "@beep/shared-domain/entities";
import { AuthContextRpcMiddleware } from "@beep/shared-domain/Policy";
import { Email } from "@beep/shared-infra/Email";
import type * as RpcMiddleware from "@effect/rpc/RpcMiddleware";
import { eq } from "drizzle-orm";
import { Effect, Layer } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { headers } from "next/headers";
import { AuthService } from "./AuthLive";
import { DbLive } from "./DbLive.ts";

type MiddlewareEffect = Effect.Effect<
  RpcMiddleware.RpcMiddleware<
    {
      readonly user: typeof User.Model.select.Type;
      readonly session: typeof Session.Model.select.Type;
      readonly organization: typeof Organization.Model.select.Type;
    },
    BeepError.Unauthorized
  >,
  never,
  AuthService | IamDb.IamDb
>;

const middlewareEffect: MiddlewareEffect = Effect.gen(function* () {
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
});

export const AuthContextRpcMiddlewareLive = Layer.effect(AuthContextRpcMiddleware, middlewareEffect).pipe(
  Layer.provideMerge(AuthService.layer.pipe(Layer.provideMerge(DbLive))),
  Layer.provideMerge(Email.ResendService.Default)
);
