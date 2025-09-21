import { serverEnv } from "@beep/core-env/server";
import { IamDb } from "@beep/iam-infra/db/Db";
import { IamDbSchema } from "@beep/iam-tables";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import type { UnsafeTypes } from "@beep/types";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as d from "drizzle-orm";
import * as A from "effect/Array";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import { AuthEmailService, SendResetPasswordEmailPayload } from "./AuthEmail.service";
import { commonExtraFields } from "./internal";
import { AllPlugins } from "./plugins";

const AuthOptions = Effect.gen(function* () {
  const { db, drizzle } = yield* IamDb.IamDb;
  const plugins = yield* AllPlugins;
  const { sendResetPassword } = yield* AuthEmailService;

  return yield* Effect.succeed({
    database: drizzleAdapter(drizzle, {
      debugLogs: true,
      provider: "pg",
      usePlural: false,
      schema: IamDbSchema,
      camelCase: true,
    }),
    baseURL: serverEnv.app.authUrl.toString(),
    basePath: "/api/auth",
    appName: serverEnv.app.name,
    secret: Redacted.value(serverEnv.auth.secret),
    trustedOrigins: serverEnv.security.trustedOrigins,
    rateLimit: {
      enabled: true,
      window: 10, // time window in seconds
      max: 100, // max requests in the window
    },
    account: {
      accountLinking: {
        enabled: true,
        allowDifferentEmails: true,
        trustedProviders: serverEnv.oauth.authProviderNames,
      },
      encryptOAuthTokens: true,
    },
    session: {
      modelName: IamEntityIds.SessionId.tableName,
      additionalFields: {
        ...commonExtraFields,
      },
      cookieCache: {
        enabled: true,
        maxAge: Duration.days(30).pipe(Duration.toSeconds),
      },
      expiresIn: Duration.days(30).pipe(Duration.toSeconds),
      updateAge: Duration.days(1).pipe(Duration.toSeconds),
    },
    emailAndPassword: {
      requireEmailVerification: false,
      enabled: true,
      sendResetPassword: async (params) => {
        await Effect.flatMap(
          S.decode(SendResetPasswordEmailPayload)({
            username: params.user.name,
            url: params.url,
            email: params.user.email,
          }),
          sendResetPassword
        ).pipe(Effect.runPromise);
      },
    },
    socialProviders: A.reduce(
      serverEnv.oauth.authProviderNames,
      {} as BetterAuthOptions["socialProviders"],
      (acc, provider) =>
        ({
          ...acc,
          [provider]: {
            clientSecret: Redacted.value(serverEnv.oauth.provider[provider].clientSecret),
            clientId: Redacted.value(serverEnv.oauth.provider[provider].clientId),
          },
        }) satisfies BetterAuthOptions["socialProviders"]
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
              yield* db.insert(IamDbSchema.organization).values({
                id: personalOrgId,
                name: `${user.name || "User"}'s Organization`,
                slug,
                type: "individual",
                ownerUserId: SharedEntityIds.UserId.make(user.id),
                isPersonal: true,
                subscriptionTier: "free",
                subscriptionStatus: "active",
                createdBy: user.id,
                source: "auto_created",
                createdAt: new Date(),
                updatedAt: new Date(),
              });
              yield* db.insert(IamDbSchema.member).values({
                id: personalMemberId,
                userId: S.decodeUnknownSync(SharedEntityIds.UserId)(user.id),
                organizationId: personalOrgId,
                role: "owner",
                status: "active",
                joinedAt: new Date(),
                createdBy: user.id,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            });
            // Create personal organization with multi-tenant field

            // Add user as owner with enhanced tracking
            await Effect.runPromise(program);
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

            const userOrgs = await Effect.runPromise(program);
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
        ...commonExtraFields,
      },
    },

    advanced: {
      database: {
        generateId: false,
      },
    },
  } satisfies BetterAuthOptions);
});

export type Options = Effect.Effect.Success<typeof AuthOptions>;

export class AuthService extends Effect.Service<AuthService>()("AuthService", {
  accessors: true,
  dependencies: [AuthEmailService.DefaultWithoutDependencies, IamDb.IamDb.Live],
  effect: Effect.flatMap(AuthOptions, (opts) =>
    Effect.succeed({
      auth: betterAuth(opts),
    })
  ),
}) {}
