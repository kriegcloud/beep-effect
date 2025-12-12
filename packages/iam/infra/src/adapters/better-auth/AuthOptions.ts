import { AuthProviderNameValue, EnvValue } from "@beep/constants";
import * as IamEntities from "@beep/iam-domain/entities";
import * as Member from "@beep/iam-domain/entities/Member";
import { IamDb } from "@beep/iam-infra/db/Db";
import { IamDbSchema } from "@beep/iam-tables";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Organization from "@beep/shared-domain/entities/Organization";
import { serverEnv } from "@beep/shared-infra/ServerEnv";
import { LangValueToAdapterLocale } from "@beep/ui-core/i18n/constants";
import { detectLanguage } from "@beep/ui-core/i18n/server";
import { dubAnalytics } from "@dub/better-auth";
import type { BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins/admin";
import { anonymous } from "better-auth/plugins/anonymous";
import { deviceAuthorization } from "better-auth/plugins/device-authorization";
import { genericOAuth } from "better-auth/plugins/generic-oauth";
import { haveIBeenPwned } from "better-auth/plugins/haveibeenpwned";
import type {
  Member as BetterAuthMember,
  Organization as BetterAuthOrganization,
  Invitation,
} from "better-auth/plugins/organization";
import type { User } from "better-auth/types";
import * as d from "drizzle-orm";
import * as A from "effect/Array";
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
import {
  AuthEmailService,
  type AuthEmailServiceShape,
  InvitationEmailPayload,
  SendResetPasswordEmailPayload,
  SendVerificationEmailPayload,
} from "./AuthEmail.service";

// import * as SCIM from "@better-auth/scim";

import { passkey } from "@better-auth/passkey";
import { sso } from "@better-auth/sso";
import { stripe } from "@better-auth/stripe";
import { nextCookies } from "better-auth/next-js";
import { apiKey, bearer, captcha, lastLoginMethod, oneTap, openAPI } from "better-auth/plugins";
import { jwt } from "better-auth/plugins/jwt";
import { multiSession } from "better-auth/plugins/multi-session";
import { oAuthProxy } from "better-auth/plugins/oauth-proxy";
import { oidcProvider } from "better-auth/plugins/oidc-provider";
import { oneTimeToken } from "better-auth/plugins/one-time-token";
import { organization } from "better-auth/plugins/organization";
import { phoneNumber } from "better-auth/plugins/phone-number";
import { siwe } from "better-auth/plugins/siwe";
import { twoFactor } from "better-auth/plugins/two-factor";
import { username } from "better-auth/plugins/username";
import { localization } from "better-auth-localization";
import { Dub } from "dub";
import * as Data from "effect/Data";
import { Stripe } from "stripe";
export class LocalizationError extends Data.TaggedError("NextCookiesError")<{
  readonly type: "failed_to_detect_language" | "unknown";
  readonly message: string;
  readonly cause: unknown;
}> {}

const normalizeUrl = (url: { toString: () => string }, fallback: { toString: () => string }) => {
  const urlString = url.toString();
  try {
    return new URL(urlString).origin;
  } catch {
    return new URL(fallback.toString()).origin;
  }
};

const PRO_PRICE_ID = {
  default: "price_1RoxnRHmTADgihIt4y8c0lVE",
  annual: "price_1RoxnoHmTADgihItzFvVP8KT",
} as const;

const PLUS_PRICE_ID = {
  default: "price_1RoxnJHmTADgihIthZTLmrPn",
  annual: "price_1Roxo5HmTADgihItEbJu5llL",
} as const;
export type Options = ReturnType<typeof makeOptions>;

export const makeOptions = ({
  iamDb,
  emailService,
  runPromise,
}: {
  iamDb: IamDb.Shape;
  emailService: AuthEmailServiceShape;
  runPromise: <A, E>(
    effect: Effect.Effect<A, E, never>,
    options?:
      | {
          readonly signal?: AbortSignal;
        }
      | undefined
  ) => Promise<A>;
}) => {
  const { client, execute } = iamDb;
  const { sendResetPassword, sendInvitation, sendVerification, sendChangeEmailVerification } = emailService;
  const isDebug = P.or(Equal.equals(LogLevel.Debug), Equal.equals(LogLevel.All))(serverEnv.app.logLevel);
  const fallback = serverEnv.app.clientUrl;
  const productionURL = serverEnv.app.projectProductionUrl ?? fallback;
  const currentURL = serverEnv.app.baseUrl ?? fallback;
  return {
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
    basePath: "/api/v1/auth",
    appName: serverEnv.app.name,
    secret: Redacted.value(serverEnv.auth.secret),
    trustedOrigins: [...serverEnv.security.trustedOrigins],
    rateLimit: {
      enabled: true,
      window: 10, // time window in seconds
      max: 100, // max requests in the window
    },
    account: {
      additionalFields: {
        _rowId: {
          type: "number",
          required: false,
        },
        deletedAt: {
          type: "date",
          required: false,
        },
        updatedAt: {
          type: "date",
          required: false,
        },
        createdAt: {
          type: "date",
          required: false,
        },
        createdBy: {
          type: "string",
          required: false,
        },
        updatedBy: {
          type: "string",
          required: false,
        },
        deletedBy: {
          type: "string",
          required: false,
        },
        version: {
          type: "number",
          required: false,
        },
        source: {
          type: "string",
          required: false,
        },
      },
      accountLinking: {
        enabled: true,
        allowDifferentEmails: true,
        trustedProviders: serverEnv.oauth.authProviderNames,
      },
      encryptOAuthTokens: true,
      storeAccountCookie: true,
      storeStateStrategy: "cookie",
    },
    session: {
      modelName: SharedEntityIds.SessionId.tableName,
      additionalFields: {
        _rowId: {
          type: "number",
          required: false,
        },
        deletedAt: {
          type: "date",
          required: false,
        },
        updatedAt: {
          type: "date",
          required: false,
        },
        createdAt: {
          type: "date",
          required: false,
        },
        createdBy: {
          type: "string",
          required: false,
        },
        updatedBy: {
          type: "string",
          required: false,
        },
        deletedBy: {
          type: "string",
          required: false,
        },
        version: {
          type: "number",
          required: false,
        },
        source: {
          type: "string",
          required: false,
        },
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
        maxAge: Duration.days(7).pipe(Duration.toSeconds),
        strategy: "jwe", // can be "jwt" or "compact"
        refreshCache: true,
      },
      expiresIn: Duration.days(30).pipe(Duration.toSeconds),
      updateAge: Duration.days(1).pipe(Duration.toSeconds),
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
    user: {
      changeEmail: {
        enabled: true,
        sendChangeEmailVerification: async (params: { newEmail: string; url: string }) => {
          const { newEmail, url } = params;
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
        _rowId: {
          type: "number",
          required: false,
        },
        deletedAt: {
          type: "date",
          required: false,
        },
        updatedAt: {
          type: "date",
          required: false,
        },
        createdAt: {
          type: "date",
          required: false,
        },
        createdBy: {
          type: "string",
          required: false,
        },
        updatedBy: {
          type: "string",
          required: false,
        },
        deletedBy: {
          type: "string",
          required: false,
        },
        version: {
          type: "number",
          required: false,
        },
        source: {
          type: "string",
          required: false,
        },
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendVerificationEmail: async (params: { user: User; url: string; token: string }) =>
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
      sendResetPassword: async (params: { user: User; url: string; token: string }) =>
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
    databaseHooks: {
      user: {
        create: {
          after: async (
            user: {
              id: string;
              createdAt: Date;
              updatedAt: Date;
              email: string;
              emailVerified: boolean;
              name: string;
              image?: string | null | undefined;
            } & Record<string, unknown>
          ) => {
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
          before: async (
            session: {
              id: string;
              createdAt: Date;
              updatedAt: Date;
              userId: string;
              expiresAt: Date;
              token: string;
              ipAddress?: string | null | undefined;
              userAgent?: string | null | undefined;
            } & Record<string, unknown>
          ) => {
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

            const organizationContext = A.reduce(
              userOrgs,
              {} as {
                readonly name: string;
                readonly type: Organization.OrganizationType.Type;
                readonly role: Member.MemberRole.Type;
                readonly isPersonal: boolean;
                readonly subscriptionTier: Organization.SubscriptionTier.Type;
              },
              (acc, org) => ({
                ...acc,
                [org.orgId]: {
                  name: org.orgName,
                  type: org.orgType,
                  role: org.role,
                  isPersonal: org.isPersonal,
                  subscriptionTier: org.subscriptionTier,
                },
              })
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
    plugins: [
      username(),
      twoFactor(),
      stripe({
        stripeClient: new Stripe(Redacted.value(serverEnv.payment.stripe.key) || "sk_test_"),
        stripeWebhookSecret: Redacted.value(serverEnv.payment.stripe.webhookSecret),
        subscription: {
          enabled: false,
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
      siwe({
        domain: serverEnv.app.domain,
        getNonce: async () => {
          return "beep";
        },
        verifyMessage: async (_args: {
          message: string;
          signature: string;
          address: string;
          chainId: number;
          cacao?:
            | {
                h: {
                  t: "caip122";
                };
                p: {
                  domain: string;
                  aud: string;
                  nonce: string;
                  iss: string;
                  version?: string | undefined;
                  iat?: string | undefined;
                  nbf?: string | undefined;
                  exp?: string | undefined;
                  statement?: string | undefined;
                  requestId?: string | undefined;
                  resources?: string[] | undefined;
                  type?: string | undefined;
                };
                s: {
                  t: "eip191" | "eip1271";
                  s: string;
                  m?: string | undefined;
                };
              }
            | undefined;
        }) => {
          return false;
        },
      }),
      sso({}),
      passkey({
        rpID: serverEnv.app.env === EnvValue.Enum.dev ? "localhost" : serverEnv.app.domain,
        rpName: `${serverEnv.app.name} Auth`,
      }),
      phoneNumber(
        //  {} satisfies PhoneNumberOptions
      ),
      organization({
        allowUserToCreateOrganization: true,
        organizationLimit: 1,
        creatorRole: "owner",
        membershipLimit: 2,
        sendInvitationEmail: async (params: {
          id: string;
          role: string;
          email: string;
          organization: BetterAuthOrganization;
          invitation: Invitation;
          inviter: BetterAuthMember & {
            user: User;
          };
        }) =>
          void (await Effect.flatMap(
            S.decode(InvitationEmailPayload)({
              email: params.email,
              invitedByUsername: params.inviter.user.name,
              invitedByEmail: params.inviter.user.email,
              teamName: params.organization.name,
            }),
            sendInvitation
          ).pipe(runPromise)),
        teams: {
          enabled: true,
          maximumTeams: 10,
          allowRemovingAllTeams: false,
        },
        cancelPendingInvitationsOnReInvite: true,
        requireEmailVerificationOnInvitation: true,
        schema: {
          organization: {
            additionalFields: {
              type: {
                type: "string",
                required: true,
                defaultValue: Organization.OrganizationTypeEnum.individual,
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
                type: "json", // jsonb in DB
                required: false,
              },
              settings: {
                type: "json", // jsonb in DB
                required: false,
              },
              subscriptionTier: {
                type: "string",
                required: false,
                defaultValue: Organization.SubscriptionTierEnum.free,
              },
              subscriptionStatus: {
                type: "string",
                required: false,
                defaultValue: Organization.SubscriptionStatusEnum.active,
              },
              _rowId: {
                type: "number",
                required: false,
              },
              deletedAt: {
                type: "date",
                required: false,
              },
              updatedAt: {
                type: "date",
                required: false,
              },
              createdAt: {
                type: "date",
                required: false,
              },
              createdBy: {
                type: "string",
                required: false,
              },
              updatedBy: {
                type: "string",
                required: false,
              },
              deletedBy: {
                type: "string",
                required: false,
              },
              version: {
                type: "number",
                required: false,
              },
              source: {
                type: "string",
                required: false,
              },
            },
          },
          member: {
            additionalFields: {
              // Enhanced member tracking fields (see iam/tables/src/tables/member.table.ts)
              status: { type: "string", required: true, defaultValue: "active" },
              invitedBy: { type: "string", required: false },
              invitedAt: { type: "date", required: false },
              joinedAt: { type: "date", required: false },
              lastActiveAt: { type: "date", required: false },
              permissions: { type: "string", required: false }, // JSON string
              _rowId: {
                type: "number",
                required: false,
              },
              deletedAt: {
                type: "date",
                required: false,
              },
              updatedAt: {
                type: "date",
                required: false,
              },
              createdAt: {
                type: "date",
                required: false,
              },
              createdBy: {
                type: "string",
                required: false,
              },
              updatedBy: {
                type: "string",
                required: false,
              },
              deletedBy: {
                type: "string",
                required: false,
              },
              version: {
                type: "number",
                required: false,
              },
              source: {
                type: "string",
                required: false,
              },
            },
          },
          invitation: {
            additionalFields: {
              _rowId: {
                type: "number",
                required: false,
              },
              deletedAt: {
                type: "date",
                required: false,
              },
              updatedAt: {
                type: "date",
                required: false,
              },
              createdAt: {
                type: "date",
                required: false,
              },
              createdBy: {
                type: "string",
                required: false,
              },
              updatedBy: {
                type: "string",
                required: false,
              },
              deletedBy: {
                type: "string",
                required: false,
              },
              version: {
                type: "number",
                required: false,
              },
              source: {
                type: "string",
                required: false,
              },
            },
          },
          team: {
            additionalFields: {
              // Align with shared team table (see shared/tables/src/tables/team.table.ts)
              description: { type: "string", required: false },
              metadata: { type: "string", required: false },
              logo: { type: "string", required: false },
              _rowId: {
                type: "number",
                required: false,
              },
              deletedAt: {
                type: "date",
                required: false,
              },
              updatedAt: {
                type: "date",
                required: false,
              },
              createdAt: {
                type: "date",
                required: false,
              },
              createdBy: {
                type: "string",
                required: false,
              },
              updatedBy: {
                type: "string",
                required: false,
              },
              deletedBy: {
                type: "string",
                required: false,
              },
              version: {
                type: "number",
                required: false,
              },
              source: {
                type: "string",
                required: false,
              },
            },
          },
          organizationRole: {
            additionalFields: {
              _rowId: {
                type: "number",
                required: false,
              },
              deletedAt: {
                type: "date",
                required: false,
              },
              updatedAt: {
                type: "date",
                required: false,
              },
              createdAt: {
                type: "date",
                required: false,
              },
              createdBy: {
                type: "string",
                required: false,
              },
              updatedBy: {
                type: "string",
                required: false,
              },
              deletedBy: {
                type: "string",
                required: false,
              },
              version: {
                type: "number",
                required: false,
              },
              source: {
                type: "string",
                required: false,
              },
            },
          },
        },
        dynamicAccessControl: {
          enabled: true,
        },
        organizationHooks: {
          beforeCreateOrganization: async (params: {
            organization: {
              name?: string;
              slug?: string;
              logo?: string;
              metadata?: Record<string, any>;
              [p: string]: any;
            };
            user: User & Record<string, any>;
          }) => {
            const { organization, user } = params;
            return {
              data: {
                ...organization,
                type: Organization.OrganizationTypeEnum.team, // User-created orgs are team type
                ownerUserId: user.id,
                isPersonal: false, // User-created orgs are not personal
                subscriptionTier: Organization.SubscriptionTierEnum.free, // Default subscription
                subscriptionStatus: Organization.SubscriptionStatusEnum.active,
                source: "user_created",
              },
            };
          },
          afterCreateOrganization: async ({ organization, member, user }) => {
            // Set proper member tracking fields for the organization creator
            const program = Effect.gen(function* () {
              const nowUtc = yield* DateTime.now;
              const now = DateTime.toDate(nowUtc);
              return yield* execute((client) =>
                client
                  .update(IamDbSchema.member)
                  .set({
                    status: Organization.SubscriptionStatusEnum.active,
                    joinedAt: now,
                    lastActiveAt: now,
                  })
                  .where(d.eq(IamDbSchema.member.id, S.decodeUnknownSync(IamEntityIds.MemberId)(member.id)))
              );
            }).pipe(
              Effect.match({
                onSuccess: () => console.log(`Team organization ${organization.name} created for user ${user.id}`),
                onFailure: (e) =>
                  console.error(`Failed to create team organization ${organization.name} for user ${user.id}: ${e}`),
              })
            );
            await runPromise(program);
          },
        },
      }),
      openAPI(),
      oneTimeToken(),
      oneTap({
        clientId: F.pipe(
          serverEnv.oauth.provider.google.clientId,
          O.match({
            onNone: () => "not a real client id",
            onSome: (id) => Redacted.value(id),
          })
        ),
      }),
      oidcProvider({
        loginPage: "/sign-in",
      }),
      oAuthProxy({
        productionURL: normalizeUrl(productionURL, fallback),
        currentURL: normalizeUrl(currentURL, fallback),
      }),
      multiSession(),
      localization({
        defaultLocale: "default",
        fallbackLocale: "default",
        getLocale: async () =>
          F.pipe(
            Effect.tryPromise({
              try: detectLanguage,
              catch: (e) =>
                new LocalizationError({
                  type: "failed_to_detect_language",
                  cause: e,
                  message: "Failed to detect language",
                }),
            }),
            Effect.flatMap(S.decode(LangValueToAdapterLocale)),
            Effect.tapError((e) => Effect.logError(e)),
            Effect.orElseSucceed(() => "default" as const),
            Effect.runPromise
          ),
      }),
      lastLoginMethod(),
      jwt(),
      haveIBeenPwned({
        customPasswordCompromisedMessage:
          "The password you entered has been compromised. Please choose a different password.",
      }),
      // _scim,
      genericOAuth({
        config: [],
      }),
      dubAnalytics({
        dubClient: new Dub({ token: Redacted.value(serverEnv.marketing.dub.token) }),
      }),
      deviceAuthorization({
        expiresIn: "3min",
        interval: "5s",
        deviceCodeLength: 40,
        userCodeLength: 8,
      }),
      captcha({
        provider: "google-recaptcha" as const,
        secretKey: Redacted.value(serverEnv.cloud.google.captcha.secretKey),
      }),
      bearer(),
      apiKey(),
      anonymous(),
      admin(),
      nextCookies(),
    ],
  } satisfies BetterAuthOptions;
};

export const AuthOptions = Effect.gen(function* () {
  const iamDb = yield* IamDb.IamDb;
  const emailService = yield* AuthEmailService;

  const runtime = yield* Effect.runtime();
  const runPromise = Runtime.runPromise(runtime);

  return makeOptions({
    iamDb,
    emailService,
    runPromise,
  });
}).pipe(Effect.orDie);
