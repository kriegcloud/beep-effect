import { AuthProviderNameValue, EnvValue } from "@beep/constants";
import * as IamEntities from "@beep/iam-domain/entities";
import * as Member from "@beep/iam-domain/entities/Member";
import { IamDb } from "@beep/iam-server/db/Db";
import { IamDbSchema } from "@beep/iam-tables";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Organization from "@beep/shared-domain/entities/Organization";
import { serverEnv } from "@beep/shared-env/ServerEnv";
import { LangValueToAdapterLocale } from "@beep/ui-core/i18n/constants";
import { detectLanguage } from "@beep/ui-core/i18n/server";
import { oauthProvider } from "@better-auth/oauth-provider";
import { passkey } from "@better-auth/passkey";
import { scim } from "@better-auth/scim";
import { sso } from "@better-auth/sso";
import { stripe } from "@better-auth/stripe";
import type { Auth, BetterAuthOptions, BetterAuthPlugin } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { apiKey, bearer,
  // captcha,
  lastLoginMethod, oneTap, openAPI } from "better-auth/plugins";
import { admin } from "better-auth/plugins/admin";
import { anonymous } from "better-auth/plugins/anonymous";
import { deviceAuthorization } from "better-auth/plugins/device-authorization";
import { genericOAuth } from "better-auth/plugins/generic-oauth";
import { haveIBeenPwned } from "better-auth/plugins/haveibeenpwned";
import { jwt } from "better-auth/plugins/jwt";
import { multiSession } from "better-auth/plugins/multi-session";
import { oAuthProxy } from "better-auth/plugins/oauth-proxy";
import { oneTimeToken } from "better-auth/plugins/one-time-token";
import { organization } from "better-auth/plugins/organization";
import { phoneNumber } from "better-auth/plugins/phone-number";
import { siwe } from "better-auth/plugins/siwe";
import { twoFactor } from "better-auth/plugins/two-factor";
import { username } from "better-auth/plugins/username";
import { localization } from "better-auth-localization";
import * as d from "drizzle-orm";
import * as A from "effect/Array";
// import {Dub} from "dub";
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
import { Stripe } from "stripe";
import {
  AuthEmailService,
  type AuthEmailServiceShape,
  InvitationEmailPayload,
  SendResetPasswordEmailPayload,
  SendVerificationEmailPayload,
} from "./Emails";

export class LocalizationError extends Data.TaggedError("LocalizationError")<{
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

const additionalFieldsCommon = {
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
} as const;
export const makeAuth = ({
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
}): Auth => {
  const { client, execute } = iamDb;
  const { sendResetPassword, sendInvitation, sendVerification, sendChangeEmailVerification } = emailService;
  const isDebug = P.or(Equal.equals(LogLevel.Debug), Equal.equals(LogLevel.All))(serverEnv.app.logLevel);
  const fallback = serverEnv.app.clientUrl;
  const productionURL = serverEnv.app.projectProductionUrl ?? fallback;
  const currentURL = serverEnv.app.baseUrl ?? fallback;
  return betterAuth({
    telemetry: {
      debug: isDebug,
    },
    database: drizzleAdapter(client, {
      debugLogs: isDebug,
      provider: "pg",
      usePlural: false,
      schema: {
        shared_user: IamDbSchema.user,
        shared_organization: IamDbSchema.organization,
        shared_team: IamDbSchema.team,
        iam_account: IamDbSchema.account,
        shared_session: IamDbSchema.session,
        iam_wallet_address: IamDbSchema.walletAddress,
        iam_verification: IamDbSchema.verification,
        iam_two_factor: IamDbSchema.twoFactor,
        iam_team_member: IamDbSchema.teamMember,
        iam_subscription: IamDbSchema.subscription,
        iam_sso_provider: IamDbSchema.ssoProvider,
        iam_scim_provider: IamDbSchema.scimProvider,
        iam_rate_limit: IamDbSchema.rateLimit,
        iam_oauth_consent: IamDbSchema.oauthConsent,
        iam_oauth_client: IamDbSchema.oauthClient,
        iam_oauth_access_token: IamDbSchema.oauthAccessToken,
        iam_oauth_refresh_token: IamDbSchema.oauthRefreshToken,
        iam_passkey: IamDbSchema.passkey,
        iam_organization_role: IamDbSchema.organizationRole,
        iam_member: IamDbSchema.member,
        iam_jwks: IamDbSchema.jwks,
        iam_device_code: IamDbSchema.deviceCode,
        iam_invitation: IamDbSchema.invitation,
        iam_api_key: IamDbSchema.apiKey,
      },
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
      modelName: IamEntityIds.RateLimitId.tableName,
    },
    account: {
      modelName: IamEntityIds.AccountId.tableName,
      // NOTE: Better Auth account model does NOT support additionalFields in core options.
      // The Table.make default columns (_rowId, deletedAt, createdBy, updatedBy, deletedBy,
      // version, source) exist in our Drizzle schema but cannot be reflected in Better Auth's
      // API schema. These columns are handled at the database level only.
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
      // Required by oauthProvider plugin - ensures sessions are stored in DB
      storeSessionInDatabase: true,
      additionalFields: {
        ...additionalFieldsCommon,
        // Plugin-managed fields (organization)
        activeOrganizationId: {
          type: "string",
          required: false,
        },
        activeTeamId: {
          type: "string",
          required: false,
        },
        // Plugin-managed fields (admin)
        impersonatedBy: {
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
      defaultCookieAttributes:
        serverEnv.app.env === EnvValue.Enum.dev
          ? {
              httpOnly: true,
              sameSite: "lax",
              secure: false,
            }
          : {
              httpOnly: true,
              partitioned: true,
              sameSite: "none",
              secure: true,
            },
    },
    user: {
      changeEmail: {
        enabled: true,
        sendChangeEmailVerification: async (params) => {
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
        // Custom fields
        uploadLimit: {
          type: "number",
          required: false,
        },
        stripeCustomerId: {
          type: "string",
          required: false,
        },
        // Plugin-managed fields (admin)
        role: {
          type: "string",
          required: false,
        },
        banned: {
          type: "boolean",
          required: false,
        },
        banReason: {
          type: "string",
          required: false,
        },
        banExpires: {
          type: "date",
          required: false,
        },
        // Plugin-managed fields (anonymous)
        isAnonymous: {
          type: "boolean",
          required: false,
        },
        // Plugin-managed fields (phoneNumber)
        phoneNumber: {
          type: "string",
          required: false,
        },
        phoneNumberVerified: {
          type: "boolean",
          required: false,
        },
        // Plugin-managed fields (twoFactor)
        twoFactorEnabled: {
          type: "boolean",
          required: false,
        },
        // Plugin-managed fields (username)
        username: {
          type: "string",
          required: false,
        },
        displayUsername: {
          type: "string",
          required: false,
        },
        // Plugin-managed fields (lastLoginMethod)
        lastLoginMethod: {
          type: "string",
          required: false,
        },
        ...additionalFieldsCommon,
      },
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
              program.pipe(Effect.withSpan("Auth.Service.databaseHooks.session.create.before"))
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
      // Schema configuration: PARTIAL support (modelName + fields only)
      // - additionalFields NOT supported by this plugin
      // - OrgTable.make defaults (_rowId, deletedAt, createdAt, updatedAt, createdBy,
      //   updatedBy, deletedBy, version, source) exist in DB but are not exposed via
      //   Better Auth API. These provide audit trail at database level only.
      // See: packages/iam/tables/src/tables/twoFactor.table.ts
      twoFactor(),
      // Schema configuration: PARTIAL support (modelName + fields only)
      // - additionalFields NOT supported by this plugin (InferOptionSchema)
      // - OrgTable.make defaults (_rowId, deletedAt, createdAt, updatedAt, createdBy,
      //   updatedBy, deletedBy, version, source, organizationId) exist in DB but are
      //   not exposed via Better Auth API.
      // - Custom column not in Better Auth core schema:
      //   - stripeSubscriptionId (text) - additional Stripe subscription identifier
      // - Core fields: plan, referenceId, stripeCustomerId, status, periodStart,
      //   periodEnd, cancelAtPeriodEnd, seats
      // See: packages/iam/tables/src/tables/subscription.table.ts
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
      // Schema configuration: PARTIAL support (modelName + fields only)
      // - additionalFields NOT supported by this plugin (InferOptionSchema)
      // - Table.make defaults (_rowId, deletedAt, createdAt, updatedAt, createdBy,
      //   updatedBy, deletedBy, version, source) exist in DB but are not exposed via
      //   Better Auth API.
      // - Custom columns not in Better Auth core schema:
      //   - chainId (integer) - blockchain chain ID for multi-chain support
      //   - isPrimary (boolean) - flag to identify user's primary wallet
      // - Core fields: id, address, userId, createdAt
      // - Unique constraint on (userId, address, chainId) for multi-chain wallets
      // See: packages/iam/tables/src/tables/walletAddress.table.ts
      siwe({
        domain: serverEnv.app.domain,
        getNonce: async () => {
          // Generate cryptographically secure random nonce to prevent replay attacks
          const randomBytes = crypto.getRandomValues(new Uint8Array(32));
          return Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
        },
        verifyMessage: async () => {
          // TODO: Implement proper SIWE message verification
          // This currently disables SIWE authentication - implement with viem or ethers.js
          // to verify the signature before enabling in production
          return false;
        },
      }),
      // Schema configuration: MINIMAL support (direct properties on options, not InferOptionSchema)
      // - Only modelName and fields supported (via direct properties)
      // - additionalFields NOT supported by this plugin
      // - Table.make defaults (_rowId, deletedAt, createdAt, updatedAt, createdBy,
      //   updatedBy, deletedBy, version, source) exist in DB but are not exposed via
      //   Better Auth API.
      // - Custom column not in Better Auth core schema:
      //   - providerId (text, unique) - unique identifier for the SSO provider
      // - Core fields: id, issuer, oidcConfig, samlConfig, userId, organizationId, domain
      // See: packages/iam/tables/src/tables/ssoProvider.table.ts
      sso({}),
      // Schema configuration: PARTIAL support (modelName + fields only)
      // - additionalFields NOT supported by this plugin
      // - Table.make defaults (_rowId, deletedAt, updatedAt, createdBy, updatedBy,
      //   deletedBy, version, source) exist in DB but are not exposed via Better Auth API.
      // - Custom column `aaguid` (Authenticator Attestation GUID) exists in Drizzle but
      //   is not part of Better Auth's passkey plugin schema.
      // - Core Better Auth fields (id, name, publicKey, userId, credentialID, counter,
      //   deviceType, backedUp, transports, createdAt) are handled by the plugin.
      // See: packages/iam/tables/src/tables/passkey.table.ts
      passkey({
        rpID: serverEnv.app.env === EnvValue.Enum.dev ? "localhost" : serverEnv.app.domain,
        rpName: `${serverEnv.app.name} Auth`,
      }),
      oauthProvider({
        loginPage: "/sign-in",
        consentPage: "/consent",
      }) as BetterAuthPlugin,
      phoneNumber(
        //  {} satisfies PhoneNumberOptions
      ),
      organization({
        allowUserToCreateOrganization: true,
        organizationLimit: 1,
        creatorRole: "owner",
        membershipLimit: 2,
        sendInvitationEmail: async (params) =>
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
          verification: {
            modelName: IamEntityIds.VerificationId.tableName,
            additionalFields: additionalFieldsCommon,
          },
          organization: {
            modelName: SharedEntityIds.OrganizationId.tableName,
            additionalFields: {
              type: {
                type: "string",
                required: false,
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
              ...additionalFieldsCommon,
            },
          },
          member: {
            modelName: IamEntityIds.MemberId.tableName,
            additionalFields: {
              // Enhanced member tracking fields (see iam/tables/src/tables/member.table.ts)
              status: { type: "string", required: true, defaultValue: "active" },
              invitedBy: { type: "string", required: false },
              invitedAt: { type: "date", required: false },
              joinedAt: { type: "date", required: false },
              lastActiveAt: { type: "date", required: false },
              permissions: { type: "string", required: false }, // JSON string
              ...additionalFieldsCommon,
            },
          },
          invitation: {
            modelName: IamEntityIds.InvitationId.tableName,
            additionalFields: {
              // Align with iam/tables/src/tables/invitation.table.ts
              teamId: { type: "string", required: false }, // Optional team-specific invitation
              ...additionalFieldsCommon,
            },
          },
          team: {
            modelName: SharedEntityIds.TeamId.tableName,
            additionalFields: {
              // Align with shared team table (see shared/tables/src/tables/team.table.ts)
              // NOTE: slug is notNull in Drizzle but marked required: false here since
              // Better Auth doesn't auto-generate it. Callers should provide it or a
              // beforeCreateTeam hook should generate it from the name.
              slug: { type: "string", required: false },
              description: { type: "string", required: false },
              metadata: { type: "string", required: false },
              logo: { type: "string", required: false },
              ...additionalFieldsCommon,
            },
          },
          organizationRole: {
            modelName: IamEntityIds.OrganizationRoleId.tableName,
            additionalFields: {
              // Align with iam/tables/src/tables/organizationRole.table.ts
              role: { type: "string", required: true }, // Role name (e.g., 'admin', 'member')
              permission: { type: "string", required: true }, // Permission string for this role
              ...additionalFieldsCommon,
            },
          },
          teamMember: {
            modelName: IamEntityIds.TeamMemberId.tableName,
            // NOTE: Better Auth organization plugin does NOT support additionalFields for teamMember.
            // Custom columns beyond core fields (id, teamId, userId, createdAt) will work at the
            // database level but will NOT appear in Better Auth's OpenAPI documentation or be
            // validated/transformed by Better Auth. OrgTable.make defaults are still in the DB
            // but not exposed via the API.
          },
        },
        dynamicAccessControl: {
          enabled: true,
        },
        organizationHooks: {
          beforeCreateOrganization: async (params) => {
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
            Effect.tapError(Effect.logError),
            Effect.orElseSucceed(F.constant("default" as const)),
            Effect.runPromise
          ),
      }),
      lastLoginMethod(),
      // Schema configuration: PARTIAL support (modelName + fields only)
      // - additionalFields NOT supported by this plugin (InferOptionSchema)
      // - Table.make defaults (_rowId, deletedAt, createdAt, updatedAt, createdBy,
      //   updatedBy, deletedBy, version, source) exist in DB but are not exposed via
      //   Better Auth API.
      // - Custom column not in Better Auth core schema:
      //   - expiresAt (datetime) - key expiration timestamp for key rotation
      // - Core fields: id, publicKey, privateKey, createdAt
      // See: packages/iam/tables/src/tables/jwks.table.ts
      jwt({
        schema: {
          jwks: {
            modelName: IamEntityIds.JwksId.tableName,
          },
        },
      }),
      haveIBeenPwned({
        customPasswordCompromisedMessage:
          "The password you entered has been compromised. Please choose a different password.",
      }),
      genericOAuth({
        config: [],
      }),
      // Schema configuration: PARTIAL support (modelName + fields only)
      // - additionalFields NOT supported by this plugin (InferOptionSchema)
      // - Table.make defaults (_rowId, deletedAt, createdAt, updatedAt, createdBy,
      //   updatedBy, deletedBy, version, source) exist in DB but are not exposed via
      //   Better Auth API.
      // - Custom columns not in Better Auth core schema:
      //   - status (enum: pending, approved, denied) - authorization status with custom enum
      //   - pollingInterval (integer) - custom device-specific polling interval override
      // - Column naming note: Drizzle uses `scope` (singular), Better Auth uses `scopes` (plural)
      // - Core fields: deviceCode, userCode, userId, expiresAt, lastPolledAt, clientId, scopes
      // See: packages/iam/tables/src/tables/deviceCodes.table.ts
      deviceAuthorization({
        expiresIn: "3min",
        interval: "5s",
        deviceCodeLength: 40,
        userCodeLength: 8,
      }),
      scim(),
      bearer(),
      // Schema configuration: PARTIAL support (modelName + fields only)
      // - additionalFields NOT supported by this plugin
      // - OrgTable.make defaults (_rowId, deletedAt, createdAt, updatedAt, createdBy,
      //   updatedBy, deletedBy, version, source, organizationId) exist in DB but are
      //   not exposed via Better Auth API.
      // - Custom columns not in Better Auth core schema:
      //   - enabled (boolean) - soft enable/disable toggle
      //   - rateLimitEnabled, rateLimitTimeWindow, rateLimitMax - extended rate limiting
      //   - requestCount - usage tracking
      //   - permissions, metadata - authorization and custom data
      // - Column mapping notes:
      //   - Drizzle `key` maps to Better Auth `hashedSecret`
      //   - Drizzle `lastRequest` maps to Better Auth `lastUsedAt`
      // See: packages/iam/tables/src/tables/apiKey.table.ts
      apiKey(),
      anonymous(),
      admin(),
      // captcha({
      //   provider: "google-recaptcha", // or google-recaptcha, hcaptcha, captchafox
      //   secretKey: Redacted.value(serverEnv.cloud.google.captcha.secretKey),
      // }),
      nextCookies(),
    ],
  } satisfies BetterAuthOptions);
};

export const AuthEffect = Effect.gen(function* () {
  const iamDb = yield* IamDb.Db;
  const emailService = yield* AuthEmailService;

  const runtime = yield* Effect.runtime();
  const runPromise = Runtime.runPromise(runtime);

  return makeAuth({
    iamDb,
    emailService,
    runPromise,
  });
}).pipe(Effect.orDie);
