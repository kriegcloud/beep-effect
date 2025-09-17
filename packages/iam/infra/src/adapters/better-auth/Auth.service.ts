import { serverEnv } from "@beep/core-env/server";
import { IamDb } from "@beep/iam-infra/db/Db";
import { IamDbSchema } from "@beep/iam-tables";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import type { UnsafeTypes } from "@beep/types";
import { stripe } from "@better-auth/stripe";
import { dubAnalytics } from "@dub/better-auth";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import * as Layer from "effect/Layer";
import { nextCookies } from "better-auth/next-js";
import {
  admin,
  anonymous,
  apiKey,
  bearer,
  captcha,
  customSession,
  deviceAuthorization,
  genericOAuth,
  haveIBeenPwned,
  jwt,
  lastLoginMethod,
  mcp,
  multiSession,
  oAuthProxy,
  oidcProvider,
  oneTap,
  oneTimeToken,
  openAPI,
  phoneNumber,
  siwe,
  twoFactor,
  username,
} from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { sso } from "better-auth/plugins/sso";
import * as d from "drizzle-orm";
import { Dub } from "dub";
import * as A from "effect/Array";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import { Stripe } from "stripe";
import { AuthEmailService, SendResetPasswordEmailPayload } from "./AuthEmail.service";
import { commonExtraFields } from "./internal/common";
import { OrganizationPlugin } from "./internal/plugins";

// These are placeholders
// TODO MAKE REAL.
const PRO_PRICE_ID = {
  default: "price_1RoxnRHmTADgihIt4y8c0lVE",
  annual: "price_1RoxnoHmTADgihItzFvVP8KT",
} as const;

const PLUS_PRICE_ID = {
  default: "price_1RoxnJHmTADgihIthZTLmrPn",
  annual: "price_1Roxo5HmTADgihItEbJu5llL",
} as const;

const AuthOptions = Effect.flatMap(
  Effect.all([IamDb.IamDb, OrganizationPlugin, AuthEmailService]),
  ([{ db }, organizationPlugin, { sendResetPassword }]) =>
    Effect.succeed({
      database: drizzleAdapter(db, { provider: "pg", usePlural: false }),
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
          const program = Effect.flatMap(
            S.decode(SendResetPasswordEmailPayload)({
              username: params.user.name,
              url: params.url,
              email: params.user.email,
            }),
            sendResetPassword
          );
          // TODO figure this out
          await Effect.runPromise(program);
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
        admin(),
        anonymous(),
        apiKey(),
        bearer(),
        captcha({
          provider: "google-recaptcha",
          secretKey: Redacted.value(serverEnv.cloud.google.captcha.secretKey),
        }),
        customSession(async (session) => ({
          ...session,
          user: {
            ...session.user,
            dd: "test",
          },
        })),
        genericOAuth({
          config: [
            {
              providerId: "google",
              clientId: Redacted.value(serverEnv.oauth.provider.google.clientId),
              clientSecret: Redacted.value(serverEnv.oauth.provider.google.clientSecret),
            },
          ],
        }),
        haveIBeenPwned(),
        jwt(),
        mcp({
          loginPage: "/sign-in", // path to your login page
        }),
        multiSession(),
        oAuthProxy(),
        oidcProvider({
          loginPage: "/sign-in",
        }),
        oneTap(),
        oneTimeToken(),
        openAPI(),
        organizationPlugin,
        passkey({ rpID: serverEnv.app.domain, rpName: `${serverEnv.app.name} Auth` }),
        phoneNumber(),
        siwe({
          domain: serverEnv.app.domain,
          getNonce: async () => {
            return "beep";
          },
          verifyMessage: async (args) => {
            return true;
          },
        }),
        sso(),
        twoFactor(),
        nextCookies(),
        username(),
        stripe({
          stripeClient: new Stripe(Redacted.value(serverEnv.payment.stripe.key) || "sk_test_"),
          stripeWebhookSecret: Redacted.value(serverEnv.payment.stripe.webhookSecret),
          subscription: {
            enabled: false,
            allowReTrialsForDifferentPlans: true,
            plans: [
              {
                name: "plus",
                priceId: PLUS_PRICE_ID.default,
                annualDiscountPriceId: PLUS_PRICE_ID.annual,
                freeTrial: {
                  days: 7,
                },
              },
              {
                name: "pro",
                priceId: PRO_PRICE_ID.default,
                annualDiscountPriceId: PRO_PRICE_ID.annual,
                freeTrial: {
                  days: 7,
                },
              },
            ],
          },
        }),
        dubAnalytics({
          dubClient: new Dub({ token: Redacted.value(serverEnv.marketing.dub.token) }),
        }),
        deviceAuthorization(),
        lastLoginMethod(),
      ],
      databaseHooks: {
        user: {
          create: {
            after: async (user) => {
              const personalOrgId = SharedEntityIds.OrganizationId.create();
              const personalMemberId = IamEntityIds.MemberId.create();
              const slug = `${user.name?.toLowerCase().replace(/\s+/g, "-") || "user"}-${user.id.slice(-6)}`;

              const program = Effect.gen(function* () {
                yield* db.insert(IamDbSchema.organizationTable).values({
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
                yield* db.insert(IamDbSchema.memberTable).values({
                  id: personalMemberId,
                  userId: S.decodeUnknownSync(IamEntityIds.UserId)(user.id),
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
                    orgId: IamDbSchema.organizationTable.id,
                    orgName: IamDbSchema.organizationTable.name,
                    orgType: IamDbSchema.organizationTable.type,
                    isPersonal: IamDbSchema.organizationTable.isPersonal,
                    subscriptionTier: IamDbSchema.organizationTable.subscriptionTier,
                    role: IamDbSchema.memberTable.role,
                    memberStatus: IamDbSchema.memberTable.status,
                  })
                  .from(IamDbSchema.memberTable)
                  .innerJoin(
                    IamDbSchema.organizationTable,
                    d.eq(IamDbSchema.memberTable.organizationId, IamDbSchema.organizationTable.id)
                  )
                  .where(
                    d.and(
                      d.eq(IamDbSchema.memberTable.userId, session.userId),
                      d.eq(IamDbSchema.memberTable.status, "active")
                    )
                  )
                  .orderBy(d.desc(IamDbSchema.organizationTable.isPersonal));
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
        modelName: IamEntityIds.UserId.tableName,
        additionalFields: {
          ...commonExtraFields,
        },
      },

      advanced: {
        database: {
          generateId: false,
        },
      },
    } satisfies BetterAuthOptions)
);

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
