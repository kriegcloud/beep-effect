import { BeepError } from "@beep/errors";
import { IamDb } from "@beep/iam-infra";
import { IamDbSchema } from "@beep/iam-tables";
import { Organization, Session, User } from "@beep/shared-domain/entities";
import { AuthContextRpcMiddleware } from "@beep/shared-domain/Policy";
import { Email } from "@beep/shared-infra/Email";
import * as PlatformHeaders from "@effect/platform/Headers";
import { eq } from "drizzle-orm";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { AuthService } from "./AuthLive";
import { DbLive } from "./DbLive.ts";

export const AuthContextRpcMiddlewareLive = Layer.effect(
  AuthContextRpcMiddleware,
  Effect.gen(function* () {
    // Acquire dependencies during Layer construction
    const { auth } = yield* AuthService;
    const { execute } = yield* IamDb.IamDb;

    // Return the middleware FUNCTION (not the context value)
    // This function will be called for each RPC request with headers, clientId, etc.
    return AuthContextRpcMiddleware.of((options) =>
      Effect.gen(function* () {
        // Extract headers from RPC options (NOT from HttpServerRequest)
        // PlatformHeaders.get returns Option<string>
        const cookie = PlatformHeaders.get(options.headers, "cookie");
        const authorization = PlatformHeaders.get(options.headers, "authorization");

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
      })
    );
  })
).pipe(
  Layer.provideMerge(AuthService.layer.pipe(Layer.provideMerge(DbLive))),
  Layer.provideMerge(Email.ResendService.Default)
);
