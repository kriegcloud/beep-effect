import { DbError } from "@beep/db-scope/errors";
import { serverEnv } from "@beep/env/server";
import { IamDb } from "@beep/iam-db";
import { IamDbSchema } from "@beep/iam-tables";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import {
  // admin,
  anonymous,
  apiKey,
  bearer,
  // captcha,
  customSession,
  // genericOAuth,
  haveIBeenPwned,
  jwt,
  mcp,
  multiSession,
  // oAuthProxy,
  oidcProvider,
  oneTap,
  oneTimeToken,
  openAPI,
  organization,
} from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { sso } from "better-auth/plugins/sso";
import * as d from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as A from "effect/Array";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import type * as pg from "pg";
import { v4 as uuid } from "uuid";
import { AuthEmailService } from "./AuthEmail.service";

const makeAuthOptions = (
  db: NodePgDatabase<typeof IamDbSchema> & {
    $client: pg.Pool;
  }
): BetterAuthOptions =>
  ({
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

          yield* sendResetPassword({
            user: {
              username: params.user.name,
              email: params.user.email,
            },
            url: params.url,
            token: params.token,
          });
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
      organization({
        teams: {
          enabled: true,
          maximumTeams: 10,
          allowRemovingAllTeams: false,
        },
        sendInvitationEmail: async (params) => {
          const { serverRuntime } = await import("@beep/better-auth/lib/server-runtime");
          const program = Effect.gen(function* () {
            const { sendInvitation } = yield* AuthEmailService;
            yield* sendInvitation(params);
          });

          await serverRuntime.runPromise(program);
        },
        schema: {
          organization: {
            additionalFields: {
              type: {
                type: "string",
                required: true,
              },
              ownerUserId: {
                type: "string",
                required: false,
              },
              isPersonal: {
                type: "boolean",
                required: true,
              },
              maxMembers: {
                type: "number",
                required: false,
              },
              features: {
                type: "string", // JSON string
                required: false,
              },
              settings: {
                type: "string", // JSON string
                required: false,
              },
              subscriptionTier: {
                type: "string",
                required: false,
              },
              subscriptionStatus: {
                type: "string",
                required: false,
              },
            },
          },
          member: {
            additionalFields: {
              status: {
                type: "string",
                required: true,
              },
              invitedBy: {
                type: "string",
                required: false,
              },
              invitedAt: {
                type: "date",
                required: false,
              },
              joinedAt: {
                type: "date",
                required: false,
              },
              lastActiveAt: {
                type: "date",
                required: false,
              },
              permissions: {
                type: "string", // JSON string
                required: false,
              },
            },
          },
        },
        organizationCreation: {
          beforeCreate: async ({ organization, user }) => {
            return {
              data: {
                ...organization,
                type: "team", // User-created orgs are team type
                ownerUserId: user.id,
                isPersonal: false, // User-created orgs are not personal
                subscriptionTier: "free", // Default subscription
                subscriptionStatus: "active",
                source: "user_created",
              },
            };
          },
          afterCreate: async ({ organization, member, user }) => {
            const { serverRuntime } = await import("@beep/better-auth/lib/server-runtime");
            // Set proper member tracking fields for the organization creator
            const program = Effect.tryPromise({
              try: () =>
                db
                  .update(IamDbSchema.member)
                  .set({
                    status: "active",
                    joinedAt: new Date(),
                    lastActiveAt: new Date(),
                  })
                  .where(d.eq(IamDbSchema.member.id, member.id)),
              catch: (e) => DbError.match(e),
            });
            await serverRuntime.runPromise(program);

            console.log(`Team organization ${organization.name} created for user ${user.id}`);
          },
        },
      }),
      passkey({
        rpID: serverEnv.app.domain,
        rpName: `${serverEnv.app.name} Auth`,
      }),
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
      // genericOAuth(),
      // admin({
      //   adminUserIds: authEnv.app.adminUserIds,
      // }),
      multiSession(),
      oneTap(),
      // oAuthProxy({
      //   /**
      //    * Auto-inference blocked by https://github.com/better-auth/better-auth/pull/2891
      //    */
      //   currentURL: serverEnv.app.authUrl.toString(),
      //   productionURL: productionUrl,
      // }),
      oidcProvider({
        loginPage: "/sign-in",
      }),
      customSession(async (session) => {
        return {
          ...session,
          user: {
            ...session.user,
            dd: "test",
          },
        };
      }),
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
  }) satisfies BetterAuthOptions;

export type Options = ReturnType<typeof makeAuthOptions>;

export class AuthService extends Effect.Service<AuthService>()("AuthService", {
  effect: Effect.gen(function* () {
    const { db } = yield* IamDb.IamDb;

    return betterAuth(makeAuthOptions(db));
  }),
}) {}
