import { BeepError } from "@beep/errors";
import { Auth, IamDb } from "@beep/iam-server";
import { IamDbSchema } from "@beep/iam-tables";
import { Organization, Session, User } from "@beep/shared-domain/entities";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain/entity-ids";
import {
  AuthContext,
  AuthContextHttpMiddleware,
  AuthContextRpcMiddleware,
  type AuthContextShape,
  OAuthAccountsError,
  OAuthTokenError,
  ProviderAccountSelectionRequiredError,
} from "@beep/shared-domain/Policy";
import type { DateTimeInput } from "@beep/shared-tables/columns";
import * as PlatformHeaders from "@effect/platform/Headers";
import type * as HttpRouter from "@effect/platform/HttpRouter";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import { and, eq } from "drizzle-orm";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import { requireProviderAccountId } from "./AuthContext/providerAccountSelection";
import * as Authentication from "./Authentication.layer";

/**
 * Converts DateTimeInput (string | number | Date | DateTime.Utc) to Date.
 * The database returns strings, but the type system sees the full union.
 */
const toDate = (input: DateTimeInput): Date => {
  if (input instanceof Date) return input;
  if (typeof input === "string" || typeof input === "number") return new Date(input);
  // DateTime.Utc - convert to JS Date
  return DateTime.toDate(input);
};

/**
 * Type for the cookie security handler expected by AuthContextHttpMiddleware.
 *
 * The middleware is defined with `security: { cookie: HttpApiSecurity.apiKey(...) }`
 * which means the implementation must provide a `cookie` handler that takes
 * a Redacted<string> (the extracted cookie value) and returns the AuthContextShape.
 *
 * HttpApiSecurity.apiKey extracts the cookie and provides it as Redacted<string>.
 * The handler must return an Effect that provides the AuthContextShape or fails
 * with Unauthorized.
 */
type CookieSecurityHandler = (
  token: Redacted.Redacted
) => Effect.Effect<AuthContextShape, BeepError.Unauthorized, HttpRouter.HttpRouter.Provided>;

/**
 * The full service type for AuthContextHttpMiddleware security handlers.
 */
type AuthContextHttpMiddlewareService = {
  readonly cookie: CookieSecurityHandler;
};

/**
 * Extracts authentication context from HTTP headers.
 */
const getAuthContext = Effect.fnUntraced(function* ({
  headers,
  iamDb: { execute },
  auth,
}: {
  readonly auth: Auth.Auth;
  readonly iamDb: IamDb.Shape;
  readonly headers: PlatformHeaders.Headers;
}) {
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
    client.select().from(IamDbSchema.organization).where(eq(IamDbSchema.organization.id, session.activeOrganizationId))
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

  const listProviderAccounts = ({ providerId, userId }: { readonly providerId: string; readonly userId: string }) =>
    execute((client) =>
      client
        .select()
        .from(IamDbSchema.account)
        .where(
          and(
            eq(IamDbSchema.account.userId, SharedEntityIds.UserId.make(userId)),
            eq(IamDbSchema.account.providerId, providerId)
          )
        )
    ).pipe(
      Effect.map((rows) =>
        rows.map((acc) => ({
          providerAccountId: acc.id,
          accountId: acc.accountId ?? undefined,
          scope: acc.scope ?? undefined,
        }))
      ),
      Effect.mapError(
        (error) =>
          new OAuthAccountsError({
            message: `Failed to list provider accounts: ${String(error)}`,
          })
      )
    );

  return AuthContext.of({
    user,
    session,
    organization: currentOrg,
    oauth: {
      listProviderAccounts,

      getAccessToken: ({
        providerId,
        userId,
        providerAccountId,
      }: {
        providerId: string;
        userId: string;
        providerAccountId?: string | undefined;
      }) =>
        Effect.gen(function* () {
          const selectedProviderAccountId = yield* requireProviderAccountId({
            providerId,
            providerAccountId,
            callbackURL: "/settings?settingsTab=connections",
            listCandidates: listProviderAccounts({ providerId, userId }).pipe(
              Effect.mapError(
                (e) =>
                  new OAuthTokenError({
                    message: e.message,
                    providerId,
                  })
              )
            ),
          });

          const token = yield* Effect.tryPromise({
            try: () =>
              auth.api.getAccessToken({
                body: {
                  providerId,
                  userId,
                  ...(selectedProviderAccountId !== undefined && { accountId: selectedProviderAccountId }),
                },
              }),
            catch: (error) =>
              new OAuthTokenError({
                message: `Failed to get access token: ${String(error)}`,
                providerId,
              }),
          });

          return O.fromNullable(token?.accessToken ? { accessToken: token.accessToken } : null);
        }),

      getProviderAccount: ({
        providerId,
        userId,
        providerAccountId,
      }: {
        providerId: string;
        userId: string;
        providerAccountId?: string | undefined;
      }) =>
        Effect.gen(function* () {
          if (providerId === "google" && providerAccountId === undefined) {
            const candidates = yield* listProviderAccounts({ providerId, userId });
            return yield* new ProviderAccountSelectionRequiredError({
              providerId: "google",
              requiredParam: "providerAccountId",
              candidates,
              select: { callbackURL: "/settings?settingsTab=connections" },
              message: "providerAccountId is required",
            });
          }

          const row =
            providerAccountId === undefined || !IamEntityIds.AccountId.is(providerAccountId)
              ? O.none()
              : yield* execute((client) =>
                  client
                    .select()
                    .from(IamDbSchema.account)
                    .where(
                      and(
                        eq(IamDbSchema.account.id, providerAccountId),
                        eq(IamDbSchema.account.userId, SharedEntityIds.UserId.make(userId)),
                        eq(IamDbSchema.account.providerId, providerId)
                      )
                    )
                ).pipe(Effect.map(A.head));

          return row.pipe(
            O.map((acc) => ({
              id: acc.id,
              providerId: acc.providerId,
              accountId: acc.accountId,
              userId: acc.userId,
              scope: O.fromNullable(acc.scope),
              accessTokenExpiresAt: O.fromNullable(acc.accessTokenExpiresAt ? toDate(acc.accessTokenExpiresAt) : null),
              refreshToken: O.fromNullable(acc.refreshToken),
            }))
          );
        }).pipe(
          Effect.mapError((error) =>
            error instanceof ProviderAccountSelectionRequiredError
              ? error
              : new OAuthAccountsError({
                  message: `Failed to get provider account: ${String(error)}`,
                })
          )
        ),
    },
  });
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
  Auth.Service | IamDb.Db | HttpServerRequest.HttpServerRequest
> = Effect.gen(function* () {
  const auth = yield* Auth.Service;
  const iamDb = yield* IamDb.Db;
  const request = yield* HttpServerRequest.HttpServerRequest;
  return yield* getAuthContext({
    auth,
    iamDb,
    headers: request.headers,
  });
});
export const AuthContextLayer = Layer.effect(AuthContext, contextLayerEffect);

export const AuthContextRpcMiddlewaresLayer = Layer.effect(
  AuthContextRpcMiddleware,
  Effect.gen(function* () {
    // Acquire dependencies during Layer construction
    const auth = yield* Auth.Service;
    const iamDb = yield* IamDb.Db;

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
/**
 * Creates the auth context from a session token.
 * Used by the HTTP middleware to validate cookies.
 */
const getAuthContextFromToken = Effect.fnUntraced(function* (
  auth: Auth.Auth,
  iamDb: IamDb.Shape,
  token: Redacted.Redacted
) {
  // Get session using the extracted token directly
  const { user, session } = yield* Effect.tryPromise({
    try: async () => {
      const result = await auth.api.getSession({
        headers: new Headers({
          cookie: `better-auth.session_token=${Redacted.value(token)}`,
        }),
      });
      return O.fromNullable(result).pipe(O.getOrThrow);
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
  const currentOrg = yield* iamDb
    .execute((client) =>
      client
        .select()
        .from(IamDbSchema.organization)
        .where(eq(IamDbSchema.organization.id, session.activeOrganizationId))
    )
    .pipe(
      Effect.flatMap(A.head),
      Effect.flatMap(S.decodeUnknown(Organization.Model)),
      Effect.mapError(() => new BeepError.Unauthorized({ message: "Organization not found" }))
    );

  const listProviderAccounts = ({ providerId, userId }: { readonly providerId: string; readonly userId: string }) =>
    iamDb
      .execute((client) =>
        client
          .select()
          .from(IamDbSchema.account)
          .where(
            and(
              eq(IamDbSchema.account.userId, SharedEntityIds.UserId.make(userId)),
              eq(IamDbSchema.account.providerId, providerId)
            )
          )
      )
      .pipe(
        Effect.map((rows) =>
          rows.map((acc) => ({
            providerAccountId: acc.id,
            accountId: acc.accountId ?? undefined,
            scope: acc.scope ?? undefined,
          }))
        ),
        Effect.mapError(
          (error) =>
            new OAuthAccountsError({
              message: `Failed to list provider accounts: ${String(error)}`,
            })
        )
      );

  return AuthContext.of({
    user,
    session,
    organization: currentOrg,
    oauth: {
      listProviderAccounts,

      getAccessToken: ({
        providerId,
        userId,
        providerAccountId,
      }: {
        providerId: string;
        userId: string;
        providerAccountId?: string | undefined;
      }) =>
        Effect.gen(function* () {
          if (providerId === "google" && providerAccountId === undefined) {
            const candidates = yield* listProviderAccounts({ providerId, userId }).pipe(
              Effect.mapError(
                (e) =>
                  new OAuthTokenError({
                    message: e.message,
                    providerId,
                  })
              )
            );
            return yield* new ProviderAccountSelectionRequiredError({
              providerId: "google",
              requiredParam: "providerAccountId",
              candidates,
              select: { callbackURL: "/settings?settingsTab=connections" },
              message: "providerAccountId is required",
            });
          }

          const token = yield* Effect.tryPromise({
            try: () =>
              auth.api.getAccessToken({
                body: { providerId, userId, ...(providerAccountId !== undefined && { accountId: providerAccountId }) },
              }),
            catch: (error) =>
              new OAuthTokenError({
                message: `Failed to get access token: ${String(error)}`,
                providerId,
              }),
          });

          return O.fromNullable(token?.accessToken ? { accessToken: token.accessToken } : null);
        }),

      getProviderAccount: ({
        providerId,
        userId,
        providerAccountId,
      }: {
        providerId: string;
        userId: string;
        providerAccountId?: string | undefined;
      }) =>
        Effect.gen(function* () {
          const selectedProviderAccountId = yield* requireProviderAccountId({
            providerId,
            providerAccountId,
            callbackURL: "/settings?settingsTab=connections",
            listCandidates: listProviderAccounts({ providerId, userId }),
          });

          const row =
            selectedProviderAccountId === undefined || !IamEntityIds.AccountId.is(selectedProviderAccountId)
              ? O.none()
              : yield* iamDb
                  .execute((client) =>
                    client
                      .select()
                      .from(IamDbSchema.account)
                      .where(
                        and(
                          eq(IamDbSchema.account.id, selectedProviderAccountId),
                          eq(IamDbSchema.account.userId, SharedEntityIds.UserId.make(userId)),
                          eq(IamDbSchema.account.providerId, providerId)
                        )
                      )
                  )
                  .pipe(Effect.map(A.head));

          return row.pipe(
            O.map((acc) => ({
              id: acc.id,
              providerId: acc.providerId,
              accountId: acc.accountId,
              userId: acc.userId,
              scope: O.fromNullable(acc.scope),
              accessTokenExpiresAt: O.fromNullable(acc.accessTokenExpiresAt ? toDate(acc.accessTokenExpiresAt) : null),
              refreshToken: O.fromNullable(acc.refreshToken),
            }))
          );
        }).pipe(
          Effect.mapError((error) =>
            error instanceof ProviderAccountSelectionRequiredError
              ? error
              : new OAuthAccountsError({
                  message: `Failed to get provider account: ${String(error)}`,
                })
          )
        ),
    },
  });
});

/**
 * Creates the middleware implementation for HTTP API security.
 * The implementation captures services and returns an Effect for each security handler.
 *
 * The return type is explicitly annotated to match the HttpApiMiddlewareSecurity type
 * expected by the AuthContextHttpMiddleware when security handlers are defined.
 */
const createHttpMiddlewareImpl = (auth: Auth.Auth, iamDb: IamDb.Shape): AuthContextHttpMiddlewareService => ({
  cookie: (token) => getAuthContextFromToken(auth, iamDb, token),
});

/**
 * Layer that provides the HTTP API middleware for cookie-based authentication.
 *
 * The implementation provides the cookie security handler that validates session
 * tokens and returns the AuthContextShape containing user, session, and organization.
 *
 * ## Type System Note
 *
 * HttpApiMiddleware.Tag uses conditional types to determine the service type:
 * - Without security: expects `Effect<Provides, E, HttpRouter.Provided>`
 * - With security: expects `{ [key: string]: (token) => Effect<Provides, E, HttpRouter.Provided> }`
 *
 * TypeScript cannot properly infer the conditional branch when the middleware class
 * is exported through module boundaries. The @ts-expect-error below acknowledges this
 * limitation while ensuring runtime correctness - the security handlers object IS
 * the correct implementation type for a middleware with security defined.
 */
export const AuthContextHttpMiddlewaresLayer = Layer.effect(
  AuthContextHttpMiddleware,
  Effect.map(
    Effect.all({
      auth: Auth.Service,
      iamDb: IamDb.Db,
    }),
    ({ auth, iamDb }) =>
      // AuthContextHttpMiddleware is defined with `security: { cookie: ... }` which means
      // the service type should be HttpApiMiddlewareSecurity, not HttpApiMiddleware.
      // The implementation below matches the required security handler signature.
      AuthContextHttpMiddleware.of(createHttpMiddlewareImpl(auth, iamDb))
  )
);

/**
 * Combined middleware layer for RPC and HTTP auth context.
 *
 * The middleware layers return Effect values that capture HttpServerRequest
 * at request time (deferred pattern), so they don't require HttpServerRequest
 * at layer construction time.
 */
export const authContextMiddlewareLayer = Layer.merge(AuthContextRpcMiddlewaresLayer, AuthContextHttpMiddlewaresLayer);

export type Services = AuthContextRpcMiddleware | AuthContextHttpMiddleware | Authentication.Services;

export const layer: Layer.Layer<Services, never, never> = authContextMiddlewareLayer.pipe(
  Layer.provideMerge(Authentication.layer)
);
