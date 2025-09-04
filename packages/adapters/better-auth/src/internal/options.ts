import { stripe } from "@better-auth/stripe";
import type { BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import {
  admin,
  anonymous,
  apiKey,
  bearer,
  captcha,
  customSession,
  emailOTP,
  genericOAuth,
  haveIBeenPwned,
  // jwt,
  magicLink,
  mcp,
  multiSession,
  oAuthProxy,
  oidcProvider,
  oneTap,
  oneTimeToken,
  openAPI,
  organization,
  phoneNumber,
  siwe,
  twoFactor,
  username,
} from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { sso } from "better-auth/plugins/sso";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Stripe } from "stripe";

export const makeOptions = (opts: BetterAuthOptions): BetterAuthOptions =>
  ({
    /**
     * Database configuration
     */
    database: drizzleAdapter(NodePgDatabase, {
      provider: "pg",
      schema: {},
    }),
    plugins: [
      emailOTP({
        sendVerificationOTP: async (params) => {},
      }),
      magicLink({
        sendMagicLink: async (params) => {},
      }),
      phoneNumber({
        sendOTP: async (params) => {},
      }),
      username(),
      siwe({
        domain: "http://localhost:3000",
        getNonce: async () => "Replace Me",
        verifyMessage: async () => true,
      }),
      captcha({
        provider: "google-recaptcha",
        secretKey: "REPLACE_ME",
      }),
      organization({
        teams: {
          enabled: true,
          maximumTeams: 10,
          allowRemovingAllTeams: false,
        },
        sendInvitationEmail: async (params) => {},
        // F.pipe(
        //   S.decodeUnknown(Contract.SendInvitationPayload, {exact: false})(
        //     params,
        //   ),
        //   Effect.flatMap(emailService.sendInvitationEmail),
        //   Effect.runPromise,
        // ),
        // Multi-tenant schema enhancements
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
        // Organization creation hooks
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
            // Set proper member tracking fields for the organization creator
            // await db
            //   .update(DbTypes.schema.member)
            //   .set({
            //     status: "active",
            //     joinedAt: new Date(),
            //     lastActiveAt: new Date(),
            //   })
            //   .where(d.eq(DbTypes.schema.member.id, member.id));
            //
            // console.log(
            //   `Team organization ${organization.name} created for user ${user.id}`,
            // );
          },
        },
      }),
      twoFactor(),
      passkey(),
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
      // jwt(),
      anonymous(),
      genericOAuth({
        config: [],
      }),
      admin({
        adminUserIds: [],
      }),
      multiSession(),
      oneTap(),
      oAuthProxy(),
      oidcProvider({
        loginPage: "/sign-in",
      }),
      customSession(async (session) => {
        console.log(`custom session`, JSON.stringify(session, null, 2));
        return {
          ...session,
          user: {
            ...session.user,
            dd: "test",
          },
        };
      }),
      stripe({
        stripeClient: new Stripe("replace-me"),
        stripeWebhookSecret: "replace-me",
        subscription: {
          enabled: false,
          allowReTrialsForDifferentPlans: true,
          plans: [],
        },
      }),
    ],
    /**
     * The name of the application
     *
     * process.env.APP_NAME
     *
     * @default "Better Auth"
     */
    appName: opts.appName,
    /**
     * Base URL for the Better Auth. This is typically the
     * root URL where your application server is hosted.
     * If not explicitly set,
     * the system will check the following environment variable:
     *
     * process.env.BETTER_AUTH_URL
     *
     * If not set it will throw an error.
     */
    baseURL: opts.baseURL,
    /**
     * Base path for the Better Auth. This is typically
     * the path where the
     * Better Auth routes are mounted.
     *
     * @default "/api/auth"
     */
    basePath: opts.basePath,
    /**
     * The secret to use for encryption,
     * signing and hashing.
     *
     * By default Better Auth will look for
     * the following environment variables:
     * process.env.BETTER_AUTH_SECRET,
     * process.env.AUTH_SECRET
     * If none of these environment
     * variables are set,
     * it will default to
     * "better-auth-secret-123456789".
     *
     * on production if it's not set
     * it will throw an error.
     *
     * you can generate a good secret
     * using the following command:
     * @example
     * ```bash
     * openssl rand -base64 32
     * ```
     */
    secret: opts.secret,

    /**
     * Secondary storage configuration
     *
     * This is used to store session and rate limit data.
     */
    secondaryStorage: opts.secondaryStorage,
    /**
     * Email verification configuration
     */
    emailVerification: {
      /**
       * Send a verification email
       * @param data the data object
       * @param request the request object
       */
      sendVerificationEmail: opts.emailVerification?.sendVerificationEmail,
      /**
       * Send a verification email automatically
       * on sign in when the user's email is not verified
       *
       * @default false
       */
      sendOnSignIn: opts.emailVerification?.sendOnSignIn,
      /**
       * Send a verification email automatically
       * after sign up
       *
       * @default false
       */
      sendOnSignUp: opts.emailVerification?.sendOnSignUp,
      /**
       * Auto signin the user after they verify their email
       */
      autoSignInAfterVerification: opts.emailVerification?.autoSignInAfterVerification,
      /**
       * Number of seconds the verification token is
       * valid for.
       * @default 3600 seconds (1 hour)
       */
      expiresIn: opts.emailVerification?.expiresIn,
      /**
       * A function that is called when a user verifies their email
       * @param user the user that verified their email
       * @param request the request object
       */
      onEmailVerification: opts.emailVerification?.onEmailVerification,
      /**
       * A function that is called when a user's email is updated to verified
       * @param user the user that verified their email
       * @param request the request object
       */
      afterEmailVerification: opts.emailVerification?.afterEmailVerification,
    },
    /**
     * Email and password authentication
     */
    /**
     * Email and password authentication
     */
    emailAndPassword: {
      /**
       * Enable email and password authentication
       *
       * @default false
       */
      enabled: opts.emailAndPassword?.enabled ?? false,
      /**
       * Disable email and password sign up
       *
       * @default false
       */
      disableSignUp: opts.emailAndPassword?.disableSignUp,
      /**
       * Require email verification before a session
       * can be created for the user.
       *
       * if the user is not verified, the user will not be able to sign in
       * and on sign in attempts, the user will be prompted to verify their email.
       */
      requireEmailVerification: opts.emailAndPassword?.requireEmailVerification,
      /**
       * The maximum length of the password.
       *
       * @default 128
       */
      maxPasswordLength: opts.emailAndPassword?.maxPasswordLength,
      /**
       * The minimum length of the password.
       *
       * @default 8
       */
      minPasswordLength: opts.emailAndPassword?.minPasswordLength,
      /**
       * send reset password
       */
      sendResetPassword: opts.emailAndPassword?.sendResetPassword,
      /**
       * Number of seconds the reset password token is
       * valid for.
       * @default 1 hour (60 * 60)
       */
      resetPasswordTokenExpiresIn: opts.emailAndPassword?.resetPasswordTokenExpiresIn,
      /**
       * A callback function that is triggered
       * when a user's password is changed successfully.
       */
      onPasswordReset: opts.emailAndPassword?.onPasswordReset,
      /**
       * Password hashing and verification
       *
       * By default Scrypt is used for password hashing and
       * verification. You can provide your own hashing and
       * verification function. if you want to use a
       * different algorithm.
       */
      password: opts.emailAndPassword?.password,
      /**
       * Automatically sign in the user after sign up
       *
       * @default true
       */
      autoSignIn: opts.emailAndPassword?.autoSignIn,
      /**
       * Whether to revoke all other sessions when resetting password
       * @default false
       */
      revokeSessionsOnPasswordReset: opts.emailAndPassword?.revokeSessionsOnPasswordReset,
    },
    /**
     * list of social providers
     */
    socialProviders: opts.socialProviders,
    /**
     * User configuration
     * TODO: factor out the user config
     */
    user: opts.user,
    /**
     * Session configuration
     * TODO: factor out the session config
     */
    session: opts.session,
    /**
     * Account configuration
     * TODO: factor out the account config
     */
    account: opts.account,
    /**
     * Verification configuration
     * TODO: factor out the verification config
     */
    verification: opts.verification,
    /**
     * List of trusted origins.
     */
    trustedOrigins: opts.trustedOrigins,
    /**
     * Rate limiting configuration
     */
    rateLimit: {
      /**
       * By default, rate limiting is only
       * enabled on production.
       */
      enabled: opts.rateLimit?.enabled,
      /**
       * Default window to use for rate limiting. The value
       * should be in seconds.
       *
       * @default 10 seconds
       */
      window: opts.rateLimit?.window,
      /**
       * The default maximum number of requests allowed within the window.
       *
       * @default 100 requests
       */
      max: opts.rateLimit?.max,
      /**
       * Custom rate limit rules to apply to
       * specific paths.
       */
      customRules: opts.rateLimit?.customRules,
      /**
       * Storage configuration
       *
       * By default, rate limiting is stored in memory. If you passed a
       * secondary storage, rate limiting will be stored in the secondary
       * storage.
       *
       * @default "memory"
       */
      storage: opts.rateLimit?.storage,
      /**
       * If database is used as storage, the name of the table to
       * use for rate limiting.
       *
       * @default "rateLimit"
       */
      modelName: opts.rateLimit?.modelName,
      /**
       * Custom field names for the rate limit table
       */
      fields: opts.rateLimit?.fields,
      /**
       * custom storage configuration.
       *
       * NOTE: If custom storage is used storage
       * is ignored
       */
      customStorage: opts.rateLimit?.customStorage,
    },
    /**
     * Advanced options
     */
    advanced: {
      /**
       * Ip address configuration
       */
      ipAddress: {
        /**
         * List of headers to use for ip address
         *
         * Ip address is used for rate limiting and session tracking
         *
         * @example ["x-client-ip", "x-forwarded-for", "cf-connecting-ip"]
         *
         * @default
         * @link https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/utils/get-request-ip.ts#L8
         */
        ipAddressHeaders: opts.advanced?.ipAddress?.ipAddressHeaders,
        /**
         * Disable ip tracking
         *
         * ⚠︎ This is a security risk and it may expose your application to abuse
         */
        disableIpTracking: opts.advanced?.ipAddress?.disableIpTracking,
      },
      /**
       * Use secure cookies
       *
       * @default false
       */
      useSecureCookies: opts.advanced?.useSecureCookies ?? true,
      /**
       * Disable trusted origins check
       *
       * ⚠︎ This is a security risk and it may expose your application to CSRF attacks
       */
      disableCSRFCheck: opts.advanced?.disableCSRFCheck ?? false,
      /**
       * Configure cookies to be cross subdomains
       */
      crossSubDomainCookies: {
        /**
         * Enable cross subdomain cookies
         */
        enabled: opts.advanced?.crossSubDomainCookies?.enabled ?? false,
        /**
         * Additional cookies to be shared across subdomains
         */
        additionalCookies: opts.advanced?.crossSubDomainCookies?.additionalCookies,
        /**
         * The domain to use for the cookies
         *
         * By default, the domain will be the root
         * domain from the base URL.
         */
        domain: opts.advanced?.crossSubDomainCookies?.domain,
      },
      /*
       * Allows you to change default cookie names and attributes
       *
       * default cookie names:
       * - "session_token"
       * - "session_data"
       * - "dont_remember"
       *
       * plugins can also add additional cookies
       */
      cookies: opts.advanced?.cookies,
      defaultCookieAttributes: opts.advanced?.defaultCookieAttributes,
      /**
       * Prefix for cookies. If a cookie name is provided
       * in cookies config, this will be overridden.
       *
       * @default
       * ```txt
       * "appName" -> which defaults to "better-auth"
       * ```
       */
      cookiePrefix: opts.advanced?.cookiePrefix,
      /**
       * Database configuration.
       */
      database: {
        /**
         * The default number of records to return from the database
         * when using the `findMany` adapter method.
         *
         * @default 100
         */
        defaultFindManyLimit: opts.advanced?.database?.defaultFindManyLimit,
        /**
         * If your database auto increments number ids, set this to `true`.
         *
         * Note: If enabled, we will not handle ID generation (including if you use `generateId`), and it would be expected that your database will provide the ID automatically.
         *
         * @default false
         */
        useNumberId: opts.advanced?.database?.useNumberId,
        /**
         * Custom generateId function.
         *
         * If not provided, random ids will be generated.
         * If set to false, the database's auto generated id will be used.
         */
        generateId: opts.advanced?.database?.generateId,
      },
    },
    logger: opts.logger,
    /**
     * allows you to define custom hooks that can be
     * executed during lifecycle of core database
     * operations.
     * TODO factor out database hooks
     */
    databaseHooks: opts.databaseHooks,
    /**
     * API error handling
     * TODO factor out API error handling
     */
    onAPIError: opts.onAPIError,
    /**
     * Hooks
     */
    hooks: {
      /**
       * Before a request is processed
       */
      before: opts.hooks?.before,
      /**
       * After a request is processed
       */
      after: opts.hooks?.after,
    },
    /**
     * Disabled paths
     *
     * Paths you want to disable.
     */
    disabledPaths: opts.disabledPaths,
    /**
     * Telemetry configuration
     */
    telemetry: {
      /**
       * Enable telemetry collection
       *
       * @default true
       */
      enabled: opts.telemetry?.enabled,
      /**
       * Enable debug mode
       *
       * @default false
       */
      debug: opts.telemetry?.debug,
    },
  }) satisfies BetterAuthOptions;

export type AuthOptions = ReturnType<typeof makeOptions>;
