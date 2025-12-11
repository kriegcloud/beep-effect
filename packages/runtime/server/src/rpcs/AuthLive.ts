import { AuthProviderNameValue } from "@beep/constants";
import * as IamEntities from "@beep/iam-domain/entities";
import * as Member from "@beep/iam-domain/entities/Member";
import {
  AuthEmailService,
  SendResetPasswordEmailPayload,
  SendVerificationEmailPayload,
} from "@beep/iam-infra/adapters/better-auth/AuthEmail.service";
import { commonExtraFields } from "@beep/iam-infra/adapters/better-auth/common";
import { AllPlugins } from "@beep/iam-infra/adapters/better-auth/plugins/plugins";
import type { AuthOptionsEffect, AuthServiceEffect, Opts } from "@beep/iam-infra/adapters/better-auth/types";
import { IamDb } from "@beep/iam-infra/db/Db";
import { IamDbSchema } from "@beep/iam-tables";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Organization from "@beep/shared-domain/entities/Organization";
import type { Db } from "@beep/shared-infra/Db";
import type { ResendService } from "@beep/shared-infra/internal/email/adapters";
import { serverEnv } from "@beep/shared-infra/ServerEnv";
import type { UnsafeTypes } from "@beep/types";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as d from "drizzle-orm";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Equal from "effect/Equal";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as LogLevel from "effect/LogLevel";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Redacted from "effect/Redacted";
import * as Runtime from "effect/Runtime";
import * as S from "effect/Schema";

const AuthOptions: AuthOptionsEffect = Effect.gen(function* () {
  const { client, execute } = yield* IamDb.IamDb;
  const { sendResetPassword, sendVerification, sendChangeEmailVerification } = yield* AuthEmailService;
  const plugins = yield* AllPlugins;
  const isDebug = P.or(Equal.equals(LogLevel.Debug), Equal.equals(LogLevel.All))(serverEnv.app.logLevel);

  const runtime = yield* Effect.runtime();
  const runPromise = Runtime.runPromise(runtime);

  const opts: Opts = {
    telemetry: {
      debug: isDebug,
    },
    database: drizzleAdapter(client, {
      debugLogs: isDebug,
      provider: "pg",
      usePlural: false,
      schema: IamDbSchema,
      camelCase: true,
    }),
    baseURL: serverEnv.app.authUrl.toString(),
    basePath: "/api/auth",
    appName: serverEnv.app.name,
    secret: Redacted.value(serverEnv.auth.secret),
    trustedOrigins: [...serverEnv.security.trustedOrigins],
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
        trustedProviders: serverEnv.oauth.authProviderNames,
      },
      encryptOAuthTokens: true,
      storeAccountCookie: true,
    },
    session: {
      modelName: SharedEntityIds.SessionId.tableName,
      additionalFields: {
        ...commonExtraFields,
        activeTeamId: {
          type: "string",
          required: false,
        },
        activeOrganizationId: {
          type: "string",
          required: false,
        },
      },
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
              url: params.url,
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
      serverEnv.oauth.authProviderNames,
      {} as {
        [K in keyof BetterAuthOptions["socialProviders"]]: Exclude<BetterAuthOptions["socialProviders"][K], undefined>;
      },
      (acc, provider) => ({
        ...acc,
        ...F.pipe(serverEnv.oauth.provider[provider], (providerParams) =>
          O.isSome(providerParams.clientSecret) && O.isSome(providerParams.clientId)
            ? {
                [provider]: {
                  clientId: Redacted.value(providerParams.clientId.value),
                  clientSecret: Redacted.value(providerParams.clientSecret.value),
                  ...AuthProviderNameValue.configMap[provider],
                },
              }
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
                createdBy: user.id,
                source: "auto_created",
              };
              yield* execute((client) =>
                client.insert(IamDbSchema.organization).values({
                  id: personalOrgId,
                  name: `${user.name || "User"}'s Organization`,
                  slug,
                  type: Organization.OrganizationTypeEnum.individual,
                  ownerUserId: SharedEntityIds.UserId.make(user.id),
                  isPersonal: true,
                  subscriptionTier: Organization.SubscriptionTierEnum.free,
                  subscriptionStatus: Organization.SubscriptionStatusEnum.active,
                  ...commonFieldValues,
                })
              );
              yield* execute((client) =>
                client.insert(IamDbSchema.member).values({
                  id: personalMemberId,
                  userId: S.decodeUnknownSync(SharedEntityIds.UserId)(user.id),
                  organizationId: personalOrgId,
                  role: Member.MemberRoleEnum.owner,
                  status: IamEntities.Member.MemberStatusEnum.active,
                  joinedAt: now,
                  ...commonFieldValues,
                })
              );
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
            const program = execute((client) =>
              client
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
                .orderBy(d.desc(IamDbSchema.organization.isPersonal))
            );

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
      changeEmail: {
        enabled: true,
        sendChangeEmailVerification: async ({ newEmail, url }) => {
          await runPromise(
            sendChangeEmailVerification({
              email: BS.Email.make(newEmail),
              url: BS.Url.make(url),
            })
          );
        },
      },
      modelName: SharedEntityIds.UserId.tableName,
      additionalFields: {
        uploadLimit: {
          type: "number",
          required: false,
        },
        stripeCustomerId: {
          type: "string",
          required: false,
        },
        lastLoginMethod: {
          type: "string",
          required: false,
        },
        role: {
          type: "string",
          required: false,
        },
        isAnonymous: {
          type: "boolean",
          required: false,
        },
        twoFactorEnabled: {
          type: "boolean",
          required: false,
        },
        phoneNumberVerified: {
          type: "boolean",
          required: false,
        },
        banned: {
          type: "boolean",
          required: false,
        },
        banExpires: {
          type: "date",
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

const authServiceEffect: AuthServiceEffect = Effect.gen(function* () {
  const authOptions = yield* AuthOptions;

  const auth = betterAuth<Opts>(authOptions);

  return {
    auth,
  } as const;
});

export class AuthService extends Effect.Service<AuthService>()("AuthService", {
  dependencies: [AuthEmailService.DefaultWithoutDependencies, IamDb.IamDb.Live],
  effect: authServiceEffect.pipe(
    Effect.catchTags({
      ConfigError: Effect.die,
      SqlError: Effect.die,
    })
  ),
}) {
  static readonly layer: Layer.Layer<
    AuthEmailService | AuthService,
    never,
    IamDb.IamDb | Db.SliceDbRequirements | ResendService
  > = AuthService.Default.pipe(Layer.provideMerge(AuthEmailService.Default));
}
