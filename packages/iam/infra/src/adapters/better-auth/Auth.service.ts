import type { AuthProviderNameValue } from "@beep/constants";
import * as IamEntities from "@beep/iam-domain/entities";
import * as Member from "@beep/iam-domain/entities/Member";
import { IamConfig } from "@beep/iam-infra/config";
import { IamDb } from "@beep/iam-infra/db/Db";
import { IamDbSchema } from "@beep/iam-tables";
import { BS } from "@beep/schema";
import { EntitySource, IamEntityIds, paths, SharedEntityIds } from "@beep/shared-domain";
import * as Organization from "@beep/shared-domain/entities/Organization";
import type { UnsafeTypes } from "@beep/types";
import type { SqlError } from "@effect/sql/SqlError";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as d from "drizzle-orm";
import * as A from "effect/Array";
import type { ConfigError } from "effect/ConfigError";
import * as Data from "effect/Data";
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Equal from "effect/Equal";
import * as F from "effect/Function";
import * as LogLevel from "effect/LogLevel";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Redacted from "effect/Redacted";
import * as Runtime from "effect/Runtime";
import * as S from "effect/Schema";
import { headers as nextHeaders } from "next/headers";
import { AuthEmailService, SendResetPasswordEmailPayload, SendVerificationEmailPayload } from "./AuthEmail.service";
import { type CommonExtraFields, commonExtraFields } from "./internal";
import { AllPlugins } from "./plugins";
import type { Plugins } from "./plugins/plugins";

export type ReadonlyHeaders = Headers & {
  /** @deprecated Method unavailable on `ReadonlyHeaders`. Read more: https://nextjs.org/docs/app/api-reference/functions/headers */
  append(...args: UnsafeTypes.UnsafeAny[]): void;
  /** @deprecated Method unavailable on `ReadonlyHeaders`. Read more: https://nextjs.org/docs/app/api-reference/functions/headers */
  set(...args: UnsafeTypes.UnsafeAny[]): void;
  /** @deprecated Method unavailable on `ReadonlyHeaders`. Read more: https://nextjs.org/docs/app/api-reference/functions/headers */
  delete(...args: UnsafeTypes.UnsafeAny[]): void;
};
type Opts = Omit<BetterAuthOptions, "account" | "session" | "plugins" | "user"> & {
  account: {
    additionalFields: CommonExtraFields;
    accountLinking: {
      enabled: boolean;
      allowDifferentEmails: boolean;
      trustedProviders: AuthProviderNameValue.Type[];
    };
    encryptOAuthTokens: boolean;
  };
  session: {
    modelName: typeof IamEntityIds.SessionId.tableName;
    additionalFields: CommonExtraFields;
    cookieCache: {
      enabled: true;
      maxAge: number;
    };
    expiresIn: number;
    updateAge: number;
  };
  plugins: Plugins;
  user: {
    modelName: typeof SharedEntityIds.UserId.tableName;
    additionalFields: CommonExtraFields & {
      gender: {
        type: "string";
        required: true;
      };
      secondaryEmailAddress: {
        type: "string";
        required: false;
      };
    };
  };
};

const AuthOptions: Effect.Effect<Opts, never, IamDb.IamDb | AuthEmailService | IamConfig> = Effect.gen(function* () {
  const { db, drizzle } = yield* IamDb.IamDb;
  const { sendResetPassword, sendVerification } = yield* AuthEmailService;
  const plugins = yield* AllPlugins;
  const config = yield* IamConfig;
  const isDebug = P.or(Equal.equals(LogLevel.Debug), Equal.equals(LogLevel.All))(config.app.logLevel);

  const runtime = yield* Effect.runtime();
  const runPromise = Runtime.runPromise(runtime);

  const opts: Opts = {
    telemetry: {
      debug: isDebug,
    },
    database: drizzleAdapter(drizzle, {
      debugLogs: isDebug,
      provider: "pg",
      usePlural: false,
      schema: IamDbSchema,
      camelCase: true,
    }),
    baseURL: config.app.authUrl.toString(),
    basePath: "/api/auth",
    appName: config.app.name,
    secret: Redacted.value(config.auth.secret),
    trustedOrigins: [...config.security.trustedOrigins],
    rateLimit: {
      enabled: true,
      window: 10, // time window in seconds
      max: 100, // max requests in the window
    },
    account: {
      additionalFields: commonExtraFields,
      accountLinking: {
        enabled: true,
        allowDifferentEmails: true,
        trustedProviders: config.oauth.authProviderNames,
      },
      encryptOAuthTokens: true,
    },
    session: {
      modelName: IamEntityIds.SessionId.tableName,
      additionalFields: commonExtraFields,
      cookieCache: {
        enabled: true,
        maxAge: Duration.days(30).pipe(Duration.toSeconds),
      },
      expiresIn: Duration.days(30).pipe(Duration.toSeconds),
      updateAge: Duration.days(1).pipe(Duration.toSeconds),
    },
    emailVerification: {
      sendOnSignUp: true,
      sendVerificationEmail: async (params) =>
        void (await runPromise(
          Effect.flatMap(
            S.decode(SendVerificationEmailPayload)({
              email: params.user.email,
              url: BS.Url.make(
                `${config.app.clientUrl}${paths.auth.verification.email.verify(params.token)}`
              ).toString(),
            }),
            sendVerification
          ).pipe(Effect.withSpan("AuthService.emailVerification.sendVerificationEmail"))
        )),
    },
    emailAndPassword: {
      requireEmailVerification: false,
      enabled: true,
      sendResetPassword: async (params) =>
        void (await runPromise(
          Effect.flatMap(
            S.decode(SendResetPasswordEmailPayload)({
              username: params.user.name,
              url: params.url,
              email: params.user.email,
            }),
            sendResetPassword
          ).pipe(Effect.withSpan("AuthService.emailAndPassword.sendResetPassword"))
        )),
    },
    socialProviders: A.reduce(
      config.oauth.authProviderNames,
      {} as BetterAuthOptions["socialProviders"],
      (acc, provider) => ({
        ...acc,
        ...F.pipe(config.oauth.provider[provider], (providerParams) =>
          O.isSome(providerParams.clientSecret) && O.isSome(providerParams.clientId)
            ? { [provider]: providerParams }
            : {}
        ),
      })
    ),
    plugins,
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            const personalOrgId = SharedEntityIds.OrganizationId.create();
            const personalMemberId = IamEntityIds.MemberId.create();
            const slug = `${user.name?.toLowerCase().replace(/\s+/g, "-") || "user"}-${user.id.slice(-6)}`;

            const program = Effect.gen(function* () {
              const now = yield* DateTime.now.pipe(Effect.flatMap((now) => Effect.succeed(DateTime.toDate(now))));
              const commonFieldValues = {
                updateAt: now,
                createdAt: now,
                createdBy: user.id,
                source: EntitySource.Enum.auto_created,
              };
              yield* db.insert(IamDbSchema.organization).values({
                id: personalOrgId,
                name: `${user.name || "User"}'s Organization`,
                slug,
                type: Organization.OrganizationTypeEnum.individual,
                ownerUserId: SharedEntityIds.UserId.make(user.id),
                isPersonal: true,
                subscriptionTier: Organization.SubscriptionTierEnum.free,
                subscriptionStatus: Organization.SubscriptionStatusEnum.active,
                ...commonFieldValues,
              });
              yield* db.insert(IamDbSchema.member).values({
                id: personalMemberId,
                userId: S.decodeUnknownSync(SharedEntityIds.UserId)(user.id),
                organizationId: personalOrgId,
                role: Member.MemberRoleEnum.owner,
                status: IamEntities.Member.MemberStatusEnum.active,
                joinedAt: now,
                ...commonFieldValues,
              });
            });
            // Create personal organization with multi-tenant field

            // Add user as owner with enhanced tracking
            await runPromise(program.pipe(Effect.withSpan("AuthService.databaseHooks.user.create.after")));
          },
        },
      },
      session: {
        create: {
          before: async (session) => {
            // Set active organization context using enhanced fields
            const program = Effect.gen(function* () {
              return yield* db
                .select({
                  orgId: IamDbSchema.organization.id,
                  orgName: IamDbSchema.organization.name,
                  orgType: IamDbSchema.organization.type,
                  isPersonal: IamDbSchema.organization.isPersonal,
                  subscriptionTier: IamDbSchema.organization.subscriptionTier,
                  role: IamDbSchema.member.role,
                  memberStatus: IamDbSchema.member.status,
                })
                .from(IamDbSchema.member)
                .innerJoin(
                  IamDbSchema.organization,
                  d.eq(IamDbSchema.member.organizationId, IamDbSchema.organization.id)
                )
                .where(
                  d.and(
                    d.eq(IamDbSchema.member.userId, SharedEntityIds.UserId.make(session.userId)),
                    d.eq(IamDbSchema.member.status, "active")
                  )
                )
                .orderBy(d.desc(IamDbSchema.organization.isPersonal));
            });

            const userOrgs = await runPromise(
              program.pipe(Effect.withSpan("AuthService.databaseHooks.session.create.before"))
            );
            const activeOrgId = userOrgs[0]?.orgId;
            const organizationContext = userOrgs.reduce(
              (acc, org) => {
                acc[org.orgId] = {
                  name: org.orgName,
                  type: org.orgType,
                  role: org.role,
                  isPersonal: org.isPersonal,
                  subscriptionTier: org.subscriptionTier,
                };
                return acc;
              },
              // TODO type me
              {} as Record<string, UnsafeTypes.UnsafeAny>
            );

            return {
              data: {
                ...session,
                activeOrganizationId: activeOrgId,
                organizationContext: JSON.stringify(organizationContext),
              },
            };
          },
        },
      },
    },
    user: {
      modelName: SharedEntityIds.UserId.tableName,
      additionalFields: {
        gender: {
          type: "string",
          required: true,
        },
        secondaryEmailAddress: {
          type: "string",
          required: false,
        },
        ...commonExtraFields,
      },
    },

    advanced: {
      database: {
        generateId: false,
      },
      defaultCookieAttributes: {
        httpOnly: true,
        partitioned: true,
        sameSite: "none",
        secure: true,
      },
    },
  } as const;
  return opts;
});

export type Auth = ReturnType<typeof betterAuth<Opts>>;
export type $Infer = Auth["$Infer"];
export type Session = $Infer["Session"];
export type User = $Infer["User"];

export class AuthServiceError extends Data.TaggedError("AuthServiceError")<{
  readonly cause: unknown;
  readonly message: string;
}> {}

const authServiceEffect: Effect.Effect<
  {
    readonly auth: () => Auth;
    readonly getSession: () => Effect.Effect<Session, AuthServiceError, never>;
    readonly listSessions: () => Effect.Effect<Session[], AuthServiceError, never>;
    readonly getHeadersEffect: () => Effect.Effect<ReadonlyHeaders, AuthServiceError, never>;
  },
  SqlError | ConfigError,
  AuthEmailService | IamDb.IamDb | IamConfig
> = Effect.gen(function* () {
  const authOptions = yield* AuthOptions;
  const auth = betterAuth(authOptions);

  const runtime = yield* Effect.runtime();
  const runPromise = Runtime.runPromise(runtime);
  const getHeadersEffect = Effect.tryPromise({
    try: async (): Promise<ReadonlyHeaders> => await nextHeaders(),
    catch: (e) =>
      new AuthServiceError({
        cause: e,
        message: "Failed to get headers",
      }),
  }).pipe(Effect.tapError(Effect.logError), Effect.withSpan(`AuthService.getHeadersEffect`));
  const getHeaders: () => Promise<ReadonlyHeaders> = () =>
    getHeadersEffect.pipe(Effect.withSpan("AuthService.getHeaders"), runPromise);

  const getSession: () => Effect.Effect<Session, AuthServiceError, never> = () =>
    Effect.tryPromise({
      try: async (): Promise<Session> => await auth.api.getSession({ headers: await getHeaders() }),
      catch: (e) =>
        new AuthServiceError({
          cause: e,
          message: "Failed to get session",
        }),
    }).pipe(Effect.tapError(Effect.logError), Effect.withSpan(`AuthService.getSession`));

  const listSessions: () => Effect.Effect<Session[], AuthServiceError, never> = () =>
    Effect.tryPromise({
      try: async () => await auth.api.listSessions({ headers: await getHeaders() }),
      catch: (e) =>
        new AuthServiceError({
          cause: e,
          message: "Failed to list sessions",
        }),
    }).pipe(Effect.tapError(Effect.logError), Effect.withSpan(`AuthService.listSessions`));

  return yield* Effect.succeed({
    auth: () => auth,
    getSession,
    listSessions,
    getHeadersEffect: () => getHeadersEffect,
  });
});

export class AuthService extends Effect.Service<AuthService>()("AuthService", {
  dependencies: [AuthEmailService.DefaultWithoutDependencies, IamDb.IamDb.Live, IamConfig.Live],
  effect: authServiceEffect,
}) {}
