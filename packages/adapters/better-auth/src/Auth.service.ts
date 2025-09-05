import { serverEnv } from "@beep/env/server";
import { IamDb } from "@beep/iam-db";
import { IamDbSchema } from "@beep/iam-tables";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import {
  anonymous,
  apiKey,
  bearer,
  customSession,
  haveIBeenPwned,
  jwt,
  mcp,
  multiSession,
  oidcProvider,
  oneTap,
  oneTimeToken,
  openAPI,
} from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { sso } from "better-auth/plugins/sso";
import * as d from "drizzle-orm";
import * as A from "effect/Array";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import { v4 as uuid } from "uuid";
import { AuthEmailService, SendResetPasswordEmailPayload } from "./AuthEmail.service";
import { commonExtraFields } from "./internal/common";
import { OrganizationPlugin } from "./internal/plugins";

const AuthOptions = Effect.gen(function* () {
  const { db } = yield* IamDb.IamDb;
  const organizationPlugin = yield* OrganizationPlugin;
  return {
    database: drizzleAdapter(db, { provider: "pg", usePlural: true }),
    baseURL: serverEnv.app.authUrl.toString(),
    basePath: "/api/auth",
    appName: serverEnv.app.name,
    secret: Redacted.value(serverEnv.auth.secret),
    trustedOrigins: serverEnv.security.trustedOrigins,
    account: {
      accountLinking: {
        enabled: true,
        allowDifferentEmails: true,
        trustedProviders: serverEnv.oauth.authProviderNames,
      },
      encryptOAuthTokens: true,
    },
    session: {
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
        const { serverRuntime } = await import("@beep/better-auth/lib/server-runtime");
        const program = Effect.gen(function* () {
          const { sendResetPassword } = yield* AuthEmailService;

          const decoded = yield* S.decode(SendResetPasswordEmailPayload)({
            username: params.user.name,
            url: params.url,
            email: params.user.email,
          });

          yield* sendResetPassword(decoded);
        });

        await serverRuntime.runPromise(program);
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
    plugins: [
      organizationPlugin,
      passkey({ rpID: serverEnv.app.domain, rpName: `${serverEnv.app.name} Auth` }),
      openAPI(),
      mcp({
        loginPage: "/sign-in", // path to your login page
      }),
      apiKey(),
      bearer(),
      haveIBeenPwned(),
      oneTimeToken(),
      sso(),
      nextCookies(),
      jwt(),
      anonymous(),
      multiSession(),
      oneTap(),
      oidcProvider({
        loginPage: "/sign-in",
      }),
      customSession(async (session) => ({
        ...session,
        user: {
          ...session.user,
          dd: "test",
        },
      })),
    ],
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            const personalOrgId = uuid();
            const slug = `${user.name?.toLowerCase().replace(/\s+/g, "-") || "user"}-${user.id.slice(-6)}`;

            // Create personal organization with multi-tenant fields
            await db.insert(IamDbSchema.organization).values({
              id: personalOrgId,
              name: `${user.name || "User"}'s Organization`,
              slug,
              type: "individual",
              ownerUserId: user.id,
              isPersonal: true,
              subscriptionTier: "free",
              subscriptionStatus: "active",
              createdBy: user.id,
              source: "auto_created",
              createdAt: new Date(),
              updatedAt: new Date(),
            });

            // Add user as owner with enhanced tracking
            await db.insert(IamDbSchema.member).values({
              id: uuid(),
              userId: user.id,
              organizationId: personalOrgId,
              role: "owner",
              status: "active",
              joinedAt: new Date(),
              createdBy: user.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          },
        },
      },
      session: {
        create: {
          before: async (session) => {
            // Set active organization context using enhanced fields
            const userOrgs = await db
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
              .innerJoin(IamDbSchema.organization, d.eq(IamDbSchema.member.organizationId, IamDbSchema.organization.id))
              .where(d.and(d.eq(IamDbSchema.member.userId, session.userId), d.eq(IamDbSchema.member.status, "active")))
              .orderBy(d.desc(IamDbSchema.organization.isPersonal)); // Personal orgs first

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
              {} as Record<string, any>
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
      additionalFields: {
        ...commonExtraFields,
      },
    },
  } satisfies BetterAuthOptions;
});

export type Options = Effect.Effect.Success<typeof AuthOptions>;

export class AuthService extends Effect.Service<AuthService>()("AuthService", {
  effect: Effect.gen(function* () {
    const opts: Options = yield* AuthOptions;
    return betterAuth(opts);
  }) as Effect.Effect<ReturnType<typeof betterAuth<Options>>>,
}) {}
