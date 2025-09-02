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
        // const userOrgs = await db.select({
        //   orgId: DbTypes.schema.organization.id,
        //   orgName: DbTypes.schema.organization.name,
        // })
        console.log(`custom session`, JSON.stringify(session, null, 2));
        return {
          ...session,
          user: {
            ...session.user,
            dd: "test",
          },
        };
      }),
    ],
  }) satisfies BetterAuthOptions;

export class AuthService extends Effect.Service<AuthService>()("AuthService", {
  effect: Effect.gen(function* () {
    const { db } = yield* IamDb.IamDb;

    return betterAuth(makeAuthOptions(db));
  }),
}) {}
